import { Config } from '@algorandfoundation/algokit-utils'
import type { AlgodClient, BlockResponse } from '@algorandfoundation/algokit-utils/algod-client'
import { chunkArray, range } from './utils'

/**
 * Retrieves blocks in bulk (30 at a time) between the given round numbers.
 * @param context The blocks to retrieve
 * @param client The algod client
 * @returns The blocks
 */
export async function getBlocksBulk(context: { startRound: bigint; maxRound: bigint }, client: AlgodClient) {
  // Grab 30 at a time in parallel to not overload the node
  const blockChunks = chunkArray(range(context.startRound, context.maxRound), 30)
  let blocks: BlockResponse[] = []
  for (const chunk of blockChunks) {
    Config.logger.info(`Retrieving ${chunk.length} blocks from round ${chunk[0]} via algod`)
    const start = +new Date()
    blocks = blocks.concat(
      await Promise.all(
        chunk.map(async (round) => {
          return await client.getBlock(round)
        }),
      ),
    )
    Config.logger.debug(`Retrieved ${chunk.length} blocks from round ${chunk[0]} via algod in ${(+new Date() - start) / 1000}s`)
  }
  return blocks
}
