import * as algokit from '@algorandfoundation/algokit-utils'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { SendAtomicTransactionComposerResults, SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import algosdk, { Account, Transaction, TransactionType } from 'algosdk'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vitest } from 'vitest'
import { TransactionFilter } from '../../src/types'
import { TestingAppClient } from '../contract/client'
import { GetSubscribedTransactions, SendXTransactions } from '../transactions'

describe('Inner transactions', () => {
  const localnet = algorandFixture()
  let systemAccount: Account

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
    await SendXTransactions(1, systemAccount, localnet.context.algod)
    // Wait for indexer to catch up
    await localnet.context.waitForIndexer()
    // Run the subscription twice - once that will pick up using algod and once using indexer
    // this allows the filtering logic for both to be tested
    const [algod, indexer] = await Promise.all([
      GetSubscribedTransactions(
        {
          roundsToSync: 1,
          syncBehaviour: 'sync-oldest',
          watermark: Number(result[result.length - 1].confirmation?.confirmedRound) - 1,
          currentRound: Number(result[result.length - 1].confirmation?.confirmedRound),
          filters: filter,
        },
        localnet.context.algod,
      ),
      GetSubscribedTransactions(
        {
          roundsToSync: 1,
          syncBehaviour: 'catchup-with-indexer',
          watermark: 0,
          currentRound: Number(result[result.length - 1].confirmation?.confirmedRound) + 1,
          filters: filter,
        },
        localnet.context.algod,
        localnet.context.indexer,
      ),
    ])

    expect(algod.subscribedTransactions.length).toBe(result.length)
    expect(algod.subscribedTransactions.map((t) => t.id)).toEqual(result.map((r) => r.id))
    expect(indexer.subscribedTransactions.length).toBe(result.length)
    expect(indexer.subscribedTransactions.map((t) => t.id)).toEqual(result.map((r) => r.id))
    return { algod, indexer }
  }

  const extractFromGroupResult = (
    groupResult: Omit<SendAtomicTransactionComposerResults, 'returns'>,
    index: number,
    innerTransactionIndex?: number,
  ) => {
    return {
      id:
        innerTransactionIndex !== undefined
          ? `${groupResult.transactions[index].txID()}/inner/${innerTransactionIndex + 1}`
          : groupResult.transactions[index].txID(),
      transaction:
        innerTransactionIndex !== undefined
          ? Transaction.from_obj_for_encoding({
              ...groupResult.confirmations![index].innerTxns![innerTransactionIndex].txn.txn,
              gen: groupResult.confirmations![index].txn.txn.gen,
              gh: groupResult.confirmations![index].txn.txn.gh,
            })
          : groupResult.transactions[index],
      confirmation: groupResult.confirmations?.[index],
    }
  }

  const createAsset = async (creator?: Account) => {
    const create = await algokit.sendTransaction(
      {
        from: creator ?? systemAccount,
        transaction: await createAssetTxn(creator ?? systemAccount),
      },
      localnet.context.algod,
    )

    return {
      assetId: Number(create.confirmation!.assetIndex!),
      ...create,
    }
  }

  const createAssetTxn = async (creator: Account) => {
    return algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: creator ? creator.addr : systemAccount.addr,
      decimals: 0,
      total: 100,
      defaultFrozen: false,
      suggestedParams: await algokit.getTransactionParams(undefined, localnet.context.algod),
    })
  }

  const app = async (config: { create: boolean }, creator?: Account) => {
    const app = new TestingAppClient(
      {
        resolveBy: 'id',
        id: 0,
      },
      localnet.context.algod,
    )
    const creation = await app.create.bare({
      sender: creator ?? systemAccount,
      sendParams: {
        skipSending: !config.create,
      },
    })

    return {
      app,
      creation,
    }
  }

  test('Is processed alongside normal transaction', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.transferAlgos(
            {
              amount: (100_001).microAlgos(),
              to: (await app1.app.appClient.getAppReference()).appAddress,
              from: testAccount,
              skipSending: true,
            },
            algod,
          ),
          algokit.transferAlgos(
            {
              amount: (1).microAlgos(),
              to: testAccount,
              from: testAccount,
              skipSending: true,
            },
            algod,
          ),
          app1.app.issueTransferToSender(
            { amount: 1 },
            { sender: testAccount, sendParams: { skipSending: true, fee: (2000).microAlgos() } },
          ),
        ],
        signer: testAccount,
      },
      algod,
    )
    await subscribeAndVerifyFilter(
      {
        type: TransactionType.pay,
        receiver: testAccount.addr,
        maxAmount: 1,
      },
      extractFromGroupResult(txns, 1),
      extractFromGroupResult(txns, 2, 0),
    )
  })
})
