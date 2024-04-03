import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { AlgorandFixtureConfig } from '@algorandfoundation/algokit-utils/types/testing'
import { SendAtomicTransactionComposerResults, SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import { Account } from 'algosdk'
import { expect, vitest } from 'vitest'
import { Arc28EventGroup, TransactionFilter } from '../src/types'
import { GetSubscribedTransactions, SendXTransactions } from './transactions'

export function filterFixture(fixtureConfig?: AlgorandFixtureConfig) {
  const localnet = algorandFixture(fixtureConfig)
  let systemAccount: Account

  const subscribeAlgod = async (filter: TransactionFilter, result: SendTransactionResult, arc28Events?: Arc28EventGroup[]) => {
    // Run the subscription
    const subscribed = await GetSubscribedTransactions(
      {
        roundsToSync: 1,
        syncBehaviour: 'sync-oldest',
        watermark: Number(result.confirmation?.confirmedRound) - 1,
        currentRound: Number(result.confirmation?.confirmedRound),
        filters: filter,
        arc28Events,
      },
      localnet.context.algod,
    )
    return subscribed
  }

  const subscribeIndexer = async (filter: TransactionFilter, result: SendTransactionResult, arc28Events?: Arc28EventGroup[]) => {
    const start = +new Date()
    // Ensure there is another transaction so algod subscription can process something
    await SendXTransactions(2, systemAccount, localnet.context.algod)
    // Wait for indexer to catch up
    await localnet.context.waitForIndexerTransaction(result.transaction.txID())
    const durationInSeconds = (+new Date() - start) / 1000
    // eslint-disable-next-line no-console
    console.debug(`Prepared for subscribing to indexer in ${durationInSeconds} seconds`)

    // Run the subscription
    const subscribed = await GetSubscribedTransactions(
      {
        roundsToSync: 1,
        syncBehaviour: 'catchup-with-indexer',
        watermark: Number(result.confirmation!.confirmedRound ?? 0) - 1,
        currentRound: Number(result.confirmation?.confirmedRound) + 1,
        filters: filter,
        arc28Events,
      },
      localnet.context.algod,
      localnet.context.indexer,
    )
    return subscribed
  }

  const subscribeAndVerify = async (filter: TransactionFilter, result: SendTransactionResult, arc28Events?: Arc28EventGroup[]) => {
    const subscribed = await subscribeAlgod(filter, result, arc28Events)
    expect(subscribed.subscribedTransactions.length).toBe(1)
    expect(subscribed.subscribedTransactions[0].id).toBe(result.transaction.txID())

    return subscribed
  }

  const subscribeAndVerifyFilter = async (
    filter: TransactionFilter,
    result: SendTransactionResult | SendTransactionResult[],
    arc28Events?: Arc28EventGroup[],
  ) => {
    const results = Array.isArray(result) ? result : [result]
    const [algod, indexer] = await Promise.all([
      subscribeAlgod(filter, results[0], arc28Events),
      subscribeIndexer(filter, results[0], arc28Events),
    ])

    expect(algod.subscribedTransactions.length).toBe(results.length)
    expect(algod.subscribedTransactions.map((s) => s.id)).toEqual(results.map((r) => r.transaction.txID()))
    expect(indexer.subscribedTransactions.length).toBe(results.length)
    expect(indexer.subscribedTransactions.map((s) => s.id)).toEqual(results.map((r) => r.transaction.txID()))

    return { algod, indexer }
  }

  const extractFromGroupResult = (groupResult: Omit<SendAtomicTransactionComposerResults, 'returns'>, index: number) => {
    return {
      transaction: groupResult.transactions[index],
      confirmation: groupResult.confirmations?.[index],
    }
  }

  return {
    localnet,
    systemAccount: () => systemAccount,
    subscribeAlgod,
    subscribeIndexer,
    subscribeAndVerify,
    subscribeAndVerifyFilter,
    extractFromGroupResult,
    beforeEach: async () => {
      await localnet.beforeEach()
    },
    beforeAll: async () => {
      await localnet.beforeEach()

      systemAccount = await localnet.context.generateAccount({ initialFunds: (100).algos() })
    },
    afterEach: async () => {
      vitest.clearAllMocks()
    },
  }
}
