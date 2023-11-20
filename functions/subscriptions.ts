import * as algokit from '@algorandfoundation/algokit-utils'
import { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Algodv2, Indexer, Transaction, TransactionType, encodeAddress } from 'algosdk'
import type SearchForTransactions from 'algosdk/dist/types/client/v2/indexer/searchForTransactions'
import {
  Block,
  algodOnCompleteToIndexerOnComplete,
  getAlgodTransactionFromBlockTransaction,
  getIndexerTransactionFromAlgodTransaction,
} from './block'
import { chunkArray, range } from './utils'

/** Parameters to control a single subscription pull/poll. */
export interface TransactionSubscriptionParams {
  /** The filter to apply to find transactions of interest. */
  filter: TransactionFilter
  /** The current round watermark that transactions have previously been synced to.
   *
   * Persist this value as you process transactions processed from this method
   * to allow for resilient and incremental syncing.
   *
   * Syncing will start from `watermark + 1`.
   *
   * Start from 0 if you want to start from the beginning of time, noting that
   * will be slow if `onMaxRounds` is `sync-oldest`.
   **/
  watermark: number
  /** The maximum number of rounds to sync for each subscription pull/poll.
   *
   * This gives you control over how many rounds you wait for at a time,
   * your staleness tolerance when using `skip-to-newest` or `fail`, and
   * your catchup speed when using `sync-oldest`.
   **/
  maxRoundsToSync: number
  /** If the current tip of the configured Algorand blockchain is more than `maxRoundsToSync`
   * past `watermark` then how should that be handled:
   *  * `skip-to-newest`: Discard old blocks/transactions and sync the newest; useful
   *    for real-time notification scenarios where you don't care about history and
   *    are happy to lose old transactions.
   *  * `sync-oldest`: Sync from the oldest rounds forward `maxRoundsToSync` rounds
   *    using algod; note: this will be slow if you are starting from 0 and requires
   *    an archival node.
   *  * `sync-oldest-start-now`: Same as `sync-oldest`, but if the `watermark` is `0`
   *    then start at the current round i.e. don't sync historical records, but once
   *    subscribing starts sync everything; note: if it falls behind it requires an
   *    archival node.
   *  * `catchup-with-indexer`: Sync to round `currentRound - maxRoundsToSync + 1`
   *    using indexer (much faster than using algod for long time periods) and then
   *    use algod from there.
   *  * `fail`: Throw an error.
   **/
  onMaxRounds: 'skip-to-newest' | 'sync-oldest' | 'sync-oldest-start-now' | 'catchup-with-indexer' | 'fail'
}

/** Specify a filter to apply to find transactions of interest. */
export interface TransactionFilter {
  /** Filter based on the given transaction type. */
  type?: TransactionType
  /** Filter to transactions sent from the specified address. */
  sender?: string
  /** Filter to transactions being received by the specified address. */
  receiver?: string
  /** Filter to transactions with a note having the given prefix. */
  notePrefix?: string
  /** Filter to transactions against the app with the given ID. */
  appId?: number
  /** Filter to transactions that are creating an app. */
  appCreate?: boolean
  /** Filter to transactions that have given on complete(s). */
  appOnComplete?: ApplicationOnComplete | ApplicationOnComplete[]
  /** Filter to transactions against the asset with the given ID. */
  assetId?: number
  /** Filter to transactions that are creating an asset. */
  assetCreate?: boolean
  /** Filter to transactions where the amount being transferred is greater
   * than or equal to the given minimum (microAlgos or decimal units of an ASA). */
  minAmount?: number
  /** Filter to transactions where the amount being transferred is less than
   * or equal to the given maximum (microAlgos or decimal units of an ASA). */
  maxAmount?: number
}

/** The result of a single subscription pull/poll. */
export interface TransactionSubscriptionResult {
  /** The round range that was synced from/to */
  syncedRoundRange: [startRound: number, endRound: number]
  /** The current detected tip of the configured Algorand blockchain. */
  currentRound: number
  /** The new watermark value to persist for the next call to
   * `getSubscribedTransactions` to continue the sync.
   * Will be equal to `syncedRoundRange[1]`. Only persist this
   * after processing (or in the same atomic transaction as)
   * subscribed transactions to keep it reliable. */
  newWatermark: number
  /** Any transactions that matched the given filter within
   * the synced round range. This uses the [indexer transaction
   * format](https://developer.algorand.org/docs/rest-apis/indexer/#transaction)
   * to represent the data.
   */
  subscribedTransactions: TransactionResult[]
}

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
  const { watermark, filter, maxRoundsToSync, onMaxRounds } = subscription
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

  if (currentRound - algodSyncFromRoundNumber > maxRoundsToSync) {
    switch (onMaxRounds) {
      case 'fail':
        throw new Error(`Invalid round number to subscribe from ${algodSyncFromRoundNumber}; current round number is ${currentRound}`)
      case 'skip-to-newest':
        algodSyncFromRoundNumber = currentRound - maxRoundsToSync + 1
        startRound = algodSyncFromRoundNumber
        break
      case 'sync-oldest':
        endRound = algodSyncFromRoundNumber + maxRoundsToSync - 1
        break
      case 'sync-oldest-start-now':
        if (watermark === 0) {
          algodSyncFromRoundNumber = currentRound - 1
        } else {
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
  const blocks = await getBlocks(algod, { startRound: algodSyncFromRoundNumber, maxRound: endRound })
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
    return result
  }
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
    return result
  }
}

async function getBlocks(client: Algodv2, context: { startRound: number; maxRound: number }) {
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
