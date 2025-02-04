import { Config } from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'
import { chunkArray, range } from './utils'
import Algodv2 = algosdk.Algodv2
import { TransactionInBlock } from './types'

/**
 * Retrieves blocks in bulk (30 at a time) between the given round numbers.
 * @param context The blocks to retrieve
 * @param client The algod client
 * @returns The blocks
 */
export async function getBlocksBulk(context: { startRound: bigint; maxRound: bigint }, client: Algodv2) {
  // Grab 30 at a time in parallel to not overload the node
  const blockChunks = chunkArray(range(context.startRound, context.maxRound), 30)
  let blocks: algosdk.modelsv2.BlockResponse[] = []
  for (const chunk of blockChunks) {
    Config.logger.info(`Retrieving ${chunk.length} blocks from round ${chunk[0]} via algod`)
    const start = +new Date()
    blocks = blocks.concat(
      await Promise.all(
        chunk.map(async (round) => {
          return await client.block(round).do()
        }),
      ),
    )
    Config.logger.debug(`Retrieved ${chunk.length} blocks from round ${chunk[0]} via algod in ${(+new Date() - start) / 1000}s`)
  }
  return blocks
}

/**
 * Gets the synthetic transaction for the block payout as defined in the indexer
 *
 * @see https://github.com/algorand/indexer/blob/084577338ad4882f5797b3e1b30b84718ad40333/idb/postgres/internal/writer/write_txn.go?plain=1#L180-L202
 */

export function getTransactionFromBlockPayout(block: algosdk.modelsv2.BlockResponse): TransactionInBlock {
  const pay = new algosdk.Transaction({
    type: algosdk.TransactionType.pay,
    sender: block.block.header.rewardState.feeSink,
    note: new Uint8Array(Buffer.from(`ProposerPayout for Round ${block.block.header.round}`)),
    suggestedParams: {
      firstValid: block.block.header.round,
      lastValid: block.block.header.round,
      genesisID: block.block.header.genesisID,
      genesisHash: block.block.header.genesisHash,
      fee: 0n,
      minFee: 0n,
    },
    paymentParams: {
      receiver: block.block.header.proposer,
      amount: block.block.header.proposerPayout,
    },
  })

  const txn: TransactionInBlock = {
    transactionId: pay.txID(),
    roundTimestamp: Number(block.block.header.timestamp),
    transaction: pay,
    intraRoundOffset: 0,
    roundNumber: block.block.header.round,
    signedTxnWithAD: new algosdk.SignedTxnWithAD({
      applyData: new algosdk.ApplyData({}),
      signedTxn: new algosdk.SignedTransaction({ txn: pay }),
    }),
  }

  return txn
}
