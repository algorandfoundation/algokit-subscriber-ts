import * as algokit from '@algorandfoundation/algokit-utils'
import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { Algodv2, Indexer, TransactionType } from 'algosdk'
import fs from 'fs'
import { AsyncEventEmitter } from './src/async-event-emitter'
import { TransactionFilter, getSubscribedTransactions } from './src/subscriptions'

if (!fs.existsSync('.env') && !process.env.ALGOD_SERVER) {
  // eslint-disable-next-line no-console
  console.error('Copy .env.sample to .env before starting the application.')
  process.exit(1)
}

interface SubscriptionConfigEvent<T> {
  eventName: string
  filter: TransactionFilter
  mapper?: (transaction: TransactionResult[]) => Promise<T[]>
}

interface SubscriptionConfig {
  frequencyInSeconds: number
  maxRoundsToSync: number
  events: SubscriptionConfigEvent<unknown>[]
  syncBehaviour: 'skip-to-newest' | 'sync-oldest' | 'sync-oldest-start-now' | 'catchup-with-indexer'
  watermarkPersistence: { get: () => Promise<number>; set: (newWatermark: number) => Promise<void> }
}

class AlgorandSubscriber {
  private algod: Algodv2
  private indexer: Indexer | undefined
  private subscription: SubscriptionConfig
  private abortController: AbortController
  private eventEmitter: AsyncEventEmitter

  constructor(subscription: SubscriptionConfig, algod: Algodv2, indexer?: Indexer) {
    this.algod = algod
    this.indexer = indexer
    this.subscription = subscription
    this.abortController = new AbortController()
    this.eventEmitter = new AsyncEventEmitter()

    if (subscription.syncBehaviour === 'catchup-with-indexer' && !indexer) {
      throw new Error("Received sync behaviour of catchup-with-indexer, but didn't receive an indexer instance.")
    }
  }

