import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { afterEach, beforeEach, describe, expect, test, vitest } from 'vitest'
import { GetSubscribedTransactionsFromSender, SendXTransactions } from '../transactions'

describe('Subscribing using multiple filters', () => {
  const localnet = algorandFixture()

  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  test('Process multiple historic transactions using indexer and blends them in with algorand transaction', async () => {
    const { algorand, testAccount, waitForIndexerTransaction, generateAccount } = localnet.context
    const senders = [
      await generateAccount({ initialFunds: (5).algos() }),
      await generateAccount({ initialFunds: (5).algos() }),
      await generateAccount({ initialFunds: (5).algos() }),
    ]
    // Indexer should pick these up
    const { txIds: txIds1 } = await SendXTransactions(2, senders[0], algorand)
    const { txIds: txIds2 } = await SendXTransactions(2, senders[1], algorand)
    const { txIds: txIds3 } = await SendXTransactions(2, senders[2], algorand)
    const { lastTxnRound: postIndexerRound } = await SendXTransactions(1, testAccount, algorand)
    const { txIds: txIds11 } = await SendXTransactions(1, senders[0], algorand)
    const { txIds: txIds22 } = await SendXTransactions(1, senders[1], algorand)
    const { txIds: txIds33 } = await SendXTransactions(1, senders[2], algorand)
    const { txIds, lastTxnRound } = await SendXTransactions(1, testAccount, algorand)
    await waitForIndexerTransaction(txIds[0])

    const subscribed = await GetSubscribedTransactionsFromSender(
      {
        roundsToSync: Number(lastTxnRound - postIndexerRound),
        syncBehaviour: 'catchup-with-indexer',
        watermark: 0n,
        currentRound: lastTxnRound,
      },
      senders,
      algorand,
    )

    expect(subscribed.currentRound).toBe(lastTxnRound)
    expect(subscribed.startingWatermark).toBe(0n)
    expect(subscribed.newWatermark).toBe(lastTxnRound)
    expect(subscribed.syncedRoundRange).toEqual([1, lastTxnRound])
    expect(subscribed.subscribedTransactions.length).toBe(9)
    expect(subscribed.subscribedTransactions[0].id).toBe(txIds1[0])
    expect(subscribed.subscribedTransactions[1].id).toBe(txIds1[1])
    expect(subscribed.subscribedTransactions[2].id).toBe(txIds2[0])
    expect(subscribed.subscribedTransactions[3].id).toBe(txIds2[1])
    expect(subscribed.subscribedTransactions[4].id).toBe(txIds3[0])
    expect(subscribed.subscribedTransactions[5].id).toBe(txIds3[1])
    expect(subscribed.subscribedTransactions[6].id).toBe(txIds11[0])
    expect(subscribed.subscribedTransactions[7].id).toBe(txIds22[0])
    expect(subscribed.subscribedTransactions[8].id).toBe(txIds33[0])
  })
})
