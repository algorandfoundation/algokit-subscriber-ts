import algosdk from 'algosdk'
import Transaction = algosdk.Transaction

/**
 * Data that is returned in a raw Algorand block.
 */
export interface BlockData {
  /** The block itself. */
  block: Block
  /** The block certification. */
  cert: BlockAgreementCertificate
}

/** Data this is returned in a raw Algorand block to certify the block.
 *
 * @see https://github.com/algorand/go-algorand/blob/master/agreement/certificate.go
 * @see https://github.com/algorand/go-algorand/blob/master/agreement/bundle.go#L31
 * @see https://github.com/algorand/go-algorand/blob/master/agreement/proposal.go
 */
export interface BlockAgreementCertificate {
  /** Round number */
  rnd: number
  /** Period represents the current period of the source. */
  per: bigint
  /** Step represents the current period of the source. */
  step: number
  /** The proposal */
  prop: {
    /** Original proposer */
    oprop: Uint8Array
    /** Block digest */
    dig: Uint8Array
    /** Encoding digest (the cryptographic hash of the proposal) */
    encdig: Uint8Array
  }
  /** Votes */
  vote: BlockVote[]
  /** Equivocation votes */
  eqv: BlockVote[]
}

/** A vote within a block certificate.
 *
 * @see https://github.com/algorand/go-algorand/blob/master/agreement/vote.go
 */
export interface BlockVote {
  /** Sender of the vote */
  snd: Uint8Array
  /** Committee credential
   *
   * @see https://github.com/algorand/go-algorand/blob/master/data/committee/credential.go
   */
  cred: {
    /** VRF proof of the credential */
    pf: Uint8Array
  }
  /** One-time signature
   *
   * @see https://github.com/algorand/go-algorand/blob/master/crypto/onetimesig.go
   */
  sig: {
    /** ED25519 public key */
    p: Uint8Array
    /** Old-style signature that does not use proper domain separation (unused, appears as 0 value). */
    ps: Uint8Array
    /** PK1Sig is a ED25519 signature of OneTimeSignatureSubkeyOffsetID(PK, Batch, Offset) under the key PK2. */
    p1s: Uint8Array
    /** Used to verify a new-style two-level ephemeral signature; PK2 is an ED25519 public key. */
    p2: Uint8Array
    /** PK2Sig is a ED25519 signature of OneTimeSignatureSubkeyBatchID(PK2, Batch) under the master key (OneTimeSignatureVerifier). */
    p2s: Uint8Array
    /** Sig is a signature of msg under the key PK. */
    s: Uint8Array
  }[]
}

/** Data that is returned in a raw Algorand block.
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
  frac: number | bigint
  /** Genesis ID to which this block belongs. */
  gen: string
  /** Genesis hash to which this block belongs. */
  gh: Uint8Array
  /** The hash of the previous block */
  prev?: Uint8Array
  /** UpgradeState tracks the protocol upgrade state machine; proto is the current protocol. */
  proto: string
  /** The number of new MicroAlgos added to the participation stake from rewards at the next round. */
  rate?: number
  /** Round number. */
  rnd: bigint | number
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
   * This value is only set when there are transactions in the block.
   **/
  txn?: Uint8Array
  /**
   * Root of transaction vector commitment merkle tree using SHA256 hash function.
   */
  txn256: string
  /**
   * The next proposed protocol version.
   */
  nextproto?: string
  /**
   * Number of blocks which approved the protocol upgrade.
   */
  nextyes?: number
  /**
   * Deadline round for this protocol upgrade (No votes will be considered after this round).
   */
  nextbefore?: number
  /**
   * Round on which the protocol upgrade will take effect.
   */
  nextswitch?: number
  /**
   * The transactions within the block.
   */
  txns?: BlockTransaction[]
  /**
   * AbsentParticipationAccounts contains a list of online accounts that
   * needs to be converted to offline since they are not proposing.
   */
  partupdabs?: Uint8Array[]
  /**
   * ExpiredParticipationAccounts contains a list of online accounts that needs to be
   * converted to offline since their participation key expired.
   */
  partupdrmv?: Uint8Array[]
  /**
   *  UpgradeApprove indicates a yes vote for the current proposal
   */
  upgradeyes?: boolean
  /**
   *  UpgradeDelay indicates the time between acceptance and execution
   */
  upgradedelay?: number
  /**
   *  UpgradePropose indicates a proposed upgrade
   */
  upgradeprop?: string

  spt?: Record<number, StateProofTracking>
  /**
   * Proposer is the proposer of this block.
   */
  prp?: Uint8Array
}

