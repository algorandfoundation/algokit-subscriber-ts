import { EncodedTransaction } from 'algosdk'

/** Data that is returned in a raw Algorand block
 *
 * @see https://github.com/algorand/go-algorand/blob/master/data/bookkeeping/block.go#L32
 */
export interface Block {
  /** RewardsLevel specifies how many rewards, in MicroAlgos, have
   * been distributed to each config.Protocol.RewardUnit of MicroAlgos
   * since genesis.
   **/
  earn: number
  /** The FeeSink accepts transaction fees. It can only spend to the incentive pool. */
  fees: Uint8Array
  /** The number of leftover MicroAlgos after the distribution of RewardsRate/rewardUnits
   * MicroAlgos for every reward unit in the next round.
   **/
  frac: number
  /** Genesis ID to which this block belongs. */
  gen: string
  /** Genesis hash to which this block belongs. */
  gh: Uint8Array
  /** The hash of the previous block */
  prev: Uint8Array
  /** UpgradeState tracks the protocol upgrade state machine; proto is the current protocol. */
  proto: string
  /** The number of new MicroAlgos added to the participation stake from rewards at the next round. */
  rate: number
  /** Round number. */
  rnd: number
  /** The round at which the RewardsRate will be recalculated. */
  rwcalr: number
  /** The RewardsPool accepts periodic injections from the
   * FeeSink and continually redistributes them to addresses as rewards.
   **/
  rwd: Uint8Array
  /** Sortition seed */
  seed: Uint8Array
  /** TxnCounter is the number of the next transaction that will be
   * committed after this block.  Genesis blocks can start at either
   * 0 or 1000, depending on a consensus parameter (AppForbidLowResources).
   **/
  tc: number
  /** Round time (unix timestamp) */
  ts: number
  /** Root of transaction merkle tree using SHA512_256 hash function.
   * This commitment is computed based on the PaysetCommit type specified in the block's consensus protocol.
   **/
  txn: Uint8Array
  /**
   * Root of transaction vector commitment merkle tree using SHA256 hash function.
   */
  txn256: string
  /** The transactions within the block. */
  txns: BlockTransaction[]
}

export interface BlockTransaction {
  /** The encoded transaction data */
  txn: EncodedTransaction
  /** The eval deltas for the block */
  dt?: BlockTransactionEvalDelta
  /** Asset ID when an asset is created by the transaction */
  caid?: number
  /** App ID when an app is created by the transaction */
  apid?: number
  /** Asset closing amount in decimal units */
  aca?: number
  /** Algo closing amount in microAlgos */
  ca?: number
  /** Has genesis id */
  hgi: boolean
  /** Has genesis hash */
  hgh?: boolean
}

/** Eval deltas for a block */
export interface BlockTransactionEvalDelta {
  /** The delta of global state, keyed by key */
  gd: Record<string, BlockValueDelta>
  /** The delta of local state keyed by account ID offset in [txn.Sender, ...txn.Accounts] and then keyed by key */
  ld: Record<number, Record<string, BlockValueDelta>>
  /** Logs */
  lg: string[]
  /** Inner transactions */
  itx?: Omit<BlockTransaction, 'hgi' | 'hgh'>[]
}

export interface BlockValueDelta {
  /** DeltaAction is an enum of actions that may be performed when applying a delta to a TEAL key/value store:
   *   * `1`: SetBytesAction indicates that a TEAL byte slice should be stored at a key
   *   * `2`: SetUintAction indicates that a Uint should be stored at a key
   *   * `3`: DeleteAction indicates that the value for a particular key should be deleted
   **/
  at: number

  /** Bytes value */
  bs?: Uint8Array

  /** Uint64 value */
  ui?: number
}
