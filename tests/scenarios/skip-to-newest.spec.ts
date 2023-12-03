import * as algokit from '@algorandfoundation/algokit-utils'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import { beforeEach, describe, test } from '@jest/globals'
import { getSubscribedTransactions } from '../../src'

describe('skip-to-newest', () => {
  const localnet = algorandFixture()

  beforeEach(localnet.beforeEach, 10e6)

  test('Only processes the last x transactions when starting from beginning of chain', async () => {
    const { algod, testAccount } = localnet.context
    const txns: SendTransactionResult[] = []
    for (let i = 0; i < 2; i++) {
      txns.push(
        await algokit.transferAlgos(
          {
            amount: (1).algos(),
            from: testAccount,
            to: testAccount,
          },
          algod,
        ),
      )
    }
    const lastTxnRound = Number(txns[1].confirmation?.confirmedRound)

    const subscribed = await getSubscribedTransactions(
      {
        filter: {
          sender: testAccount.addr,
        },
        maxRoundsToSync: 1,
        syncBehaviour: 'skip-to-newest',
        watermark: 0,
      },
      algod,
    )

    expect(subscribed.currentRound).toBe(lastTxnRound)
    expect(subscribed.newWatermark).toBe(lastTxnRound)
    expect(subscribed.syncedRoundRange).toEqual([lastTxnRound, lastTxnRound])
    expect(subscribed.subscribedTransactions.length).toBe(1)
    expect(subscribed.subscribedTransactions[0].id).toBe(txns[1].transaction.txID())
  })
})
