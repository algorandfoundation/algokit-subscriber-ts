import type { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import type { ABIValue, TransactionType } from 'algosdk'

/**
 * The definition of metadata for an ARC-28 event per https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0028.md#event.
 */
export interface Arc28Event {
  /** The name of the event */
  name: string
  /** Optional, user-friendly description for the event */
  desc?: string
  /** The arguments of the event, in order */
  args: Array<{
    /** The type of the argument */
    type: string
    /** Optional, user-friendly name for the argument */
    name?: string
    /** Optional, user-friendly description for the argument */
    desc?: string
  }>
}

/** An ARC-28 event to be processed */
export interface Arc28EventToProcess {
  /** The name of the ARC-28 event group the event belongs to */
  groupName: string
  /** The name of the ARC-28 event that was triggered */
  eventName: string
  /** The signature of the event e.g. `EventName(type1,type2)` */
  eventSignature: string
  /** The 4-byte hex prefix for the event */
  eventPrefix: string
  /** The ARC-28 definition of the event */
  eventDefinition: Arc28Event
}

/** An emitted ARC-28 event extracted from an app call log. */
export interface EmittedArc28Event extends Arc28EventToProcess {
  /** The ordered arguments extracted from the event that was emitted */
  args: ABIValue[]
  /** The named arguments extracted from the event that was emitted (where the arguments had a name defined) */
  argsByName: Record<string, ABIValue>
}

/** Specifies a group of ARC-28 event definitions along with instructions for when to attempt to process the events. */
export interface Arc28EventGroup {
  /** The name to designate for this group of events. */
  groupName: string
  /** Optional list of app IDs that this event should apply to */
  processForAppIds?: number[]
  /** Optional predicate to indicate if these ARC-28 events should be processed for the given transaction */
  processTransaction?: (transaction: TransactionResult) => boolean
  /** Whether or not to silently (with warning log) continue if an error is encountered processing the ARC-28 event data; default = false */
  continueOnError?: boolean
  /** The list of ARC-28 event definitions */
  events: Arc28Event[]
}

/** The common model used to expose a transaction that is returned from a subscription.
 *
 * Substantively, based on the Indexer  [`TransactionResult` model](https://developer.algorand.org/docs/rest-apis/indexer/#transaction) format with some modifications to:
 * * Add the `parentTransactionId` field so inner transactions have a reference to their parent
 * * Override the type of `inner-txns` to be `SubscribedTransaction[]` so inner transactions (recursively) get these extra fields too
 * * Add emitted ARC-28 events via `arc28Events`
 */
export type SubscribedTransaction = TransactionResult & {
  /** The transaction ID of the parent of this transaction (if it's an inner transaction) */
  parentTransactionId?: string
  /** Inner transactions produced by application execution. */
  'inner-txns'?: SubscribedTransaction[]
  /** Any ARC-28 events emitted from an app call */
  arc28Events?: EmittedArc28Event[]
}

/** Parameters to control a single subscription pull/poll. */
export interface TransactionSubscriptionParams {
  /** The filter to apply to find transactions of interest. */
  filter: TransactionFilter
  /** Any ARC-28 event definitions to process from app call logs */
  arc28Events?: Arc28EventGroup[]
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
   * your staleness tolerance when using `skip-sync-newest` or `fail`, and
   * your catchup speed when using `sync-oldest`.
   **/
  maxRoundsToSync: number
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
   * than or equal to the given minimum (microAlgos or decimal units of an ASA if type: axfer). */
  minAmount?: number
  /** Filter to transactions where the amount being transferred is less than
   * or equal to the given maximum (microAlgos or decimal units of an ASA if type: axfer). */
  maxAmount?: number
  /** Filter to app transactions that have the given ARC-0004 method selector for
   * the given method signature as the first app argument. */
  methodSignature?: string
  /** Filter to app transactions that match one of the given ARC-0004 method selectors as the first app argument. */
  methodSignatures?: string[]
  /** Filter to app transactions that meet the given app arguments predicate. */
  appCallArgumentsMatch?: (appCallArguments?: Uint8Array[]) => boolean
  /** Filter to app transactions that emit the given ARC-28 events.
   * Note: the definitions for these events must be passed in to the subscription config via `arc28Events`.
   */
  arc28Events?: { groupName: string; eventName: string }[]
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
   * the synced round range. This substantively uses the [indexer transaction
   * format](https://developer.algorand.org/docs/rest-apis/indexer/#transaction)
   * to represent the data with some additional fields.
   */
  subscribedTransactions: SubscribedTransaction[]
}

/** Configuration for a subscription */
export interface SubscriptionConfig {
  /** The frequency to poll for new blocks in seconds; defaults to 1s */
  frequencyInSeconds?: number
  /** Whether to wait via algod `/status/wait-for-block-after` endpoint when at the tip of the chain; reduces latency of subscription */
  waitForBlockWhenAtTip?: boolean
  /** The maximum number of rounds to sync at a time; defaults to 500 */
  maxRoundsToSync?: number
  /** Any ARC-28 event definitions to process from app call logs */
  arc28Events?: Arc28EventGroup[]
  /** The set of events to subscribe to / emit */
  events: SubscriptionConfigEvent<unknown>[]
  /** The behaviour when the number of rounds to sync is greater than `maxRoundsToSync`:
   *  * `skip-sync-newest`: Discard old rounds.
   *  * `sync-oldest`: Sync from the oldest records up to `maxRoundsToSync` rounds.
   *
   *    **Note:** will be slow to catch up if sync is significantly behind the tip of the chain
   *  * `sync-oldest-start-now`: Sync from the oldest records up to `maxRoundsToSync` rounds, unless
   *    current watermark is `0` in which case it will start `maxRoundsToSync` back from the tip of the chain.
   *  * `catchup-with-indexer`: Will catch up to `tipOfTheChain - maxRoundsToSync` using indexer (fast) and then
   *    continue with algod.
   *  * `fail`: Throw an error.
   */
  syncBehaviour: 'skip-sync-newest' | 'sync-oldest' | 'sync-oldest-start-now' | 'catchup-with-indexer' | 'fail'
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
export interface SubscriptionConfigEvent<T> {
  /** Name / identifier to uniquely describe the event */
  eventName: string
  /** The transaction filter that determines if the event has occurred */
  filter: TransactionFilter
  /** An optional data mapper if you want the event data to take a certain shape.
   *
   * If not specified, then the event will receive a `SubscribedTransaction`.
   */
  mapper?: (transaction: SubscribedTransaction[]) => Promise<T[]>
}

export type TypedAsyncEventListener<T> = (event: T, eventName: string | symbol) => Promise<void> | void
