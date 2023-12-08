import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { beforeEach, describe, test } from '@jest/globals'
import { AlgorandSubscriber } from '../../src'
import { SendXTransactions } from '../transactions'
import { InMemoryWatermark } from '../watermarks'

describe('AlgorandSubscriber', () => {
  const localnet = algorandFixture()

  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Subscribes to transactions correctly', async () => {
    const { algod, testAccount, generateAccount, waitForIndexerTransaction, indexer } = localnet.context
    const { lastTxnRound, txns } = await SendXTransactions(1, testAccount, algod)
    let watermark = lastTxnRound - 1
    let tracker = 0
    const subscribedTxns: string[] = []

    const subscriber = new AlgorandSubscriber(
      {
        events: [
          {
            eventName: 'test-txn',
            filter: {
              sender: testAccount.addr,
            },
          },
        ],
        frequencyInSeconds: 1,
        maxRoundsToSync: 100,
        syncBehaviour: 'catchup-with-indexer',
        watermarkPersistence: InMemoryWatermark(
          () => watermark,
          (w) => (watermark = w),
        ),
      },
      algod,
      indexer,
    )
    subscriber.on('test-txn', (r) => {
      subscribedTxns.push(r.id)
      tracker++
    })

    // Initial catch up with indexer
    await waitForIndexerTransaction(txns[0].transaction.txID())
    await subscriber.pollOnce()
    expect(tracker).toBe(1)
    expect(subscribedTxns.length).toBe(1)
    expect(subscribedTxns[0]).toBe(txns[0].transaction.txID())
    expect(watermark).toBeGreaterThanOrEqual(lastTxnRound)

    // Random transaction
    const { lastTxnRound: lastTxnRound2, txns: txns2 } = await SendXTransactions(
      1,
      await generateAccount({ initialFunds: (3).algos() }),
      algod,
    )
    await waitForIndexerTransaction(txns2[0].transaction.txID())
    await subscriber.pollOnce()
    expect(tracker).toBe(1)
    expect(subscribedTxns.length).toBe(1)
    expect(watermark).toBeGreaterThanOrEqual(lastTxnRound2)

    // Another subscribed transaction
    const { lastTxnRound: lastTxnRound3, txns: txns3 } = await SendXTransactions(1, testAccount, algod)
    await waitForIndexerTransaction(txns3[0].transaction.txID())
    await subscriber.pollOnce()
    expect(tracker).toBe(2)
    expect(subscribedTxns.length).toBe(2)
    expect(subscribedTxns[1]).toBe(txns3[0].transaction.txID())
    expect(watermark).toBeGreaterThanOrEqual(lastTxnRound3)
  })
})
