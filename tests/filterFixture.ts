import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { AlgorandFixtureConfig } from '@algorandfoundation/algokit-utils/types/testing'
import { SendAtomicTransactionComposerResults, SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import { Account, Indexer } from 'algosdk'
import { expect, vitest } from 'vitest'
import { Arc28EventGroup, TransactionFilter } from '../src/types'
import { GetSubscribedTransactions, SendXTransactions } from './transactions'

export async function waitForIndexerToIndexRound(round: number, indexer: Indexer): Promise<void> {
  let caughtUp = false
  let tries = 0
  while (!caughtUp) {
    const status = await indexer.makeHealthCheck().do()
    if (Number(status.round) >= round) {
      caughtUp = true
    } else {
      tries++
      if (tries > 20) {
        throw new Error(`Indexer did not catch up to round ${round} within 20s; received round ${2} instead`)
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 1000))
    }
  }
}

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
    const { txIds } = await SendXTransactions(1, systemAccount, localnet.context.algod)
    // Wait for indexer to catch up
    //await localnet.context.waitForIndexerTransaction(txIds[0])
    await waitForIndexerToIndexRound(Number(result.confirmation!.confirmedRound), localnet.context.indexer)
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

  const subscribeAndVerifyFilter = async (filter: TransactionFilter, result: SendTransactionResult, arc28Events?: Arc28EventGroup[]) => {
    const [algod, indexer] = await Promise.all([subscribeAlgod(filter, result, arc28Events), subscribeIndexer(filter, result, arc28Events)])

    expect(algod.subscribedTransactions.length).toBe(1)
    expect(algod.subscribedTransactions[0].id).toBe(result.transaction.txID())
    expect(indexer.subscribedTransactions.length).toBe(1)
    expect(indexer.subscribedTransactions[0].id).toBe(result.transaction.txID())

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
