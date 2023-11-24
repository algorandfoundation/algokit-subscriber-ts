import * as algokit from '@algorandfoundation/algokit-utils'
import { TransactionType } from 'algosdk'
import fs from 'fs'
import { AlgorandSubscriber } from '../../src/subscriber'

if (!fs.existsSync('../../.env') && !process.env.ALGOD_SERVER) {
  // eslint-disable-next-line no-console
  console.error('Copy /.env.sample to /.env before starting the application.')
  process.exit(1)
}

async function getXGovSubscriber() {
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
            // todo: why doesn't this work?
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
  return subscriber
}

// Basic methods that persist using filesystem - for illustrative purposes only

async function saveWatermark(watermark: number) {
  fs.writeFileSync('watermark.txt', watermark.toString(), { encoding: 'utf-8' })
}

async function getLastWatermark(): Promise<number> {
  if (!fs.existsSync('watermark.txt')) return 0
  const existing = fs.readFileSync('watermark.txt', 'utf-8')
  // eslint-disable-next-line no-console
  console.log(`Found existing sync watermark in watermark.txt; syncing from ${existing}`)
  return Number(existing)
}

// eslint-disable-next-line no-console
process.on('uncaughtException', (e) => console.error(e))
;(async () => {
  const subscriber = await getXGovSubscriber()

  if (process.env.RUN_LOOP === 'true') {
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
  } else {
    await subscriber.pollOnce()
  }
})()
