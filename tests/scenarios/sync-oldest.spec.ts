import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { afterEach, beforeEach, describe, expect, test, vitest } from 'vitest'
import { GetSubscribedTransactionsFromSender, SendXTransactions } from '../transactions'

describe('Subscribing using sync-oldest', () => {
  const localnet = algorandFixture()

  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  test('Only processes the first chain round when starting from beginning of chain', async () => {
    const { algorand, testAccount, generateAccount } = localnet.context
    // Ensure that if we are at round 0 there is a different transaction that won't be synced
    await SendXTransactions(1, await generateAccount({ initialFunds: (3).algos() }), algorand)
    const { lastTxnRound } = await SendXTransactions(1, testAccount, algorand)

    const subscribed = await GetSubscribedTransactionsFromSender(
      { roundsToSync: 1, syncBehaviour: 'sync-oldest', watermark: 0n, currentRound: lastTxnRound },
      testAccount,
      algorand,
    )

    expect(subscribed.currentRound).toBe(lastTxnRound)
    expect(subscribed.startingWatermark).toBe(0n)
    expect(subscribed.newWatermark).toBe(1n)
    expect(subscribed.syncedRoundRange).toEqual([1n, 1n])
    expect(subscribed.subscribedTransactions.length).toBe(0)
  })

  test('Only processes the first transaction after watermark when starting from an earlier round with other transactions', async () => {
    const { algorand, testAccount } = localnet.context
    const { txns, lastTxnRound: olderTxnRound } = await SendXTransactions(2, testAccount, algorand)
    const { lastTxnRound: currentRound } = await SendXTransactions(1, testAccount, algorand)

    const subscribed = await GetSubscribedTransactionsFromSender(
      { roundsToSync: 1, syncBehaviour: 'sync-oldest', watermark: olderTxnRound - 1n, currentRound },
      testAccount,
      algorand,
    )

    expect(subscribed.currentRound).toBe(currentRound)
    expect(subscribed.startingWatermark).toBe(olderTxnRound - 1n)
    expect(subscribed.newWatermark).toBe(olderTxnRound)
    expect(subscribed.syncedRoundRange).toEqual([olderTxnRound, olderTxnRound])
    expect(subscribed.subscribedTransactions.length).toBe(1)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[1].transaction.txId())
  })

  test('Process multiple transactions', async () => {
    const { algorand, testAccount } = localnet.context
    const { txns, lastTxnRound, rounds } = await SendXTransactions(3, testAccount, algorand)

    const subscribed = await GetSubscribedTransactionsFromSender(
      {
        roundsToSync: Number(rounds[1] - rounds[0]) + 1,
        syncBehaviour: 'sync-oldest',
        watermark: rounds[0] - 1n,
        currentRound: lastTxnRound,
      },
      testAccount,
      algorand,
    )

    expect(subscribed.currentRound).toBe(lastTxnRound)
    expect(subscribed.startingWatermark).toBe(rounds[0] - 1n)
    expect(subscribed.newWatermark).toBe(rounds[1])
    expect(subscribed.syncedRoundRange).toEqual([rounds[0], rounds[1]])
    expect(subscribed.subscribedTransactions.length).toBe(2)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[0].transaction.txId())
    expect(subscribed.subscribedTransactions[1].id).toBe(txns[1].transaction.txId())
  })
})
