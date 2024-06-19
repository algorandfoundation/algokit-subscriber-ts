import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { afterEach, beforeEach, describe, expect, test, vitest } from 'vitest'
import { GetSubscribedTransactionsFromSender, SendXTransactions } from '../transactions'

describe('Subscribing using fail', () => {
  const localnet = algorandFixture()

  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  test('Fails if too far from the tip of the chain', async () => {
    const { algod, testAccount } = localnet.context
    const { lastTxnRound } = await SendXTransactions(2, testAccount, algod)

    await expect(
      async () =>
        await GetSubscribedTransactionsFromSender(
          { roundsToSync: 1, syncBehaviour: 'fail', watermark: 0, currentRound: lastTxnRound },
          testAccount,
          algod,
        ),
    ).rejects.toThrow(`Invalid round number to subscribe from 1; current round number is ${lastTxnRound}`)
  })

  test("Doesn't fail if not too far from the tip of the chain", async () => {
    const { algod, testAccount } = localnet.context
    const { txns, lastTxnRound } = await SendXTransactions(2, testAccount, algod)

    const subscribed = await GetSubscribedTransactionsFromSender(
      { roundsToSync: 1, syncBehaviour: 'fail', watermark: lastTxnRound - 1, currentRound: lastTxnRound },
      testAccount,
      algod,
    )

    expect(subscribed.currentRound).toBe(lastTxnRound)
    expect(subscribed.startingWatermark).toBe(lastTxnRound - 1)
    expect(subscribed.newWatermark).toBe(lastTxnRound)
    expect(subscribed.syncedRoundRange).toEqual([lastTxnRound, lastTxnRound])
    expect(subscribed.subscribedTransactions.length).toBe(1)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[1].transaction.txID())
  })
})
