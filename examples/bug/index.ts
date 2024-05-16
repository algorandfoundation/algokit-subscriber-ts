import * as algokit from '@algorandfoundation/algokit-utils'
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

// eslint-disable-next-line no-console
process.on('uncaughtException', (e) => console.error(e))
;(async () => {
  const algod = algokit.getAlgoClient()
  let watermark = 0

  const subscriber = new AlgorandSubscriber(
    {
      filters: [
        {
          name: 'all-transactions',
          filter: {
            customFilter: () => true,
          },
        },
      ],
      maxRoundsToSync: 1,
      // syncToRound: 1234,
      waitForBlockWhenAtTip: true,
      syncBehaviour: 'skip-sync-newest',
      watermarkPersistence: {
        get: async () => watermark,
        set: async (newWatermark) => {
          watermark = newWatermark
        },
      },
    },
    algod,
  )

  subscriber.onPoll(async (result) => {
    console.log('onPoll called')
  })

  subscriber.start()
  ;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
    process.on(signal, () => {
      // eslint-disable-next-line no-console
      console.log(`Received ${signal}; stopping subscriber...`)
      subscriber.stop(signal)
    }),
  )
})().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
})
