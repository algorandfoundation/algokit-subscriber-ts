/* eslint-disable no-console */
import * as algokit from '@algorandfoundation/algokit-utils'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { SendTransactionFrom } from '@algorandfoundation/algokit-utils/types/transaction'
import { beforeEach, describe, test } from '@jest/globals'
import { Algodv2, Indexer } from 'algosdk'
import { AlgorandSubscriber } from '../../src'
import { SubscriptionConfig } from '../../src/types/subscription'
import { SendXTransactions } from '../transactions'
import { waitFor } from '../wait'
import { InMemoryWatermark } from '../watermarks'

describe('AlgorandSubscriber', () => {
  const localnet = algorandFixture()

  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    jest.clearAllMocks()
  })

  const getSubscriber = (
    config: { testAccount: SendTransactionFrom; configOverrides?: Partial<SubscriptionConfig>; initialWatermark?: number },
    algod: Algodv2,
    indexer?: Indexer,
  ) => {
    let watermark = config.initialWatermark ?? 0
    const subscribedTxns: string[] = []

    const subscriber = new AlgorandSubscriber(
      {
        events: [
          {
            eventName: 'test-txn',
            filter: {
              sender: algokit.getSenderAddress(config.testAccount),
            },
          },
          ...(config.configOverrides?.events ?? []),
        ],
        ...config.configOverrides,
        syncBehaviour: config.configOverrides?.syncBehaviour ?? 'catchup-with-indexer',
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
    })
    return {
      subscriber,
      subscribedTestAccountTxns: subscribedTxns,
      getWatermark: () => watermark,
    }
  }

  test('Subscribes to transactions correctly when controlling polling', async () => {
    const { algod, testAccount, generateAccount, waitForIndexerTransaction, indexer } = localnet.context
    const { lastTxnRound, txIds } = await SendXTransactions(1, testAccount, algod)
    const {
      subscriber,
      subscribedTestAccountTxns: subscribedTxns,
      getWatermark,
    } = getSubscriber({ testAccount, initialWatermark: lastTxnRound - 1 }, algod, indexer)

    // Initial catch up with indexer
    await waitForIndexerTransaction(txIds[0])
    const result = await subscriber.pollOnce()
    expect(subscribedTxns.length).toBe(1)
    expect(subscribedTxns[0]).toBe(txIds[0])
    expect(getWatermark()).toBeGreaterThanOrEqual(lastTxnRound)
    expect(result.currentRound).toBeGreaterThanOrEqual(lastTxnRound)
    expect(result.newWatermark).toBe(result.currentRound)
    expect(result.syncedRoundRange).toEqual([lastTxnRound, result.currentRound])
    expect(result.subscribedTransactions.length).toBe(1)
    expect(result.subscribedTransactions.map((t) => t.id)).toEqual(txIds)

    // Random transaction
    const { lastTxnRound: lastTxnRound2, txIds: txIds2 } = await SendXTransactions(
      1,
      await generateAccount({ initialFunds: (3).algos() }),
      algod,
    )
    await waitForIndexerTransaction(txIds2[0])
    await subscriber.pollOnce()
    expect(subscribedTxns.length).toBe(1)
    expect(getWatermark()).toBeGreaterThanOrEqual(lastTxnRound2)

    // Another subscribed transaction
    const { lastTxnRound: lastTxnRound3, txIds: txIds3 } = await SendXTransactions(1, testAccount, algod)
    await waitForIndexerTransaction(txIds3[0])
    await subscriber.pollOnce()
    expect(subscribedTxns.length).toBe(2)
    expect(subscribedTxns[1]).toBe(txIds3[0])
    expect(getWatermark()).toBeGreaterThanOrEqual(lastTxnRound3)
  })

  test('Subscribes to transactions at regular intervals when started and can be stopped', async () => {
    const { algod, testAccount, waitForIndexerTransaction, indexer } = localnet.context
    const { lastTxnRound, txIds } = await SendXTransactions(1, testAccount, algod)
    const {
      subscriber,
      subscribedTestAccountTxns: subscribedTxns,
      getWatermark,
    } = getSubscriber({ testAccount, configOverrides: { maxRoundsToSync: 1, frequencyInSeconds: 0.1 } }, algod, indexer)
    const roundsSynced: number[] = []

    console.log('Starting subscriber')
    await waitForIndexerTransaction(txIds[0])
    subscriber.start((r) => roundsSynced.push(r.currentRound))

    console.log('Waiting for ~0.5s')
    await new Promise((resolve) => setTimeout(resolve, 500))
    const pollCountBeforeStopping = roundsSynced.length

    console.log('Stopping subscriber')
    await subscriber.stop('TEST')
    const pollCountAfterStopping = roundsSynced.length

    // Assert
    expect(subscribedTxns.length).toBe(1)
    expect(subscribedTxns[0]).toBe(txIds[0])
    expect(getWatermark()).toBeGreaterThanOrEqual(lastTxnRound)
    // Polling frequency is 0.1s and we waited ~0.5s, LocalNet latency is low so expect 3-7 polls
    expect(pollCountBeforeStopping).toBeGreaterThanOrEqual(3)
    expect(pollCountBeforeStopping).toBeLessThanOrEqual(7)
    // Expect no more than 1 extra poll after we called stop
    expect(pollCountAfterStopping - pollCountBeforeStopping).toBeLessThanOrEqual(1)
  })

  test('Waits until transaction appears by default when started', async () => {
    const { algod, testAccount } = localnet.context
    const currentRound = (await algod.status().do())['last-round'] as number
    const {
      subscriber,
      subscribedTestAccountTxns: subscribedTxns,
      getWatermark,
    } = getSubscriber(
      {
        testAccount,
        // Polling for 10s means we are definitely testing the algod waiting works
        configOverrides: { frequencyInSeconds: 10, waitForBlockWhenAtTip: true, syncBehaviour: 'sync-oldest' },
        initialWatermark: currentRound - 1,
      },
      algod,
    )
    const roundsSynced: number[] = []

    console.log('Starting subscriber')
    subscriber.start((r) => roundsSynced.push(r.currentRound))

    console.log('Waiting for up to 2s until subscriber has caught up to tip of chain')
    await waitFor(() => roundsSynced.length > 0, 2000)

    console.log('Issuing transaction')
    const pollCountBeforeIssuing = roundsSynced.length
    const { lastTxnRound, txIds } = await SendXTransactions(1, testAccount, algod)

    console.log(`Waiting for up to 2s for round ${lastTxnRound} to get processed`)
    await waitFor(() => subscribedTxns.length === 1, 5000)
    const pollCountAfterIssuing = roundsSynced.length

    console.log('Stopping subscriber')
    await subscriber.stop('TEST')

    // Assert
    expect(subscribedTxns.length).toBe(1)
    expect(subscribedTxns[0]).toBe(txIds[0])
    expect(getWatermark()).toBeGreaterThanOrEqual(lastTxnRound)
    // Expect at least 1 poll to have occurred
    expect(pollCountAfterIssuing - pollCountBeforeIssuing).toBeGreaterThanOrEqual(1)
  })
})
