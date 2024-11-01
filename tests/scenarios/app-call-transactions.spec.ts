import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { Account } from 'algosdk'
import { afterEach, beforeEach, describe, expect, test, vitest } from 'vitest'
import { TestingAppClient } from '../contract/client'
import { GetSubscribedTransactions, SendXTransactions } from '../transactions'

describe('App call transactions', () => {
  const localnet = algorandFixture()
  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  describe('Can have an app create transaction subscribed correctly from algod', () => {
    const app = async (config: { create: boolean }, creator: Account) => {
      const app = new TestingAppClient(
        {
          resolveBy: 'id',
          id: 0,
        },
        localnet.context.algod,
      )
      const creation = await app.create.bare({
        sender: creator,
        sendParams: {
          skipSending: !config.create,
        },
      })

      return {
        app,
        creation,
      }
    }

    test('Works for app create', async () => {
      const { testAccount } = localnet.context
      const app1 = await app({ create: true }, testAccount)

      // Ensure there is another transaction so algod subscription can process something
      await SendXTransactions(1, testAccount, localnet.context.algod)
      // Wait for indexer to catch up
      await localnet.context.waitForIndexer()

      const [algod] = await Promise.all([
        GetSubscribedTransactions(
          {
            roundsToSync: 1,
            syncBehaviour: 'sync-oldest',
            watermark: Number(app1.creation.confirmation?.confirmedRound) - 1,
            currentRound: Number(app1.creation.confirmation?.confirmedRound),
            filters: { appCreate: true },
          },
          localnet.context.algod,
        ),
      ])

      expect(algod.subscribedTransactions.length).toBe(1)
      expect(algod.subscribedTransactions[0]['application-transaction']?.['application-id']).toBe(0)
    })
  })
})