/** Data that is returned in a raw Algorand block for a single transaction
 *
 * @see https://github.com/algorand/go-algorand/blob/master/data/transactions/signedtxn.go#L32
 */
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
  hgi?: boolean
  /** Has genesis hash */
  hgh?: boolean
  /** Transaction ED25519 signature */
  sig?: Uint8Array
  /** Logic signature */
  lsig?: LogicSig
  /** Transaction multisig signature */
  msig?: MultisigSig
  /** The signer, if signing with a different key than the Transaction type `from` property indicates */
  sgnr?: Uint8Array
}

/** Data that represents a multisig signature
 * @see https://github.com/algorand/go-algorand/blob/master/data/transactions/logicsig.go#L32
 */
export interface LogicSig {
  /** Logic sig code */
  l: Uint8Array
  /** ED25519 signature for delegated operations */
  sig?: Uint8Array
  /** Multisig signature for delegated operations */
  msig?: MultisigSig
  /** Arguments passed into the logic signature */
  arg?: Buffer[]
}

/** Data that represents a multisig signature
 * @see https://github.com/algorand/go-algorand/blob/master/crypto/multisig.go#L36
 */
export interface MultisigSig {
  /** Multisig version */
  v: number
  /** Multisig threshold */
  thr: number
  /** Sub-signatures */
  subsig: {
    /** ED25519 public key */
    pk: Uint8Array
    /** ED25519 signature */
    s?: Uint8Array
  }[]
}

/** Data that is returned in a raw Algorand block for a single inner transaction */
export type BlockInnerTransaction = Omit<BlockTransaction, 'hgi' | 'hgh'>

/** Eval deltas for a block */
export interface BlockTransactionEvalDelta {
  /** The delta of global state, keyed by key */
  gd: Record<string, BlockValueDelta>
  /** The delta of local state keyed by account ID offset in [txn.Sender, ...txn.Accounts] and then keyed by key */
  ld: Record<number, Record<string, BlockValueDelta>>
  /** Logs */
  lg: Uint8Array[]
  /** Inner transactions */
  itx?: BlockInnerTransaction[]
}

/** A value delta as a result of a block transaction */
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

interface Proof {
  hsh: { t: number }
  pth?: Uint8Array[]
  td?: number
}

// https://github.com/algorand/go-algorand-sdk/blob/develop/types/stateproof.go
export interface StateProof {
  c: Uint8Array
  P: Proof
  pr: number[]
  r: Map<
    number,
    {
      p: { p: { cmt: Uint8Array; lf: number }; w: bigint }
      s: {
        l?: bigint
        s: {
          idx: number
          prf: Proof
          sig: Uint8Array
          vkey: { k: Uint8Array }
        }
      }
    }
  >
  S: Proof
  w: bigint
  v?: number
}

export interface StateProofMessage {
  b: Uint8Array
  f: number
  l: number
  P: bigint
  v: Uint8Array
}

export interface StateProofTracking {
  /** StateProofVotersCommitment is the root of a vector commitment containing the
   * online accounts that will help sign a state proof.  The VC root, and the state proof,
   * happen on blocks that are a multiple of ConsensusParams.StateProofRounds.
   * For blocks that are not a multiple of ConsensusParams.StateProofRounds, this value is zero.
   */
  v?: string
  /** StateProofOnlineTotalWeight is the total number of microalgos held by the online accounts
   * during the StateProof round (or zero, if the merkle root is zero - no commitment for StateProof voters).
   * This is intended for computing the threshold of votes to expect from StateProofVotersCommitment.
   */
  t?: number
  /**
   * StateProofNextRound is the next round for which we will accept a StateProof transaction.
   */
  n?: number
}

/** The representation of all important data for a single transaction or inner transaction
 * and its side effects within a committed block.
 */
export interface TransactionInBlock {
  // Raw data

