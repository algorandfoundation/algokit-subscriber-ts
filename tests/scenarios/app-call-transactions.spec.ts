import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { afterEach, beforeEach, describe, expect, test, vitest } from 'vitest'
import { app } from '../testing-app'
import { GetSubscribedTransactions, SendXTransactions } from '../transactions'

describe('App call transactions', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  describe('Can have an app create transaction subscribed correctly from algod', () => {
    test('Works for app create', async () => {
      const { testAccount } = localnet.context
      const app1 = await app({ create: true, algorand: localnet.algorand, creator: testAccount })

      // Ensure there is another transaction so algod subscription can process something
      await SendXTransactions(1, testAccount, localnet.algorand)
      // Wait for indexer to catch up
      await localnet.context.waitForIndexer()

      const [algod] = await Promise.all([
        GetSubscribedTransactions(
          {
            roundsToSync: 1,
            syncBehaviour: 'sync-oldest',
            watermark: (app1.result.confirmation?.confirmedRound ?? 0n) - 1n,
            currentRound: app1.result.confirmation?.confirmedRound ?? 0n,
            filters: { appCreate: true },
          },
          localnet.algorand,
        ),
      ])

      expect(algod.subscribedTransactions.length).toBe(1)
      expect(algod.subscribedTransactions[0].applicationTransaction?.applicationId).toBe(0n)
    })
  })
})
