import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { TransactionType } from '@algorandfoundation/algokit-utils/transact'
import fs from 'fs'
import path from 'path'
import { AlgorandSubscriber } from '../../src/subscriber'

if (!fs.existsSync(path.join(__dirname, '..', '..', '.env')) && !process.env.ALGOD_SERVER) {
  // eslint-disable-next-line no-console
  console.error('Copy /.env.sample to /.env before starting the application.')
  process.exit(1)
}

;(async () => {
  const algorand = AlgorandClient.testNet()
  let watermark = 0n

  const subscriber = new AlgorandSubscriber(
    {
      filters: [
        {
          name: 'usdc',
          filter: {
            type: TransactionType.AssetTransfer,
            assetId: 31566704n, // MainNet: USDC
            minAmount: 1_000_000n, // $1
          },
        },
      ],
      waitForBlockWhenAtTip: true,
      syncBehaviour: 'skip-sync-newest',
      watermarkPersistence: {
        get: async () => watermark,
        set: async (newWatermark) => {
          watermark = newWatermark
        },
      },
    },
    algorand.client.algod,
  )
  subscriber.on('usdc', (transfer) => {
    // eslint-disable-next-line no-console
    console.log(
      `${transfer.sender} sent ${transfer.assetTransferTransaction?.receiver} USDC$${Number(
        (transfer.assetTransferTransaction?.amount ?? 0n) / 1_000_000n,
      ).toFixed(2)} in transaction ${transfer.id}`,
    )
  })
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
})().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
})