  async pollOnce() {
    const watermark = await this.subscription.watermarkPersistence.get()

    const pollResult = await getSubscribedTransactions(
      {
        filter: this.subscription.events[0].filter,
        watermark,
        maxRoundsToSync: this.subscription.maxRoundsToSync,
        onMaxRounds: this.subscription.syncBehaviour,
      },
      this.algod,
      this.indexer,
    )

    const mappedTransactions = this.subscription.events[0].mapper
      ? await this.subscription.events[0].mapper(pollResult.subscribedTransactions)
      : pollResult.subscribedTransactions
    try {
      await this.eventEmitter.emitAsync(`batch:${this.subscription.events[0].eventName}`, mappedTransactions)
      for (const transaction of mappedTransactions) {
        await this.eventEmitter.emitAsync(this.subscription.events[0].eventName, transaction)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Error processing event emittance`, e)
      throw e
    }

    await this.subscription.watermarkPersistence.set(pollResult.newWatermark)
  }

  start() {
    ;(async () => {
      while (!this.abortController.signal.aborted) {
        await this.pollOnce()
        await new Promise((resolve) => setTimeout(resolve, this.subscription.frequencyInSeconds * 1000))
      }
    })()
  }

  stop(reason: unknown) {
    this.abortController.abort(reason)
  }

  on<T>(eventName: string, listener: (event: T) => unknown) {
    this.eventEmitter.on(eventName, listener)
  }

  onBatch<T>(eventName: string, listener: (events: T[]) => unknown) {
    this.eventEmitter.on(`batch:${eventName}`, listener)
  }
}

const run = async () => {
  const algod = await algokit.getAlgoClient()
  const indexer = await algokit.getAlgoIndexerClient()

  const watermark = await getLastWatermark()

  const transactions = await getSubscribedTransactions(
    {
      filter: {
        type: TransactionType.appl,
        // Data History Museum creator accounts
        appId: 1212121,
      },
      watermark,
      maxRoundsToSync: 100,
      onMaxRounds: 'skip-to-newest',
    },
    algod,
    indexer,
  )

  // eslint-disable-next-line no-console
  console.log(
    `Found ${transactions.subscribedTransactions.length} transactions from rounds ${transactions.syncedRoundRange[0]}-${transactions.syncedRoundRange[1]}`,
  )

  if (transactions.subscribedTransactions.length > 0) {
    // Save all of the Data History Museum Verifiably Authentic Digital Historical Artifacts
    await saveTransactions(transactions.subscribedTransactions, 'txns.json')
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

async function runSubscribeDHM() {
  const algod = await algokit.getAlgoClient()
  const indexer = await algokit.getAlgoIndexerClient()
  const subscriber = new AlgorandSubscriber(
    {
      events: [
        {
          eventName: 'dhm-asset',
          filter: {
            type: TransactionType.acfg,
            // Data History Museum creator accounts
            sender: (await algokit.isTestNet(algod))
              ? 'ER7AMZRPD5KDVFWTUUVOADSOWM4RQKEEV2EDYRVSA757UHXOIEKGMBQIVU'
              : 'EHYQCYHUC6CIWZLBX5TDTLVJ4SSVE4RRTMKFDCG4Z4Q7QSQ2XWIQPMKBPU',
          },
          mapper: DHMAssetMapper,
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
  })
  subscriber.on<MappedDHMAsset>('dhm-asset', async (event) => {
    // eslint-disable-next-line no-console
    console.log(`Received ${event.txId}`)
  })
  subscriber.start()
  ;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
    process.on(signal, () => {
      // eslint-disable-next-line no-console
      console.log(`Received ${signal}; stopping subscriber...`)
      subscriber.stop(signal)
    }),
  )
  // Infinite loop: https://github.com/nodejs/node/issues/22088#issuecomment-609835641
  await new Promise((_resolve) => {
    setTimeout(() => null, 0)
  })
}

async function runSubscribeXgovVoting() {
  const algod = await algokit.getAlgoClient()
  const indexer = await algokit.getAlgoIndexerClient()
  const subscriber = new AlgorandSubscriber(
    {
      events: [
        {
          eventName: 'xgov-vote',
          filter: {
            type: TransactionType.appl,
            appId: 1236654302, // MainNet: xGov Voting Session 2
            methodSignature: 'vote(pay,byte[],uint64,uint8[],uint64[],application)void',
          },
        },
      ],
      frequencyInSeconds: 30,
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
  // eslint-disable-next-line no-console
  subscriber.on('xgov-vote', console.log)
  subscriber.start()
  // Infinite loop: https://github.com/nodejs/node/issues/22088#issuecomment-609835641
  await new Promise<void>((resolve) => {
    // eslint-disable-next-line no-constant-condition
    if (false) resolve()
    setTimeout(() => null, 0)
  })
}

function getArc69Metadata(t: TransactionResult) {
  let metadata = {}
  try {
    if (t.note && t.note.startsWith('ey')) metadata = JSON.parse(Buffer.from(t.note, 'base64').toString('utf-8'))
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return metadata
}

interface MappedDHMAsset {
  txId: string
  asset: DHMAsset
  deleted: boolean
}

async function DHMAssetMapper(transactions: TransactionResult[]): Promise<MappedDHMAsset[]> {
  const assets = await getSavedTransactions<DHMAsset>('dhm-assets.json')
  const result: MappedDHMAsset[] = []
  for (const transaction of transactions) {
    if (transaction['created-asset-index']) {
      const asset = {
        txId: transaction.id,
        asset: {
          id: transaction['created-asset-index'],
          name: transaction['asset-config-transaction'].params.name!,
          unit: transaction['asset-config-transaction'].params['unit-name']!,
          mediaUrl: transaction['asset-config-transaction'].params.url!,
          metadata: getArc69Metadata(transaction),
          created: new Date(transaction['round-time']! * 1000).toISOString(),
          lastModified: new Date(transaction['round-time']! * 1000).toISOString(),
        },
        deleted: false,
      }
      result.push(asset)
      assets.push(asset.asset)
    } else {
      const asset = assets.find((a) => a.id === transaction['asset-config-transaction']['asset-id'])
      if (!asset) {
        // eslint-disable-next-line no-console
        console.error(transaction)
        throw new Error(`Unable to find existing asset data for ${transaction['asset-config-transaction']['asset-id']}`)
      }
      if (!transaction['asset-config-transaction'].params) {
        result.push({
          txId: transaction.id,
          asset: asset,
          deleted: true,
        })
      } else {
        asset!.metadata = getArc69Metadata(transaction)
        asset!.lastModified = new Date(transaction['round-time']! * 1000).toISOString()
        result.push({
          txId: transaction.id,
          asset,
          deleted: false,
        })
      }
    }
  }
  return result
}

async function saveDHMTransactions(transactions: TransactionResult[]) {
  const assets = await getSavedTransactions<DHMAsset>('dhm-assets.json')

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

  await saveTransactions(assets, 'dhm-assets.json')
}

async function getSavedTransactions<T>(fileName: string): Promise<T[]> {
  const existing = fs.existsSync(fileName) ? (JSON.parse(fs.readFileSync(fileName, 'utf-8')) as T[]) : []
  return existing
}

async function saveTransactions(transactions: unknown[], fileName: string) {
  fs.writeFileSync(fileName, JSON.stringify(transactions, undefined, 2), { encoding: 'utf-8' })
  // eslint-disable-next-line no-console
  console.log(`Saved ${transactions.length} transactions to ${fileName}`)
}

// eslint-disable-next-line no-console
process.on('uncaughtException', (e) => console.error(e))
;(async () => {
  if (process.env.RUN_LOOP === 'true') {
    // eslint-disable-next-line no-constant-condition
    //await runSubscribeDHM()
    await runSubscribeDHM()
  } else {
    await run()
  }
})()
