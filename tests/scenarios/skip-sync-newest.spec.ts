import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { beforeEach, describe, test } from '@jest/globals'
import { GetSubscribedTransactionsFromSender, SendXTransactions } from '../transactions'

describe('skip-sync-newest', () => {
  const localnet = algorandFixture()

  beforeEach(localnet.beforeEach, 10e6)

  test('Only processes the latest transaction when starting from beginning of chain', async () => {
    const { algod, testAccount } = localnet.context
    const { txns, lastTxnRound } = await SendXTransactions(2, testAccount, algod)

    const subscribed = await GetSubscribedTransactionsFromSender(
      { roundsToSync: 1, syncBehaviour: 'skip-sync-newest', watermark: 0 },
      testAccount,
      algod,
    )

    expect(subscribed.currentRound).toBe(lastTxnRound)
    expect(subscribed.newWatermark).toBe(lastTxnRound)
    expect(subscribed.syncedRoundRange).toEqual([lastTxnRound, lastTxnRound])
    expect(subscribed.subscribedTransactions.length).toBe(1)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[1].transaction.txID())
  })

  test('Only processes the latest transaction when starting from an earlier roudn with other transactions', async () => {
    const { algod, testAccount } = localnet.context
    const { lastTxnRound: olderTxnRound } = await SendXTransactions(2, testAccount, algod)
    const { txns, lastTxnRound: currentRound } = await SendXTransactions(1, testAccount, algod)

    const subscribed = await GetSubscribedTransactionsFromSender(
      { roundsToSync: 1, syncBehaviour: 'skip-sync-newest', watermark: olderTxnRound - 1 },
      testAccount,
      algod,
    )

    expect(subscribed.currentRound).toBe(currentRound)
    expect(subscribed.newWatermark).toBe(currentRound)
    expect(subscribed.syncedRoundRange).toEqual([currentRound, currentRound])
    expect(subscribed.subscribedTransactions.length).toBe(1)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[0].transaction.txID())
  })

  test('Process multiple transactions', async () => {
    const { algod, testAccount } = localnet.context
    const { txns, lastTxnRound } = await SendXTransactions(3, testAccount, algod)

    const subscribed = await GetSubscribedTransactionsFromSender(
      { roundsToSync: 2, syncBehaviour: 'skip-sync-newest', watermark: 0 },
      testAccount,
      algod,
    )

    expect(subscribed.currentRound).toBe(lastTxnRound)
    expect(subscribed.newWatermark).toBe(lastTxnRound)
    expect(subscribed.syncedRoundRange).toEqual([lastTxnRound - 1, lastTxnRound])
    expect(subscribed.subscribedTransactions.length).toBe(2)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[1].transaction.txID())
    expect(subscribed.subscribedTransactions[1].id).toBe(txns[2].transaction.txID())
  })
})
