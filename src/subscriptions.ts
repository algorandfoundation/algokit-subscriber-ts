import * as algokit from '@algorandfoundation/algokit-utils'
import type { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import * as msgpack from 'algorand-msgpack'
import { Algodv2, Indexer, Transaction, encodeAddress } from 'algosdk'
import type SearchForTransactions from 'algosdk/dist/types/client/v2/indexer/searchForTransactions'
import sha512 from 'js-sha512'
import { algodOnCompleteToIndexerOnComplete, getBlockTransactions, getIndexerTransactionFromAlgodTransaction } from './transform'
import type { Block } from './types/block'
import type {
  SubscribedTransaction,
  TransactionFilter,
  TransactionSubscriptionParams,
  TransactionSubscriptionResult,
} from './types/subscription'
import { chunkArray, range } from './utils'

/**
 * Executes a single pull/poll to subscribe to transactions on the configured Algorand
 * blockchain for the given subscription context.
 * @param subscription The subscription context.
 * @param algod An Algod client.
 * @param indexer An optional indexer client, only needed when `onMaxRounds` is `catchup-with-indexer`.
 * @returns The result of this subscription pull/poll.
 */
export async function getSubscribedTransactions(
  subscription: TransactionSubscriptionParams,
  algod: Algodv2,
  indexer?: Indexer,
): Promise<TransactionSubscriptionResult> {
  const { watermark, filter, maxRoundsToSync, syncBehaviour: onMaxRounds } = subscription
  const currentRound = (await algod.status().do())['last-round'] as number

  if (currentRound <= watermark) {
    return {
      currentRound: currentRound,
      newWatermark: watermark,
      subscribedTransactions: [],
      syncedRoundRange: [currentRound, currentRound],
    }
  }

  let algodSyncFromRoundNumber = watermark + 1
  let startRound = algodSyncFromRoundNumber
  let endRound = currentRound
  const catchupTransactions: SubscribedTransaction[] = []
  let start = +new Date()

  if (currentRound - watermark > maxRoundsToSync) {
    switch (onMaxRounds) {
      case 'fail':
        throw new Error(`Invalid round number to subscribe from ${algodSyncFromRoundNumber}; current round number is ${currentRound}`)
      case 'skip-sync-newest':
        algodSyncFromRoundNumber = currentRound - maxRoundsToSync + 1
        startRound = algodSyncFromRoundNumber
        break
      case 'sync-oldest':
        endRound = algodSyncFromRoundNumber + maxRoundsToSync - 1
        break
      case 'sync-oldest-start-now':
        // When watermark is 0 same behaviour as skip-sync-newest
        if (watermark === 0) {
          algodSyncFromRoundNumber = currentRound - maxRoundsToSync + 1
          startRound = algodSyncFromRoundNumber
        } else {
          // Otherwise same behaviour as sync-oldest
          endRound = algodSyncFromRoundNumber + maxRoundsToSync - 1
        }
        break
      case 'catchup-with-indexer':
        if (!indexer) {
          throw new Error("Can't catch up using indexer since it's not provided")
        }

        algodSyncFromRoundNumber = currentRound - maxRoundsToSync + 1

        algokit.Config.logger.debug(
          `Catching up from round ${startRound} to round ${algodSyncFromRoundNumber - 1} via indexer; this may take a few seconds`,
        )

        catchupTransactions.push(
          ...(await algokit.searchTransactions(indexer, indexerPreFilter(filter, startRound, algodSyncFromRoundNumber - 1))).transactions
            .flatMap((t) => getFilteredIndexerTransactions(t, filter))
            .filter(indexerPostFilter(filter))
            .sort((a, b) => a['confirmed-round']! - b['confirmed-round']! || a['intra-round-offset']! - b['intra-round-offset']!),
        )

        algokit.Config.logger.debug(
          `Retrieved ${catchupTransactions.length} transactions from round ${startRound} to round ${
            algodSyncFromRoundNumber - 1
          } via indexer in ${(+new Date() - start) / 1000}s`,
        )

        break
      default:
        throw new Error('Not implemented')
    }
  }

  start = +new Date()
  const blocks = await getBlocksBulk({ startRound: algodSyncFromRoundNumber, maxRound: endRound }, algod)
  algokit.Config.logger.debug(
    `Retrieved ${blocks.length} blocks from algod via round ${algodSyncFromRoundNumber}-${endRound} in ${(+new Date() - start) / 1000}s`,
  )

  return {
    syncedRoundRange: [startRound, endRound],
    newWatermark: endRound,
    currentRound,
    subscribedTransactions: catchupTransactions.concat(
      blocks
        .flatMap((b) => getBlockTransactions(b.block))
        .filter((t) => transactionFilter(filter, t!.createdAssetId, t!.createdAppId)(t!))
        .map((t) => getIndexerTransactionFromAlgodTransaction(t)),
    ),
  }
}

function indexerPreFilter(
  subscription: TransactionFilter,
  minRound: number,
  maxRound: number,
): (s: SearchForTransactions) => SearchForTransactions {
  return (s) => {
    // NOTE: everything in this method needs to be mirrored to `indexerPreFilterInMemory` below
    let filter = s
    if (subscription.sender) {
      filter = filter.address(subscription.sender).addressRole('sender')
    }
    if (subscription.receiver) {
      filter = filter.address(subscription.receiver).addressRole('receiver')
    }
    if (subscription.type) {
      filter = filter.txType(subscription.type.toString())
    }
    if (subscription.notePrefix) {
      filter = filter.notePrefix(Buffer.from(subscription.notePrefix).toString('base64'))
    }
    if (subscription.appId) {
      filter = filter.applicationID(subscription.appId)
    }
    if (subscription.assetId) {
      filter = filter.assetID(subscription.assetId)
    }
    if (subscription.minAmount) {
      filter = filter.currencyGreaterThan(subscription.minAmount - 1)
    }
    if (subscription.maxAmount) {
      filter = filter.currencyLessThan(subscription.maxAmount + 1)
    }
    return filter.minRound(minRound).maxRound(maxRound)
  }
}

function indexerPreFilterInMemory(subscription: TransactionFilter): (t: TransactionResult) => boolean {
  return (t) => {
    let result = true
    if (subscription.sender) {
      result &&= t.sender === subscription.sender
    }
    if (subscription.receiver) {
      result &&=
        (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction'].receiver === subscription.receiver) ||
        (!!t['payment-transaction'] && t['payment-transaction'].receiver === subscription.receiver)
    }
    if (subscription.type) {
      result &&= t['tx-type'] === subscription.type
    }
    if (subscription.notePrefix) {
      result &&= t.note ? Buffer.from(t.note, 'base64').toString('utf-8').startsWith(subscription.notePrefix) : false
    }
    if (subscription.appId) {
      result &&=
        t['created-application-index'] === subscription.appId ||
        (!!t['application-transaction'] && t['application-transaction']['application-id'] === subscription.appId)
    }
    if (subscription.assetId) {
      result &&=
        t['created-asset-index'] === subscription.assetId ||
        (!!t['asset-config-transaction'] && t['asset-config-transaction']['asset-id'] === subscription.assetId) ||
        (!!t['asset-freeze-transaction'] && t['asset-freeze-transaction']['asset-id'] === subscription.assetId) ||
        (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction']['asset-id'] === subscription.assetId)
    }

    if (subscription.minAmount) {
      result &&=
        (!!t['payment-transaction'] && t['payment-transaction'].amount >= subscription.minAmount) ||
        (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction'].amount >= subscription.minAmount)
    }
    if (subscription.maxAmount) {
      result &&=
        (!!t['payment-transaction'] && t['payment-transaction'].amount <= subscription.maxAmount) ||
        (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction'].amount <= subscription.maxAmount)
    }

    return result
  }
}

function indexerPostFilter(subscription: TransactionFilter): (t: TransactionResult) => boolean {
  return (t) => {
    let result = true
    if (subscription.assetCreate) {
      result &&= !!t['created-asset-index']
    } else if (subscription.assetCreate === false) {
      result &&= !t['created-asset-index']
    }
    if (subscription.appCreate) {
      result &&= !!t['created-application-index']
    } else if (subscription.appCreate === false) {
      result &&= !t['created-application-index']
    }
    if (subscription.appOnComplete) {
      result &&=
        !!t['application-transaction'] &&
        (typeof subscription.appOnComplete === 'string' ? [subscription.appOnComplete] : subscription.appOnComplete).includes(
          t['application-transaction']['on-completion'],
        )
    }
    if (subscription.methodSignature) {
      result &&=
        !!t['application-transaction'] &&
        !!t['application-transaction']['application-args'] &&
        t['application-transaction']['application-args'][0] === getMethodSelectorBase64(subscription.methodSignature)
    }
    if (subscription.methodSignatures) {
      subscription.methodSignatures.filter(
        (method) =>
          !!t['application-transaction'] &&
          !!t['application-transaction']['application-args'] &&
          t['application-transaction']['application-args'][0] === getMethodSelectorBase64(method),
      ).length > 0
        ? (result &&= true)
        : (result &&= false)
    }
    if (subscription.appCallArgumentsMatch) {
      result &&=
        !!t['application-transaction'] &&
        subscription.appCallArgumentsMatch(t['application-transaction']['application-args']?.map((a) => Buffer.from(a, 'base64')))
    }
    return result
  }
}

function getMethodSelectorBase64(methodSignature: string) {
  // todo: memoize?
  const hash = sha512.sha512_256.array(methodSignature)
  return Buffer.from(new Uint8Array(hash.slice(0, 4))).toString('base64')
}

function transactionFilter(
  subscription: TransactionFilter,
  createdAssetId?: number,
  createdAppId?: number,
): (t: { transaction: Transaction }) => boolean {
  return (txn) => {
    const { transaction: t } = txn
    let result = true
    if (subscription.sender) {
      result &&= !!t.from && encodeAddress(t.from.publicKey) === subscription.sender
    }
    if (subscription.receiver) {
      result &&= !!t.to && encodeAddress(t.to.publicKey) === subscription.receiver
    }
    if (subscription.type) {
      result &&= t.type === subscription.type
    }
    if (subscription.notePrefix) {
      result &&= !!t.note && new TextDecoder().decode(t.note).startsWith(subscription.notePrefix)
    }
    if (subscription.appId) {
      result &&= t.appIndex === subscription.appId || createdAppId === subscription.appId
    }
    if (subscription.assetId) {
      result &&= t.assetIndex === subscription.assetId || createdAssetId === subscription.assetId
    }
    if (subscription.minAmount) {
      result &&= t.amount >= subscription.minAmount
    }
    if (subscription.maxAmount) {
      result &&= t.amount <= subscription.maxAmount
    }
    if (subscription.assetCreate) {
      result &&= !!createdAssetId
    } else if (subscription.assetCreate === false) {
      result &&= !createdAssetId
    }
    if (subscription.appCreate) {
      result &&= !!createdAppId
    } else if (subscription.appCreate === false) {
      result &&= !createdAppId
    }
    if (subscription.appOnComplete) {
      result &&= (typeof subscription.appOnComplete === 'string' ? [subscription.appOnComplete] : subscription.appOnComplete).includes(
        algodOnCompleteToIndexerOnComplete(t.appOnComplete),
      )
    }
    if (subscription.methodSignature) {
      result &&= !!t.appArgs && Buffer.from(t.appArgs[0] ?? []).toString('base64') === getMethodSelectorBase64(subscription.methodSignature)
    }
    if (subscription.methodSignatures) {
      subscription.methodSignatures.filter(
        (method) => !!t.appArgs && Buffer.from(t.appArgs[0] ?? []).toString('base64') === getMethodSelectorBase64(method),
      ).length > 0
        ? (result &&= true)
        : (result &&= false)
    }
    if (subscription.appCallArgumentsMatch) {
      result &&= subscription.appCallArgumentsMatch(t.appArgs)
    }
    return result
  }
}

/**
 * Retrieves blocks in bulk (30 at a time) between the given round numbers.
 * @param context The blocks to retrieve
 * @param client The algod client
 * @returns The blocks
 */
export async function getBlocksBulk(context: { startRound: number; maxRound: number }, client: Algodv2) {
  // Grab 30 at a time in parallel to not overload the node
  const blockChunks = chunkArray(range(context.startRound, context.maxRound), 30)
  const blocks: { block: Block }[] = []
  for (const chunk of blockChunks) {
    algokit.Config.logger.info(`Retrieving ${chunk.length} blocks from round ${chunk[0]} via algod`)
    const start = +new Date()
    blocks.push(
      ...(await Promise.all(
        chunk.map(async (round) => {
          const response = await client.c.get(`/v2/blocks/${round}`, { format: 'msgpack' }, undefined, undefined, false)
          const body = response.body as Uint8Array
          const decodedWithMap = msgpack.decode(body, {
            intMode: msgpack.IntMode.AS_ENCODED,
            useMap: true,
            rawBinaryStringValues: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as Map<any, any>
          const decoded = blockMapToObject(decodedWithMap) as {
            block: Block
          }
          return decoded
        }),
      )),
    )
    algokit.Config.logger.debug(`Retrieved ${chunk.length} blocks from round ${chunk[0]} via algod in ${(+new Date() - start) / 1000}s`)
  }
  return blocks
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blockMapToObject(object: Map<any, any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: { [key: string]: any } = {}
  const decoder = new TextDecoder()
  for (const [key, value] of object) {
    if (key === 'r' && value instanceof Map) {
      // State proof transactions have a property `r` with a map with numeric keys that must stay intact
      const rMap = new Map()
      for (const [k, v] of value) {
        rMap.set(k, v instanceof Map ? blockMapToObject(v) : v)
      }
      result[key] = rMap
    } else if (value instanceof Map) {
      result[key] = blockMapToObject(value)
    } else if (value instanceof Uint8Array) {
      // The following have UTF-8 values
      result[key] = ['gen', 'proto', 'txn256', 'type', 'an', 'un', 'au'].includes(key) ? decoder.decode(value) : value
    } else if (value instanceof Array) {
      result[key] = value.map((v) => (v instanceof Map ? blockMapToObject(v) : v))
    } else {
      result[key] = value
    }
  }
  return result
}

/** Process an indexer transaction and return that transaction or any of it's inner transactions that meet the indexer pre-filter requirements; patching up transaction ID and intra-round-offset on the way through */
function getFilteredIndexerTransactions(transaction: TransactionResult, filter: TransactionFilter): SubscribedTransaction[] {
  let parentOffset = 0
  const getParentOffset = () => parentOffset++

  const transactions = [transaction, ...getIndexerInnerTransactions(transaction, transaction, getParentOffset)]
  return transactions.filter(indexerPreFilterInMemory(filter))
}

function getIndexerInnerTransactions(root: TransactionResult, parent: TransactionResult, offset: () => number): SubscribedTransaction[] {
  return (parent['inner-txns'] ?? []).flatMap((t) => {
    const parentOffset = offset()
    return [
      {
        ...t,
        parentTransactionId: root.id,
        id: `${root.id}/inner/${parentOffset + 1}`,
        'intra-round-offset': root['intra-round-offset']! + parentOffset + 1,
      },
      ...getIndexerInnerTransactions(root, t, offset),
    ]
  })
}
