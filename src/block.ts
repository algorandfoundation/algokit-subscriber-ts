import { Config } from '@algorandfoundation/algokit-utils'
import * as msgpack from 'algorand-msgpack'
import algosdk from 'algosdk'
import { BlockData } from './types'
import { chunkArray, range } from './utils'
import Algodv2 = algosdk.Algodv2

/**
 * Retrieves blocks in bulk (30 at a time) between the given round numbers.
 * @param context The blocks to retrieve
 * @param client The algod client
 * @returns The blocks
 */
export async function getBlocksBulk(context: { startRound: number; maxRound: number }, client: Algodv2) {
  // Grab 30 at a time in parallel to not overload the node
  const blockChunks = chunkArray(range(context.startRound, context.maxRound), 30)
  let blocks: BlockData[] = []
  for (const chunk of blockChunks) {
    Config.logger.info(`Retrieving ${chunk.length} blocks from round ${chunk[0]} via algod`)
    const start = +new Date()
    blocks = blocks.concat(
      await Promise.all(
        chunk.map(async (round) => {
          const response = await client.c.get(`/v2/blocks/${round}`, { format: 'msgpack' }, undefined, undefined, false)
          const body = response.body as Uint8Array
          const decodedWithMap = msgpack.decode(body, {
            intMode: msgpack.IntMode.AS_ENCODED,
            useMap: true,
            rawBinaryStringValues: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as Map<any, any>
          const decoded = blockMapToObject(decodedWithMap)
          return decoded
        }),
      ),
    )
    Config.logger.debug(`Retrieved ${chunk.length} blocks from round ${chunk[0]} via algod in ${(+new Date() - start) / 1000}s`)
  }
  return blocks
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blockMapToObject(object: Map<any, any>): BlockData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: { [key: string]: any } = {}
  const decoder = new TextDecoder()
  for (const [key, value] of object) {
    if (key === 'r' && value instanceof Map) {
      // State proof transactions have a property `r` with a map with numeric keys that must stay intact
      const rMap = new Map()
      for (const [k, v] of value) {
        rMap.set(k, v instanceof Map ? blockMapToObject(v) : v)
      }
      result[key] = rMap
    } else if (value instanceof Map) {
      result[key] = blockMapToObject(value)
    } else if (value instanceof Uint8Array) {
      if (['txn256'].includes(key)) {
        // The above keys have non UTF-8 values
        result[key] = Buffer.from(value).toString('base64')
      } else if (['gen', 'proto', 'nextproto', 'type', 'an', 'un', 'au'].includes(key)) {
        // The above keys have UTF-8 values
        result[key] = decoder.decode(value)
      } else {
        result[key] = value
      }
    } else if (value instanceof Array) {
      result[key] = value.map((v) => (v instanceof Map ? blockMapToObject(v) : v))
    } else {
      result[key] = value
    }
  }
  return result as BlockData
}
