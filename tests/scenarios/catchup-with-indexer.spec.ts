import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { afterEach, beforeEach, describe, expect, test, vitest } from 'vitest'
import { GetSubscribedTransactionsFromSender, SendXTransactions } from '../transactions'

describe('Subscribing using catchup-with-indexer', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  test('Processes start of chain to now when starting from beginning of chain', async () => {
    const { algorand, testAccount, generateAccount, waitForIndexerTransaction } = localnet.context
    // Ensure that if we are at round 0 there is a different transaction that won't be synced
    await SendXTransactions(1, await generateAccount({ initialFunds: (3).algos() }), algorand)
    const { lastTxnRound, txns } = await SendXTransactions(1, testAccount, algorand)
    await waitForIndexerTransaction(txns[0].transaction.txID())

    const subscribed = await GetSubscribedTransactionsFromSender(
      { roundsToSync: 1, syncBehaviour: 'catchup-with-indexer', watermark: 0n, currentRound: lastTxnRound },
      testAccount,
      algorand,
    )

    expect(subscribed.currentRound).toBe(lastTxnRound)
    expect(subscribed.startingWatermark).toBe(0n)
    expect(subscribed.newWatermark).toBe(lastTxnRound)
    expect(subscribed.syncedRoundRange).toEqual([1n, lastTxnRound])
    expect(subscribed.subscribedTransactions.length).toBe(1)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[0].transaction.txID())
  })

  test('Limits the number of synced transactions to maxIndexerRoundsToSync', async () => {
    const { algorand, testAccount, generateAccount, waitForIndexerTransaction } = localnet.context
    // Ensure that if we are at round 0 there is a different transaction that won't be synced
    const randomAccount = await generateAccount({ initialFunds: (3).algos() })
    const { lastTxnRound: initialWatermark } = await SendXTransactions(1, randomAccount, algorand)
    const { txns } = await SendXTransactions(5, testAccount, algorand)
    const { lastTxnRound, txIds } = await SendXTransactions(1, randomAccount, algorand)
    await waitForIndexerTransaction(txIds[0])
    const expectedNewWatermark = txns[2].confirmation!.confirmedRound! - 1n
    const indexerRoundsToSync = Number(expectedNewWatermark - initialWatermark)

    const subscribed = await GetSubscribedTransactionsFromSender(
      {
        roundsToSync: 1,
        indexerRoundsToSync,
        syncBehaviour: 'catchup-with-indexer',
        watermark: initialWatermark,
        currentRound: lastTxnRound,
      },
      testAccount,
      algorand,
    )

    expect(subscribed.currentRound).toBe(lastTxnRound)
    expect(subscribed.startingWatermark).toBe(initialWatermark)
    expect(subscribed.newWatermark).toBe(expectedNewWatermark)
    expect(subscribed.syncedRoundRange).toEqual([initialWatermark + 1n, expectedNewWatermark])
    expect(subscribed.subscribedTransactions.length).toBe(2)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[0].transaction.txID())
    expect(subscribed.subscribedTransactions[1].id).toBe(txns[1].transaction.txID())
  })

  // Same behaviour as sync-oldest
  test('Processes all transactions after watermark when starting from an earlier round with other transactions', async () => {
    const { algorand, testAccount, waitForIndexerTransaction } = localnet.context
    const { txns, lastTxnRound: olderTxnRound } = await SendXTransactions(2, testAccount, algorand)
    const { lastTxnRound: currentRound, txns: lastTxns } = await SendXTransactions(1, testAccount, algorand)
    await waitForIndexerTransaction(lastTxns[0].transaction.txID())

    const subscribed = await GetSubscribedTransactionsFromSender(
      { roundsToSync: 1, syncBehaviour: 'catchup-with-indexer', watermark: olderTxnRound - 1n, currentRound },
      testAccount,
      algorand,
    )

    expect(subscribed.currentRound).toBe(currentRound)
    expect(subscribed.startingWatermark).toBe(olderTxnRound - 1n)
    expect(subscribed.newWatermark).toBe(currentRound)
    expect(subscribed.syncedRoundRange).toEqual([olderTxnRound, currentRound])
    expect(subscribed.subscribedTransactions.length).toBe(2)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[1].transaction.txID())
    expect(subscribed.subscribedTransactions[1].id).toBe(lastTxns[0].transaction.txID())
  })

  test('Process multiple historic transactions using indexer and blends them in with algod transaction', async () => {
    const { algorand, testAccount, waitForIndexerTransaction } = localnet.context
    const { txns, txIds, lastTxnRound } = await SendXTransactions(3, testAccount, algorand)
    await waitForIndexerTransaction(txIds[2])

    const subscribed = await GetSubscribedTransactionsFromSender(
      { roundsToSync: 1, syncBehaviour: 'catchup-with-indexer', watermark: 0n, currentRound: lastTxnRound },
      testAccount,
      algorand,
    )

    expect(subscribed.currentRound).toBe(lastTxnRound)
    expect(subscribed.startingWatermark).toBe(0n)
    expect(subscribed.newWatermark).toBe(lastTxnRound)
    expect(subscribed.syncedRoundRange).toEqual([1n, lastTxnRound])
    expect(subscribed.subscribedTransactions.length).toBe(3)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[0].transaction.txID())
    expect(subscribed.subscribedTransactions[1].id).toBe(txns[1].transaction.txID())
    expect(subscribed.subscribedTransactions[2].id).toBe(txns[2].transaction.txID())
  })
})
