import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import type { AddressWithSigners } from '@algorandfoundation/algokit-utils/transact'
import { TransactionType } from '@algorandfoundation/algokit-utils/transact'
import { SendTransactionComposerResults, SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vitest } from 'vitest'
import { TransactionFilter } from '../../src/types'
import { app } from '../testing-app'
import { GetSubscribedTransactions, SendXTransactions } from '../transactions'

describe('Inner transactions', () => {
  const localnet = algorandFixture()
  let systemAccount: AddressWithSigners

  beforeAll(async () => {
    await localnet.beforeEach()
    systemAccount = await localnet.context.generateAccount({ initialFunds: (100).algos() })
  })

  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    vitest.clearAllMocks()
  })

  const subscribeAndVerifyFilter = async (filter: TransactionFilter, ...result: (SendTransactionResult & { id: string })[]) => {
    // Ensure there is another transaction so algod subscription can process something
    await SendXTransactions(1, systemAccount, localnet.algorand)
    // Wait for indexer to catch up
    await localnet.context.waitForIndexer()
    // Run the subscription twice - once that will pick up using algod and once using indexer
    // this allows the filtering logic for both to be tested
    const [algod, indexer] = await Promise.all([
      GetSubscribedTransactions(
        {
          roundsToSync: 1,
          syncBehaviour: 'sync-oldest',
          watermark: (result[result.length - 1].confirmation?.confirmedRound ?? 0n) - 1n,
          currentRound: result[result.length - 1].confirmation?.confirmedRound,
          filters: filter,
        },
        localnet.algorand,
      ),
      GetSubscribedTransactions(
        {
          roundsToSync: 1,
          syncBehaviour: 'catchup-with-indexer',
          watermark: 0n,
          currentRound: (result[result.length - 1].confirmation?.confirmedRound ?? 0n) + 1n,
          filters: filter,
        },
        localnet.algorand,
      ),
    ])

    expect(algod.subscribedTransactions.length).toBe(result.length)
    expect(algod.subscribedTransactions.map((t) => t.id)).toEqual(result.map((r) => r.id))
    expect(indexer.subscribedTransactions.length).toBe(result.length)
    expect(indexer.subscribedTransactions.map((t) => t.id)).toEqual(result.map((r) => r.id))
    return { algod, indexer }
  }

  const extractFromGroupResult = (
    groupResult: Omit<SendTransactionComposerResults, 'returns'>,
    index: number,
    innerTransactionIndex?: number,
  ) => {
    return {
      id:
        innerTransactionIndex !== undefined
          ? `${groupResult.transactions[index].txId()}/inner/${innerTransactionIndex + 1}`
          : groupResult.transactions[index].txId(),
      transaction:
        innerTransactionIndex !== undefined
          ? groupResult.confirmations![index].innerTxns![innerTransactionIndex].txn.txn
          : groupResult.transactions[index],
      confirmation: groupResult.confirmations?.[index],
    }
  }

  test('Is processed alongside normal transaction', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount })

    const txns = await localnet.algorand
      .newGroup()
      .addPayment({
        amount: (100_001).microAlgos(),
        receiver: app1.appClient.appAddress,
        sender: testAccount.addr,
      })
      .addPayment({
        amount: (1).microAlgos(),
        receiver: testAccount.addr,
        sender: testAccount.addr,
      })
      .addAppCallMethodCall(
        await app1.appClient.params.issueTransferToSender({
          args: { amount: 1 },
          sender: testAccount.addr,
          staticFee: (2000).microAlgos(),
        }),
      )
      .send()

    await subscribeAndVerifyFilter(
      {
        type: TransactionType.Payment,
        receiver: testAccount.addr.toString(),
        maxAmount: 1,
      },
      extractFromGroupResult(txns, 1),
      extractFromGroupResult(txns, 2, 0),
    )
  })
})
