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
      expect(algod.subscribedTransactions[0].applicationTransaction?.rejectVersion).toBeUndefined()
    })
  })

  describe('Can have an app call transaction with a reject version subscribed correctly', () => {
    test('Works for app call with a reject version', async () => {
      const { testAccount } = localnet.context
      const appCreate = await localnet.algorand.send.appCreate({
        sender: testAccount.addr,
        approvalProgram: '#pragma version 10\nint 1\nreturn',
        clearStateProgram: '#pragma version 10\nint 1\nreturn',
      })
      const appCall = await localnet.algorand.send.appCall({
        sender: testAccount.addr,
        appId: appCreate.appId,
        rejectVersion: 1,
      })
      const appCallRound = appCall.confirmation?.confirmedRound ?? 0n

      // Ensure there is another transaction so algod subscription can process something
      await SendXTransactions(1, testAccount, localnet.algorand)
      // Wait for indexer to catch up
      await localnet.context.waitForIndexer()
      // Run the subscription twice - once that will pick up using algod and once using indexer
      // this allows the reject version mapping for both to be tested
      const [algod, indexer] = await Promise.all([
        GetSubscribedTransactions(
          {
            roundsToSync: 1,
            syncBehaviour: 'sync-oldest',
            watermark: appCallRound - 1n,
            currentRound: appCallRound,
            filters: { appId: appCreate.appId },
          },
          localnet.algorand,
        ),
        GetSubscribedTransactions(
          {
            roundsToSync: 1,
            syncBehaviour: 'catchup-with-indexer',
            watermark: appCallRound - 1n,
            currentRound: appCallRound + 1n,
            filters: { appId: appCreate.appId },
          },
          localnet.algorand,
        ),
      ])

      expect(algod.subscribedTransactions.length).toBe(1)
      expect(algod.subscribedTransactions[0].id).toBe(appCall.transaction.txID())
      expect(algod.subscribedTransactions[0].applicationTransaction?.rejectVersion).toBe(1)
      expect(indexer.subscribedTransactions.length).toBe(1)
      expect(indexer.subscribedTransactions[0].id).toBe(appCall.transaction.txID())
      expect(indexer.subscribedTransactions[0].applicationTransaction?.rejectVersion).toBe(1)
    })
  })
})
