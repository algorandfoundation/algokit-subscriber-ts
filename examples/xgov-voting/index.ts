import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'
import fs from 'fs'
import path from 'path'
import { AlgorandSubscriber } from '../../src/subscriber'
import ABIArrayDynamicType = algosdk.ABIArrayDynamicType
import ABIUintType = algosdk.ABIUintType
import TransactionType = algosdk.TransactionType

if (!fs.existsSync(path.join(__dirname, '..', '..', '.env')) && !process.env.ALGOD_SERVER) {
  // eslint-disable-next-line no-console
  console.error('Copy /.env.sample to /.env before starting the application.')
  process.exit(1)
}

async function getXGovSubscriber() {
  const algod = await algokit.getAlgoClient()
  const indexer = await algokit.getAlgoIndexerClient()
  const subscriber = new AlgorandSubscriber(
    {
      filters: [
        {
          name: 'xgov-vote',
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
  subscriber.on('xgov-vote', (event) => {
    const abiUint64Array = new ABIArrayDynamicType(new ABIUintType(64))
    const votes = abiUint64Array.decode(Buffer.from(event!['application-transaction']!['application-args']![4], 'base64'))
    // eslint-disable-next-line no-console
    console.log(`${event.sender} voted with txn ${event.id} with votes:`, votes)
  })
  return subscriber
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

;(async () => {
  const subscriber = await getXGovSubscriber()

  if (process.env.RUN_LOOP === 'true') {
    subscriber.onError((e) => {
      // eslint-disable-next-line no-console
      console.error(e)
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
