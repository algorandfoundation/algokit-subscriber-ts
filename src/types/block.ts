import type { SignedTxnWithAD } from '@algorandfoundation/algokit-utils/algod-client'
import type { Transaction } from '@algorandfoundation/algokit-utils/transact'

/** The representation of all important data for a single transaction or inner transaction
 * and its side effects within a committed block.
 */
export interface TransactionInBlock {
  // Raw data

  /** The signed transaction with apply data from the block */
  signedTxnWithAD: SignedTxnWithAD

  // Processed data
  /** The transaction ID
   *
   * @example
   *  - W6IG6SETWKISJV4JQSS6GNZGWKYXOOLH7FT3NQM4BIFRLCOXOQHA if it's a parent transaction
   *  - W6IG6SETWKISJV4JQSS6GNZGWKYXOOLH7FT3NQM4BIFRLCOXOQHA/inner/1 if it's an inner transaction
   */
  transactionId: string
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
  intraRoundOffset: number
  /**
   * The intra-round offset of the parent transaction if this is an inner transaction.
   * @example
   *  - 0
   *  - 1
   *    - 1
   *    - 1
   *      - 1
   *  - 2
   */
  parentIntraRoundOffset?: number
  /**
   * The ID of the parent transaction if this is an inner transaction.
   */
  parentTransactionId?: string
  /** The binary genesis hash of the network the transaction is within. */
  genesisHash?: Buffer
  /** The string genesis ID of the network the transaction is within. */
  genesisId?: string
  /** The round number of the block the transaction is within. */
  roundNumber: bigint
  /** The round unix timestamp of the block the transaction is within. */
  roundTimestamp: number
  /** The transaction as a `Transaction` object. */
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