  /** The block data for the transaction */
  blockTransaction: BlockTransaction | BlockInnerTransaction
  /** The offset of the transaction within the round including inner transactions.
   *
   * @example
   *  - 0
   *  - 1
   *    - 2
   *    - 3
   *      - 4
   *  - 5
   */
  roundOffset: number
  /**
   * The index within the block.txns array of this transaction or if it's an inner transaction of it's ultimate parent transaction.
   *
   * @example
   *  - 0
   *  - 1
   *    - 1
   *    - 1
   *      - 1
   *  - 2
   */
  roundIndex: number
  /**
   * The ID of the parent transaction if this is an inner transaction.
   */
  parentTransactionId?: string
  /**
   * The offset within the parent transaction.
   *
   * @example
   *  - `undefined`
   *  - `undefined`
   *    - 0
   *    - 1
   *      - 2
   *  - `undefined`
   */
  parentOffset?: number
  /** The binary genesis hash of the network the transaction is within. */
  genesisHash: Buffer
  /** The string genesis ID of the network the transaction is within. */
  genesisId: string
  /** The round number of the block the transaction is within. */
  roundNumber: bigint
  /** The round unix timestamp of the block the transaction is within. */
  roundTimestamp: number

  // Processed data

  /** The transaction as an algosdk `Transaction` object. */
  transaction: Transaction
  /** The asset ID if an asset was created from this transaction. */
  createdAssetId?: bigint
  /** The app ID if an app was created from this transaction. */
  createdAppId?: bigint
  /** The asset close amount if the sender asset position was closed from this transaction. */
  assetCloseAmount?: bigint
  /** The ALGO close amount if the sender account was closed from this transaction. */
  closeAmount?: bigint
  /** Any logs that were issued as a result of this transaction. */
  logs?: Uint8Array[]
  /** Rewards in microalgos applied to the close remainder to account. */
  closeRewards?: bigint
  /** Rewards in microalgos applied to the sender account. */
  senderRewards?: bigint
  /** Rewards in microalgos applied to the receiver account. */
  receiverRewards?: bigint
}

/**
 * Interfaces for the encoded transaction object. Every property is labelled with its associated Transaction type property
 */
export interface EncodedAssetParams {
  /**
   * assetTotal
   */
  t: number
  /**
   * assetDefaultFrozen
   */
  df: boolean
  /**
   * assetDecimals
   */
  dc: number
  /**
   * assetManager
   */
  m?: Buffer
  /**
   * assetReserve
   */
  r?: Buffer
  /**
   * assetFreeze
   */
  f?: Buffer
  /**
   * assetClawback
   */
  c?: Buffer
  /**
   * assetName
   */
  an?: string
  /**
   * assetUnitName
   */
  un?: string
  /**
   * assetURL
   */
  au?: string
  /**
   * assetMetadataHash
   */
  am?: Buffer
}
export interface EncodedLocalStateSchema {
  /**
   * appLocalInts
   */
  nui: number
  /**
   * appLocalByteSlices
   */
  nbs: number
}
export interface EncodedGlobalStateSchema {
  /**
   * appGlobalInts
   */
  nui: number
  /**
   * appGlobalByteSlices
   */
  nbs: number
}
export interface EncodedBoxReference {
  /**
   * index of the app ID in the foreign apps array
   */
  i: number
  /**
   * box name
   */
  n: Uint8Array
}
/**
 * A rough structure for the encoded transaction object. Every property is labelled with its associated Transaction type property
 */
export interface EncodedTransaction {
  /**
   * fee
   */
  fee?: number

  /**
   * firstRound
   */
  fv?: bigint | number

  /**
   * lastRound
   */
  lv: bigint | number

  /**
   * note
   */
  note?: Buffer

  /**
   * from
   */
  snd: Buffer

  /**
   * type
   */
  type: string

  /**
   * genesisID
   */
  gen: string

  /**
   * genesisHash
   */
  gh: Buffer

  /**
   * lease
   */
  lx?: Buffer

  /**
   * group
   */
  grp?: Buffer

  /**
   * amount
   */
  amt?: number | bigint

  /**
   * amount (but for asset transfers)
   */
  aamt?: number | bigint

  /**
   * closeRemainderTo
   */
  close?: Buffer

  /**
   * closeRemainderTo (but for asset transfers)
   */
  aclose?: Buffer

  /**
   * reKeyTo
   */
  rekey?: Buffer

  /**
   * to
   */
  rcv?: Buffer

  /**
   * to (but for asset transfers)
   */
  arcv?: Buffer

  /**
   * voteKey
   */
  votekey?: Buffer

