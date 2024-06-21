import * as algokit from '@algorandfoundation/algokit-utils'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'
import fs from 'fs'
import path from 'path'
import { AlgorandSubscriber } from '../../src/subscriber'
import TransactionType = algosdk.TransactionType

if (!fs.existsSync(path.join(__dirname, '..', '..', '.env')) && !process.env.ALGOD_SERVER) {
  // eslint-disable-next-line no-console
  console.error('Copy /.env.sample to /.env before starting the application.')
  process.exit(1)
}

interface DHMAsset {
  id: number
  name: string
  unit: string
  mediaUrl: string
  metadata: Record<string, unknown>
  created: string
  lastModified: string
}

async function getDHMSubscriber() {
  const algod = await algokit.getAlgoClient()
  const indexer = await algokit.getAlgoIndexerClient()
  const subscriber = new AlgorandSubscriber(
    {
      filters: [
        {
          name: 'dhm-asset',
          filter: {
            type: TransactionType.acfg,
            // Data History Museum creator accounts
            sender: (await algokit.isTestNet(algod))
              ? 'ER7AMZRPD5KDVFWTUUVOADSOWM4RQKEEV2EDYRVSA757UHXOIEKGMBQIVU'
              : 'EHYQCYHUC6CIWZLBX5TDTLVJ4SSVE4RRTMKFDCG4Z4Q7QSQ2XWIQPMKBPU',
          },
        },
      ],
      frequencyInSeconds: 5,
      maxRoundsToSync: 100,
      syncBehaviour: 'catchup-with-indexer',
      watermarkPersistence: {
        get: getLastWatermark,
        set: saveWatermark,
      },
    },
    algod,
    indexer,
  )
  subscriber.onBatch('dhm-asset', async (events) => {
    // eslint-disable-next-line no-console
    console.log(`Received ${events.length} asset changes`)
    // Save all of the Data History Museum Verifiably Authentic Digital Historical Artifacts
    await saveDHMTransactions(events)
  })
  return subscriber
}

function getArc69Metadata(t: TransactionResult) {
  let metadata = {}
  try {
    if (t.note && t.note.startsWith('ey')) metadata = JSON.parse(Buffer.from(t.note, 'base64').toString('utf-8'))
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return metadata
}

async function saveDHMTransactions(transactions: TransactionResult[]) {
  const assets = await getSavedTransactions<DHMAsset>('dhm-assets.json')

  for (const t of transactions) {
    if (t['created-asset-index']) {
      assets.push({
        id: t['created-asset-index'],
        name: t['asset-config-transaction']!.params!.name!,
        unit: t['asset-config-transaction']!.params!['unit-name']!,
        mediaUrl: t['asset-config-transaction']!.params!.url!,
        metadata: getArc69Metadata(t),
        created: new Date(t['round-time']! * 1000).toISOString(),
        lastModified: new Date(t['round-time']! * 1000).toISOString(),
      })
    } else {
      const asset = assets.find((a) => a.id === t['asset-config-transaction']!['asset-id'])
      if (!asset) {
        // eslint-disable-next-line no-console
        console.error(t)
        throw new Error(`Unable to find existing asset data for ${t['asset-config-transaction']!['asset-id']}`)
      }
      if (!t['asset-config-transaction']!.params) {
        // Asset was deleted, remove it
        assets.splice(assets.indexOf(asset), 1)
      } else {
        asset!.metadata = getArc69Metadata(t)
        asset!.lastModified = new Date(t['round-time']! * 1000).toISOString()
      }
    }
  }

  await saveTransactions(assets, 'dhm-assets.json')
}

// Basic methods that persist using filesystem - for illustrative purposes only

async function saveWatermark(watermark: number) {
  fs.writeFileSync(path.join(__dirname, 'watermark.txt'), watermark.toString(), { encoding: 'utf-8' })
}

async function getLastWatermark(): Promise<number> {
  if (!fs.existsSync(path.join(__dirname, 'watermark.txt'))) return 0
  const existing = fs.readFileSync(path.join(__dirname, 'watermark.txt'), 'utf-8')
  // eslint-disable-next-line no-console
  console.log(`Found existing sync watermark in watermark.txt; syncing from ${existing}`)
  return Number(existing)
}

async function getSavedTransactions<T>(fileName: string): Promise<T[]> {
  const existing = fs.existsSync(path.join(__dirname, fileName))
    ? (JSON.parse(fs.readFileSync(path.join(__dirname, fileName), 'utf-8')) as T[])
    : []
  return existing
}

async function saveTransactions(transactions: unknown[], fileName: string) {
  fs.writeFileSync(path.join(__dirname, fileName), JSON.stringify(transactions, undefined, 2), { encoding: 'utf-8' })
  // eslint-disable-next-line no-console
  console.log(`Saved ${transactions.length} transactions to ${fileName}`)
}

;(async () => {
  const subscriber = await getDHMSubscriber()

  if (process.env.RUN_LOOP === 'true') {
    // Restart on error
    const maxRetries = 3
    let retryCount = 0
    subscriber.onError(async (e) => {
      retryCount++
      if (retryCount > maxRetries) {
        // eslint-disable-next-line no-console
        console.error(e)
        return
      }
      // eslint-disable-next-line no-console
      console.log(`Error occurred, retrying in 2 seconds (${retryCount}/${maxRetries})`)
      await new Promise((r) => setTimeout(r, 2_000))
      subscriber.start()
    })

    subscriber.start()
    ;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
      process.on(signal, () => {
        // eslint-disable-next-line no-console
        console.log(`Received ${signal}; stopping subscriber...`)
        subscriber.stop(signal)
      }),
    )
  } else {
    await subscriber.pollOnce()
  }
})().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
})
