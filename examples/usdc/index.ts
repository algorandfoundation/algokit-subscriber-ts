import * as algokit from '@algorandfoundation/algokit-utils'
import { TransactionType } from 'algosdk'
import fs from 'fs'
import path from 'path'
import { AlgorandSubscriber } from '../../src/subscriber'

if (!fs.existsSync(path.join(__dirname, '..', '..', '.env')) && !process.env.ALGOD_SERVER) {
  // eslint-disable-next-line no-console
  console.error('Copy /.env.sample to /.env before starting the application.')
  process.exit(1)
}

// eslint-disable-next-line no-console
process.on('uncaughtException', (e) => console.error(e))
;(async () => {
  const algod = await algokit.getAlgoClient()
  const indexer = await algokit.getAlgoIndexerClient()
  let watermark = 0

  const subscriber = new AlgorandSubscriber(
    {
      events: [
        {
          eventName: 'usdc',
          filter: {
            type: TransactionType.axfer,
            assetId: 31566704, // MainNet: USDC
            minAmount: 1_000_000, // $1
          },
        },
      ],
      frequencyInSeconds: 1,
      maxRoundsToSync: 100,
      syncBehaviour: 'skip-to-newest',
      watermarkPersistence: {
        get: async () => watermark,
        set: async (newWatermark) => {
          watermark = newWatermark
        },
      },
    },
    algod,
    indexer,
  )
  subscriber.on('usdc', (transfer) => {
    // eslint-disable-next-line no-console
    console.log(
      `${transfer.sender} sent ${transfer['asset-transfer-transaction']?.receiver} USDC$${(
        (transfer['asset-transfer-transaction']?.amount ?? 0) / 1_000_000
      ).toFixed(2)} in transaction ${transfer.id}`,
    )
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
