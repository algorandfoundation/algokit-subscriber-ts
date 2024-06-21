// From: https://github.com/algorandfoundation/nft_voting_tool/blob/develop/src/dapp/src/shared/IPFSGateway.ts

export enum VoteType {
  NO_SNAPSHOT = 0,
  NO_WEIGHTING = 1,
  WEIGHTING = 2,
  PARTITIONED_WEIGHTING = 3,
}

/** A discrete opportunity for vote casters to participate in a vote for a given context, this may consist of one or more questions */
export interface VotingRoundMetadata {
  id: string
  /**
   * Metadata Semantic Version
   */
  version?: string
  type: VoteType
  title: string
  description?: string
  /** Optional URL link to more information */
  informationUrl?: string
  /** Start of voting round as an ISO8601 string */
  start: string
  /** End of voting round as an ISO8601 string */
  end: string
  /** Optional quorum of participants for a valid result */
  quorum?: number
  /** The optional IPFS content ID of the vote gating snapshot used for this voting round */
  voteGatingSnapshotCid?: string
  /** The questions being voted on as part of the voting round */
  questions: Question[]
  created: CreatedMetadata
  /** The total amount allocated for the community grants program aka xGov
   * this is optional for backwards compatibility
   */
  communityGrantAllocation?: number
}

export interface Question {
  /** UUID of the question */
  id: string
  /** The question prompt text */
  prompt: string
  description?: string
  metadata?: {
    link?: string
    category?: string
    focus_area?: string
    threshold?: number
    ask?: number
  }
  options: Option[]
}

export interface Option {
  /** UUID of the option */
  id: string
  /** The text description of the option */
  label: string
}

export interface VoteGatingSnapshot {
  title: string
  /**
   * Snapshot Semantic Version
   */
  version?: string
  /** Base 64 encoded public key corresponding to the ephemeral private key that was created to secure this snapshot */
  publicKey: string
  created: CreatedMetadata
  /** The snapshot of vote gates */
  snapshot: Gate[]
}

export interface Gate {
  /** Address of the account that is gated to vote */
  address: string
  /** The vote weighting of the account that is gated to vote */
  weight?: number
  /** Base 64 encoded signature of `{address}{weight(uint64)|string}` with the private key of this using ED25519 */
  signature: string
}

export interface CreatedMetadata {
  /** When the record was created, in ISO8601 format */
  at: string
  /** Account address of the creator */
  by: string
}