  /**
   * selectionKey
   */
  selkey?: Buffer

  /**
   * stateProofKey
   */
  sprfkey?: Buffer

  /**
   * voteFirst
   */
  votefst?: number

  /**
   * voteLast
   */
  votelst?: number

  /**
   * voteKeyDilution
   */
  votekd?: number

  /**
   * nonParticipation
   */
  nonpart?: boolean

  /**
   * assetIndex
   */
  caid?: number

  /**
   * assetIndex (but for asset transfers)
   */
  xaid?: number

  /**
   * assetIndex (but for asset freezing/unfreezing)
   */
  faid?: number

  /**
   * freezeState
   */
  afrz?: boolean

  /**
   * freezeAccount
   */
  fadd?: Buffer

  /**
   * assetRevocationTarget
   */
  asnd?: Buffer

  /**
   * See EncodedAssetParams type
   */
  apar?: EncodedAssetParams

  /**
   * appIndex
   */
  apid?: number

  /**
   * appOnComplete
   */
  apan?: number

  /**
   * See EncodedLocalStateSchema type
   */
  apls?: EncodedLocalStateSchema

  /**
   * See EncodedGlobalStateSchema type
   */
  apgs?: EncodedGlobalStateSchema

  /**
   * appForeignApps
   */
  apfa?: number[]

  /**
   * appForeignAssets
   */
  apas?: number[]

  /**
   * appApprovalProgram
   */
  apap?: Buffer

  /**
   * appClearProgram
   */
  apsu?: Buffer

  /**
   * appArgs
   */
  apaa?: Buffer[]

  /**
   * appAccounts
   */
  apat?: Buffer[]

  /**
   * extraPages
   */
  apep?: number

  /**
   * boxes
   */
  apbx?: EncodedBoxReference[]

  /*
   * stateProofType
   */
  sptype?: number | bigint

  /**
   * stateProof
   */
  sp?: EncodedStateProof

  /**
   * stateProofMessage
   */
  spmsg?: EncodedStateProofMessage
}

export interface EncodedStateProof {
  /**
   * sigCommit
   */
  c: Buffer
  /**
   * sigWeight
   */
  w: bigint

  /**
   * sigProofs
   */
  S: EncodedMerkleArrayProof

  /**
   * partProofs
   */
  P: EncodedMerkleArrayProof

  /**
   * merkleSignatureSaltVersion
   */
  v?: number

  /**
   * reveal
   */
  r: Map<bigint, EncodedReveal>

  /**
   * positionsToReveal
   */
  pr: bigint[]
}

export interface EncodedMerkleArrayProof {
  /**
   * path
   */
  pth: Buffer[]

  /**
   * hash
   */
  hsh: EncodedHashFactory

  /**
   * tree depth
   */
  td: number
}

export interface EncodedHashFactory {
  /**
   * hash type
   */
  t: number
}

export interface EncodedReveal {
  /**
   * sigslot
   */
  s: EncodedSigslotCommit

  /**
   * participant
   */
  p: EncodedParticipant
}

export interface EncodedSigslotCommit {
  /**
   * sig
   */
  sig: EncodedFalconSignatureStruct

  /**
   * l
   */
  l: bigint
}

export interface EncodedFalconSignatureStruct {
  /**
   * signature
   */
  sig: Buffer

  /**
   * vectorCommitmentIndex
   */
  idx: bigint

  /**
   * proof
   */
  prf: EncodedMerkleArrayProof

  /**
   * verifyingKey
   */
  vkey: EncodedFalconVerifier
}

export interface EncodedFalconVerifier {
  /**
   * public key
   */
  k: Buffer
}

export interface EncodedParticipant {
  /**
   * pk
   */
  p: EncodedMerkleSignatureVerifier

  /**
   * weight
   */
  w: bigint
}

export interface EncodedMerkleSignatureVerifier {
  /**
   * commitment
   */
  cmt: Buffer

  /**
   * keyLifetime
   */
  lf: bigint
}

export interface EncodedStateProofMessage {
  /**
   * blockHeadersCommitment
   */
  b: Buffer

  /**
   * votersCommitment
   */
  v: Buffer

  /**
   * lnProvenWeight
   */
  P: bigint

  /**
   * firstAttestedRound
   */
  f: bigint

  /**
   * lastAttestedRound
   */
  l: bigint
}
