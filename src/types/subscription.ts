import type { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'
import { Arc28EventGroup, EmittedArc28Event } from './arc-28'
import { TransactionInBlock } from './block'
import TransactionType = algosdk.TransactionType

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
   * the synced round range. This substantively uses the [indexer transaction
   * format](https://developer.algorand.org/docs/rest-apis/indexer/#transaction)
   * to represent the data with some additional fields.
   */
  subscribedTransactions: SubscribedTransaction[]
  /** The metadata about any blocks that were retrieved from algod as part
   * of the subscription poll.
   */
  blockMetadata?: BlockMetadata[]
}

/** Metadata about a block that was retrieved from algod. */
export interface BlockMetadata {
  hash?: string
  /** The round of the block. */
  round: number
  /** The ISO 8601 timestamp of the block. */
  timestamp: string
  /** The genesis ID of the chain. */
  genesisId: string
  /** The base64 genesis hash of the chain. */
  genesisHash: string
  /** The previous block hash. */
  previousBlockHash?: string
  /** The base64 seed of the block. */
  seed?: string
  /** Count of parent transactions in this block */
  parentTransactionCount: number
  /** Full count of transactions and inner transactions (recursively) in this block. */
  fullTransactionCount: number
}

/** The common model used to expose a transaction that is returned from a subscription.
 *
 * Substantively, based on the Indexer  [`TransactionResult` model](https://developer.algorand.org/docs/rest-apis/indexer/#transaction) format with some modifications to:
 * * Add the `parentTransactionId` field so inner transactions have a reference to their parent
 * * Override the type of `inner-txns` to be `SubscribedTransaction[]` so inner transactions (recursively) get these extra fields too
 * * Add emitted ARC-28 events via `arc28Events`
 * * Balance changes in algo or assets
 */
export type SubscribedTransaction = TransactionResult & {
  /** The transaction ID of the parent of this transaction (if it's an inner transaction). */
  parentTransactionId?: string
  /** Inner transactions produced by application execution. */
  'inner-txns'?: SubscribedTransaction[]
  /** Any ARC-28 events emitted from an app call. */
  arc28Events?: EmittedArc28Event[]
  /** The names of any filters that matched the given transaction to result in it being 'subscribed'. */
  filtersMatched?: string[]
  /** The balance changes in the transaction. */
  balanceChanges?: BalanceChange[]
}

/** Represents a balance change effect for a transaction. */
export interface BalanceChange {
  /** The address that the balance change is for. */
  address: string
  /** The asset ID of the balance change, or 0 for Algos. */
  assetId: number
  /** The amount of the balance change in smallest divisible unit or microAlgos. */
  amount: bigint
  /** The roles the account was playing that led to the balance change */
  roles: BalanceChangeRole[]
}

/** The role that an account was playing for a given balance change. */
export enum BalanceChangeRole {
  /** Account was sending a transaction (sending asset and/or spending fee if asset `0`) */
  Sender = 'Sender',
  /** Account was receiving a transaction */
  Receiver = 'Receiver',
  /** Account was having an asset amount closed to it */
  CloseTo = 'CloseTo',
}

/** Metadata about an impending subscription poll. */
export interface BeforeSubscriptionPollMetadata {
  /** The current watermark of the subscriber */
  watermark: number
  /** The current round of algod */
  currentRound: number
}

/** Metadata needed to conduct a single subscription poll. */
export interface SubscriptionPollMetadata {
  /** The range of rounds to sync using algod; if undefined then algod sync not needed. */
  algodSyncRange?: [startRound: number, endRound: number]
  /** The range of rounds to sync using indexer; if undefined then indexer sync not needed. */
  indexerSyncRange?: [startRound: number, endRound: number]
  /** The range of rounds being synced. */
  syncedRoundRange: [startRound: number, endRound: number]
  /** The new watermark to persist after this poll is complete. */
  newWatermark: number
  /** The current round according to algod when the poll was started. */
  currentRound: number
  /** The full set of transactions from algod for `algodSyncRange` or `undefined` if `algodSyncRange` is `undefined. */
  blockTransactions?: TransactionInBlock[]
  /** The set of ARC-28 event groups to process against the subscribed transactions */
  arc28EventGroups: Arc28EventGroup[]
  /** The metadata about any blocks that were retrieved from algod as part
   * of the subscription poll.
   */
  blockMetadata?: BlockMetadata[]
}

/** Common parameters to control a single subscription pull/poll for both `AlgorandSubscriber` and `getSubscribedTransactions`. */
export interface CoreTransactionSubscriptionParams {
  /** The filter(s) to apply to find transactions of interest.
   * A list of filters with corresponding names.
   *
   * @example
   * ```typescript
   *  filter: [{
   *   name: 'asset-transfers',
   *   filter: {
   *     type: TransactionType.axfer,
   *     //...
   *   }
   *  }, {
   *   name: 'payments',
   *   filter: {
   *     type: TransactionType.pay,
   *     //...
   *   }
   *  }]
   * ```
   *
   */
  filters: NamedTransactionFilter[]
  /** Any ARC-28 event definitions to process from app call logs */
  arc28Events?: Arc28EventGroup[]
  /** The maximum number of rounds to sync from algod for each subscription pull/poll.
   *
   * Defaults to 500.
   *
   * This gives you control over how many rounds you wait for at a time,
   * your staleness tolerance when using `skip-sync-newest` or `fail`, and
   * your catchup speed when using `sync-oldest`.
   **/
  maxRoundsToSync?: number
  /**
   * The maximum number of rounds to sync from indexer when using `syncBehaviour: 'catchup-with-indexer'.
   *
   * By default there is no limit and it will paginate through all of the rounds.
   * Sometimes this can result in an incredibly long catchup time that may break the service
   * due to execution and memory constraints, particularly for filters that result in a large number of transactions.
   *
   * Instead, this allows indexer catchup to be split into multiple polls, each with a transactionally consistent
   * boundary based on the number of rounds specified here.
   */
  maxIndexerRoundsToSync?: number
  /** If the current tip of the configured Algorand blockchain is more than `maxRoundsToSync`
   * past `watermark` then how should that be handled:
   *  * `skip-sync-newest`: Discard old blocks/transactions and sync the newest; useful
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
  syncBehaviour: 'skip-sync-newest' | 'sync-oldest' | 'sync-oldest-start-now' | 'catchup-with-indexer' | 'fail'
}

/** Specify a named filter to apply to find transactions of interest. */
export interface NamedTransactionFilter {
  /** The name to give the filter. */
  name: string
  /** The filter itself. */
  filter: TransactionFilter
}

/** Specify a filter to apply to find transactions of interest. */
export interface TransactionFilter {
  /** Filter based on the given transaction type(s). */
  type?: TransactionType | TransactionType[]
  /** Filter to transactions sent from the specified address(es). */
  sender?: string | string[]
  /** Filter to transactions being received by the specified address(es). */
  receiver?: string | string[]
  /** Filter to transactions with a note having the given prefix. */
  notePrefix?: string
  /** Filter to transactions against the app with the given ID(s). */
  appId?: number | number[] | bigint | bigint[]
  /** Filter to transactions that are creating an app. */
  appCreate?: boolean
  /** Filter to transactions that have given on complete(s). */
  appOnComplete?: ApplicationOnComplete | ApplicationOnComplete[]
  /** Filter to transactions against the asset with the given ID(s). */
  assetId?: number | number[] | bigint | bigint[]
  /** Filter to transactions that are creating an asset. */
  assetCreate?: boolean
  /** Filter to transactions where the amount being transferred is greater
   * than or equal to the given minimum (microAlgos or decimal units of an ASA if type: axfer). */
  minAmount?: number | bigint
  /** Filter to transactions where the amount being transferred is less than
   * or equal to the given maximum (microAlgos or decimal units of an ASA if type: axfer). */
  maxAmount?: number | bigint
  /** Filter to app transactions that have the given ARC-0004 method selector(s) for
   * the given method signature as the first app argument. */
  methodSignature?: string | string[]
  /** Filter to app transactions that meet the given app arguments predicate. */
  appCallArgumentsMatch?: (appCallArguments?: Uint8Array[]) => boolean
  /** Filter to app transactions that emit the given ARC-28 events.
   * Note: the definitions for these events must be passed in to the subscription config via `arc28Events`.
   */
  arc28Events?: { groupName: string; eventName: string }[]
  /** Filter to transactions that result in balance changes that match one or more of the given set of balance changes. */
  balanceChanges?: {
    /** Match transactions with balance changes for one of the given asset ID(s), with Algo being `0` */
    assetId?: number | number[] | bigint | bigint[]
    /** Match transactions with balance changes for an account with one of the given role(s) */
    role?: BalanceChangeRole | BalanceChangeRole[]
    /** Match transactions with balance changes affecting one of the given account(s) */
    address?: string | string[]
    /** Match transactions with absolute (i.e. using Math.abs()) balance changes being greater than or equal to the given minimum (microAlgos or decimal units of an ASA) */
    minAbsoluteAmount?: number | bigint
    /** Match transactions with absolute (i.e. using Math.abs()) balance changes being less than or equal to the given maximum (microAlgos or decimal units of an ASA) */
    maxAbsoluteAmount?: number | bigint
    /** Match transactions with balance changes being greater than or equal to the given minimum (microAlgos or decimal units of an ASA) */
    minAmount?: number | bigint
    /** Match transactions with balance changes being less than or equal to the given maximum (microAlgos or decimal units of an ASA) */
    maxAmount?: number | bigint
  }[]
  /** Catch-all custom filter to filter for things that the rest of the filters don't provide. */
  customFilter?: (transaction: SubscribedTransaction) => boolean
}

/** Parameters to control a single subscription pull/poll. */
export interface TransactionSubscriptionParams extends CoreTransactionSubscriptionParams {
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
}

/** A function that returns a set of filters based on a given filter state and hierarchical poll level. */
export type DynamicFilterLambda<T> = (state: T, pollLevel: number, watermark: number) => Promise<SubscriberConfigFilter<unknown>[]>

/** Configuration for a `DynamicAlgorandSubscriber` */
export interface DynamicAlgorandSubscriberConfig<T> extends Omit<AlgorandSubscriberConfig, 'filters'> {
  /**
   * A function that returns a set of filters based on a given filter state and hierarchical poll level.
   * @param state The filter state to return filters for
   * @param pollLevel The hierarchical poll level; starts at 0 and increments by 1 each time a new poll is needed because of filter changes caused by the previous poll
   * @param watermark The current watermark being processed
   * @returns The set of filters to subscribe to / emit events for
   */
  dynamicFilters: DynamicFilterLambda<T>

  /** Methods to retrieve and persist the current filter state so syncing is resilient */
  filterStatePersistence: {
    /** Returns the current filter state that syncing has previously been processed to */
    get: () => Promise<T>
    /** Persist the new filter state that has been created */
    set: (newState: T) => Promise<void>
  }
  /** The frequency to poll for new blocks in seconds; defaults to 1s */
  frequencyInSeconds?: number
  /** Whether to wait via algod `/status/wait-for-block-after` endpoint when at the tip of the chain; reduces latency of subscription */
  waitForBlockWhenAtTip?: boolean
}

/** Configuration for an `AlgorandSubscriber`. */
export interface AlgorandSubscriberConfig extends CoreTransactionSubscriptionParams {
  /** The set of filters to subscribe to / emit events for, along with optional data mappers. */
  filters: SubscriberConfigFilter<unknown>[]
  /** The frequency to poll for new blocks in seconds; defaults to 1s */
  frequencyInSeconds?: number
  /** Whether to wait via algod `/status/wait-for-block-after` endpoint when at the tip of the chain; reduces latency of subscription */
  waitForBlockWhenAtTip?: boolean
  /** Methods to retrieve and persist the current watermark so syncing is resilient and maintains
   * its position in the chain */
  watermarkPersistence: {
    /** Returns the current watermark that syncing has previously been processed to */
    get: () => Promise<number>
    /** Persist the new watermark that has been processed */
    set: (newWatermark: number) => Promise<void>
  }
}

/** A single event to subscribe to / emit. */
export interface SubscriberConfigFilter<T> extends NamedTransactionFilter {
  /** An optional data mapper if you want the event data to take a certain shape when subscribing to events with this filter name.
   *
   * If not specified, then the event will simply receive a `SubscribedTransaction`.
   *
   * Note: if you provide multiple filters with the same name then only the mapper of the first matching filter will be used
   */
  mapper?: (transaction: SubscribedTransaction[]) => Promise<T[]>
}

export type TypedAsyncEventListener<T> = (event: T, eventName: string | symbol) => Promise<void> | void
