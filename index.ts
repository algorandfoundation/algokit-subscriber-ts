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
        sender: 'ER7AMZRPD5KDVFWTUUVOADSOWM4RQKEEV2EDYRVSA757UHXOIEKGMBQIVU',
        assetCreate: true,
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
    // You would need to implement saveTransactions to persist the transactions
    await saveTransactions(transactions.subscribedTransactions)
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

async function saveTransactions(transactions: TransactionResult[]) {
  const existing = fs.existsSync('synced-transactions.txt')
    ? (JSON.parse(fs.readFileSync('synced-transactions.txt', 'utf-8')) as TransactionResult[])
    : []
  fs.writeFileSync('synced-transactions.txt', JSON.stringify(existing.concat(transactions)), { encoding: 'utf-8' })
  // eslint-disable-next-line no-console
  console.log('Saved the transactions to synced-transactions.txt')
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
