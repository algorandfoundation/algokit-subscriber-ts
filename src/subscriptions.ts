import * as algokit from '@algorandfoundation/algokit-utils'
import type { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Algodv2, Indexer, Transaction, encodeAddress } from 'algosdk'
import type SearchForTransactions from 'algosdk/dist/types/client/v2/indexer/searchForTransactions'
import sha512 from 'js-sha512'
import {
  algodOnCompleteToIndexerOnComplete,
  getAlgodTransactionFromBlockTransaction,
  getIndexerTransactionFromAlgodTransaction,
} from './transform'
import type { Block } from './types/block'
import type { TransactionFilter, TransactionSubscriptionParams, TransactionSubscriptionResult } from './types/subscription'
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
  const catchupTransactions: TransactionResult[] = []
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
        .flatMap((b) => b.block.txns?.map((t) => getAlgodTransactionFromBlockTransaction(t, b.block)).filter((t) => !!t) ?? [])
        .filter((t) => transactionFilter(filter, t!.createdAssetId, t!.createdAppId)(t!))
        .map((t) =>
          getIndexerTransactionFromAlgodTransaction(
            t!.transaction,
            t!.block,
            t!.blockOffset,
            t?.createdAssetId,
            t?.createdAppId,
            t?.assetCloseAmount,
            t?.closeAmount,
          ),
        ),
    ),
  }
}

function indexerPreFilter(
  subscription: TransactionFilter,
  minRound: number,
  maxRound: number,
): (s: SearchForTransactions) => SearchForTransactions {
  return (s) => {
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
      filter = filter.notePrefix(subscription.notePrefix)
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
      result &&= !!t.to && encodeAddress(t.to.publicKey) === subscription.sender
    }
    if (subscription.type) {
      result &&= t.type === subscription.type
    }
    if (subscription.notePrefix) {
      result &&= !!t.note && new TextDecoder().decode(t.note).startsWith(subscription.notePrefix)
    }
    if (subscription.appId) {
      result &&= t.appIndex === subscription.appId
    }
    if (subscription.assetId) {
      result &&= t.assetIndex === subscription.assetId
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
          return (await client.block(round).do()) as { block: Block }
        }),
      )),
    )
    algokit.Config.logger.debug(`Retrieved ${chunk.length} blocks from round ${chunk[0]} via algod in ${(+new Date() - start) / 1000}s`)
  }
  return blocks
}
