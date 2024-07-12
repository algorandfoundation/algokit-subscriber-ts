import type { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'
import { Arc28EventGroup, EmittedArc28Event } from './arc-28'
import TransactionType = algosdk.TransactionType

/** The result of a single subscription pull/poll. */
export interface TransactionSubscriptionResult {
  /** The round range that was synced from/to */
  syncedRoundRange: [startRound: number, endRound: number]
  /** The current detected tip of the configured Algorand blockchain. */
  currentRound: number
  /** The watermark value that was retrieved at the start of the subscription poll. */
  startingWatermark: number
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
  /** The base64 block hash. */
  hash?: string
  /** The round of the block. */
  round: number
  /** Block creation timestamp in seconds since epoch */
  timestamp: number
  /** The genesis ID of the chain. */
  genesisId: string
  /** The base64 genesis hash of the chain. */
  genesisHash: string
  /** The base64 previous block hash. */
  previousBlockHash?: string
  /** The base64 seed of the block. */
  seed: string
  /** Fields relating to rewards */
  rewards?: BlockRewards
  /** Count of parent transactions in this block */
  parentTransactionCount: number
  /** Full count of transactions and inner transactions (recursively) in this block. */
  fullTransactionCount: number
  /** Number of the next transaction that will be committed after this block.  It is 0 when no transactions have ever been committed (since TxnCounter started being supported). */
  txnCounter: number
  /** TransactionsRoot authenticates the set of transactions appearing in the block. More specifically, it's the root of a merkle tree whose leaves are the block's Txids, in lexicographic order. For the empty block, it's 0. Note that the TxnRoot does not authenticate the signatures on the transactions, only the transactions themselves. Two blocks with the same transactions but in a different order and with different signatures will have the same TxnRoot.
  Pattern : "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==\|[A-Za-z0-9+/]{3}=)?$" */
  transactionsRoot: string
  /** TransactionsRootSHA256 is an auxiliary TransactionRoot, built using a vector commitment instead of a merkle tree, and SHA256 hash function instead of the default SHA512_256. This commitment can be used on environments where only the SHA256 function exists. */
  transactionsRootSha256: string
  /** Fields relating to a protocol upgrade. */
  upgradeState?: BlockUpgradeState
  /** Tracks the status of state proofs. */
  stateProofTracking?: BlockStateProofTracking[]
  /** Fields relating to voting for a protocol upgrade. */
  upgradeVote?: BlockUpgradeVote
  /** Participation account data that needs to be checked/acted on by the network. */
  participationUpdates?: ParticipationUpdates
}

export interface BlockRewards {
  /** FeeSink is an address that accepts transaction fees, it can only spend to the incentive pool. */
  feeSink: string
  /** number of leftover MicroAlgos after the distribution of rewards-rate MicroAlgos for every reward unit in the next round. */
  rewardsCalculationRound: number
  /** How many rewards, in MicroAlgos, have been distributed to each RewardUnit of MicroAlgos since genesis. */
  rewardsLevel: number
  /** RewardsPool is an address that accepts periodic injections from the fee-sink and continually redistributes them as rewards. */
  rewardsPool: string
  /** Number of new MicroAlgos added to the participation stake from rewards at the next round. */
  rewardsRate: number
  /** Number of leftover MicroAlgos after the distribution of RewardsRate/rewardUnits MicroAlgos for every reward unit in the next round. */
  rewardsResidue: number | bigint
}

export interface BlockUpgradeState {
  /** Current protocol version */
  currentProtocol: string
  /** The next proposed protocol version. */
  nextProtocol?: string
  /** Number of blocks which approved the protocol upgrade. */
  nextProtocolApprovals?: number
  /** Deadline round for this protocol upgrade (No votes will be consider after this round). */
  nextProtocolVoteBefore?: number
  /** Round on which the protocol upgrade will take effect. */
  nextProtocolSwitchOn?: number
}

export interface BlockStateProofTracking {
  /**
   * (n) Next round for which we will accept a state proof transaction.
   */
  nextRound?: number

  /**
   * (t) The total number of microalgos held by the online accounts during the
   * StateProof round.
   */
  onlineTotalWeight?: number

  /**
   * State Proof Type. Note the raw object uses map with this as key.
   */
  type?: number

  /**
   * (v) Root of a vector commitment containing online accounts that will help sign
   * the proof.
   */
  votersCommitment?: string
}

export interface BlockUpgradeVote {
  /**
   * (upgradeyes) Indicates a yes vote for the current proposal.
   */
  upgradeApprove?: boolean

  /**
   * (upgradedelay) Indicates the time between acceptance and execution.
   */
  upgradeDelay?: number | bigint

  /**
   * (upgradeprop) Indicates a proposed upgrade.
   */
  upgradePropose?: string
}

export interface ParticipationUpdates {
  /**
   * (partupabs) a list of online accounts that need to be suspended.
   */
  absentParticipationAccounts?: string[]

  /**
   * (partupdrmv) a list of online accounts that needs to be converted to offline
   * since their participation key expired.
   */
  expiredParticipationAccounts?: string[]
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
  /** Account was creating an asset and holds the full asset supply */
  AssetCreator = 'AssetCreator',
  /** Account was destroying an asset and has removed the full asset supply from circulation.
   * A balance change with this role will always have a 0 amount and use the asset manager address.
   */
  AssetDestroyer = 'AssetDestroyer',
}

/** Metadata about an impending subscription poll. */
export interface BeforePollMetadata {
  /** The current watermark of the subscriber */
  watermark: number
  /** The current round of algod */
  currentRound: number
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

  /** The current tip of the configured Algorand blockchain.
   * If not provided, it will be resolved on demand.
   */
  currentRound?: number
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

export type ErrorListener = (error: unknown) => Promise<void> | void
