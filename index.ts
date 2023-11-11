import * as algokit from '@algorandfoundation/algokit-utils'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionType } from 'algosdk'
import fs from 'fs'
import { getSubscribedTransactions } from './functions/subscriptions'

if (!fs.existsSync('.env') && !process.env.ALGOD_SERVER) {
  // eslint-disable-next-line no-console
  console.error('Copy .env.sample to .env before starting the application.')
  process.exit(1)
}

const run = async () => {
  const algod = await algokit.getAlgoClient()
  const indexer = await algokit.getAlgoIndexerClient()

  const watermark = await getLastWatermark()

  const transactions = await getSubscribedTransactions(
    {
      filter: {
        type: TransactionType.acfg,
        sender: (await algokit.isTestNet(algod))
          ? 'ER7AMZRPD5KDVFWTUUVOADSOWM4RQKEEV2EDYRVSA757UHXOIEKGMBQIVU'
          : 'EHYQCYHUC6CIWZLBX5TDTLVJ4SSVE4RRTMKFDCG4Z4Q7QSQ2XWIQPMKBPU',
      },
      watermark,
      maxRoundsToSync: 100,
      onMaxRounds: 'catchup-with-indexer',
    },
    algod,
    indexer,
  )

  // eslint-disable-next-line no-console
  console.log(
    `Found ${transactions.subscribedTransactions.length} transactions from rounds ${transactions.syncedRoundRange[0]}-${transactions.syncedRoundRange[1]}`,
  )

  if (transactions.subscribedTransactions.length > 0) {
    await saveDHMTransactions(transactions.subscribedTransactions)
  }

  await saveWatermark(transactions.newWatermark)
}

// Basic methods that persist using filesystem - for illustrative purposes only

async function getLastWatermark(): Promise<number> {
  if (!fs.existsSync('watermark.txt')) return 0
  const existing = fs.readFileSync('watermark.txt', 'utf-8')
  // eslint-disable-next-line no-console
  console.log(`Found existing sync watermark in watermark.txt; syncing from ${existing}`)
  return Number(existing)
}

async function saveWatermark(watermark: number) {
  fs.writeFileSync('watermark.txt', watermark.toString(), { encoding: 'utf-8' })
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

async function saveDHMTransactions(transactions: TransactionResult[]) {
  const getArc69Metadata = (t: TransactionResult) => {
    let metadata = {}
    try {
      if (t.note && t.note.startsWith('ey')) metadata = JSON.parse(Buffer.from(t.note, 'base64').toString('utf-8'))
      // eslint-disable-next-line no-empty
    } catch (e) {}
    return metadata
  }

  const assets = await getSavedTransactions<DHMAsset>()

  for (const t of transactions) {
    if (t['created-asset-index']) {
      assets.push({
        id: t['created-asset-index'],
        name: t['asset-config-transaction'].params.name!,
        unit: t['asset-config-transaction'].params['unit-name']!,
        mediaUrl: t['asset-config-transaction'].params.url!,
        metadata: getArc69Metadata(t),
        created: new Date(t['round-time']! * 1000).toISOString(),
        lastModified: new Date(t['round-time']! * 1000).toISOString(),
      })
    } else {
      const asset = assets.find((a) => a.id === t['asset-config-transaction']['asset-id'])
      if (!asset) {
        // eslint-disable-next-line no-console
        console.error(t)
        throw new Error(`Unable to find existing asset data for ${t['asset-config-transaction']['asset-id']}`)
      }
      if (!t['asset-config-transaction'].params) {
        // Asset was deleted, remove it
        assets.splice(assets.indexOf(asset), 1)
      } else {
        asset!.metadata = getArc69Metadata(t)
        asset!.lastModified = new Date(t['round-time']! * 1000).toISOString()
      }
    }
  }

  await saveTransactions(assets)
}

async function getSavedTransactions<T>(): Promise<T[]> {
  const existing = fs.existsSync('synced-transactions.json')
    ? (JSON.parse(fs.readFileSync('synced-transactions.json', 'utf-8')) as T[])
    : []
  return existing
}

async function saveTransactions(transactions: unknown[]) {
  fs.writeFileSync('synced-transactions.json', JSON.stringify(transactions, undefined, 2), { encoding: 'utf-8' })
  // eslint-disable-next-line no-console
  console.log(`Saved ${transactions.length} transactions to synced-transactions.json`)
}

;(async () => {
  if (process.env.RUN_LOOP === 'true') {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await run()
      await new Promise((resolve) => setTimeout(resolve, 4000))
    }
  } else {
    await run()
  }
})()
