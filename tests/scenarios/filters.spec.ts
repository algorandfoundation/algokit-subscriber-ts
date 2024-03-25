import * as algokit from '@algorandfoundation/algokit-utils'
import { ApplicationOnComplete } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk, { Account, TransactionType } from 'algosdk'
import { afterEach, beforeAll, beforeEach, describe, test } from 'vitest'
import { TestingAppClient } from '../contract/client'
import { filterFixture } from '../filterFixture'

describe('Subscribing using various filters', () => {
  const { localnet, systemAccount, subscribeAndVerifyFilter, extractFromGroupResult, ...hooks } = filterFixture()
  beforeAll(hooks.beforeAll, 10_000)
  beforeEach(hooks.beforeEach, 10_000)
  afterEach(hooks.afterEach)

  const createAsset = async (creator?: Account) => {
    const create = await algokit.sendTransaction(
      {
        from: creator ?? systemAccount(),
        transaction: await createAssetTxn(creator ?? systemAccount()),
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
      from: creator ? creator.addr : systemAccount().addr,
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
      sender: creator ?? systemAccount(),
      sendParams: {
        skipSending: !config.create,
      },
    })

    return {
      app,
      creation,
    }
  }

  test('Works for receiver', async () => {
    const { testAccount, algod } = localnet.context
    const account2 = algokit.randomAccount()
    const amount = (1).algos()
    const account3 = algokit.randomAccount()
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.transferAlgos({ amount, from: testAccount, to: account2, skipSending: true }, algod),
          algokit.transferAlgos({ amount, from: testAccount, to: account3, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        receiver: account2.addr,
      },
      extractFromGroupResult(txns, 0),
    )
  })

  test('Works for min amount of algos', async () => {
    const { testAccount, algod } = localnet.context
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.transferAlgos({ amount: (1).algos(), from: testAccount, to: testAccount, skipSending: true }, algod),
          algokit.transferAlgos({ amount: (2).algos(), from: testAccount, to: testAccount, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        minAmount: (1).algos().microAlgos + 1,
      },
      extractFromGroupResult(txns, 1),
    )
  })

  test('Works for max amount of algos', async () => {
    const { testAccount, algod } = localnet.context
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.transferAlgos({ amount: (1).algos(), from: testAccount, to: testAccount, skipSending: true }, algod),
          algokit.transferAlgos({ amount: (2).algos(), from: testAccount, to: testAccount, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        maxAmount: (1).algos().microAlgos + 1,
      },
      extractFromGroupResult(txns, 0),
    )
  })

  test('Works for note prefix', async () => {
    const { testAccount, algod } = localnet.context
    const amount = (1).algos()
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.transferAlgos({ amount, from: testAccount, to: testAccount, note: 'a', skipSending: true }, algod),
          algokit.transferAlgos({ amount, from: testAccount, to: testAccount, note: 'b', skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        notePrefix: 'a',
      },
      extractFromGroupResult(txns, 0),
    )
  })

  test('Works for asset ID', async () => {
    const { testAccount, algod } = localnet.context
    const asset1 = await createAsset()
    const asset2 = await createAsset()
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.assetOptIn({ account: testAccount, assetId: asset1.assetId, skipSending: true }, algod),
          algokit.assetOptIn({ account: testAccount, assetId: asset2.assetId, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        assetId: asset1.assetId,
      },
      extractFromGroupResult(txns, 0),
    )
  })

  test('Works for asset create', async () => {
    const { testAccount, algod } = localnet.context
    const asset1 = await createAsset()
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.assetOptIn({ account: testAccount, assetId: asset1.assetId, skipSending: true }, algod),
          await createAssetTxn(testAccount),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        assetCreate: true,
      },
      extractFromGroupResult(txns, 1),
    )
  })

  test('Works for asset config txn', async () => {
    const { testAccount, algod } = localnet.context
    const asset1 = await createAsset()
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.assetOptIn({ account: testAccount, assetId: asset1.assetId, skipSending: true }, algod),
          await createAssetTxn(testAccount),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        type: TransactionType.acfg,
      },
      extractFromGroupResult(txns, 1),
    )
  })

  test('Works for asset transfer txn', async () => {
    const { testAccount, algod } = localnet.context
    const asset1 = await createAsset()
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.assetOptIn({ account: testAccount, assetId: asset1.assetId, skipSending: true }, algod),
          await createAssetTxn(testAccount),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        type: TransactionType.axfer,
      },
      extractFromGroupResult(txns, 0),
    )
  })

  test('Works for min amount of asset', async () => {
    const { testAccount, algod } = localnet.context
    const asset1 = await createAsset(testAccount)
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.transferAsset({ assetId: asset1.assetId, amount: 1, from: testAccount, to: testAccount, skipSending: true }, algod),
          algokit.transferAsset({ assetId: asset1.assetId, amount: 2, from: testAccount, to: testAccount, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        type: TransactionType.axfer,
        sender: testAccount.addr,
        minAmount: 2,
      },
      extractFromGroupResult(txns, 1),
    )
  })

  test('Works for max amount of asset', async () => {
    const { testAccount, algod } = localnet.context
    const asset1 = await createAsset(testAccount)
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.transferAsset({ assetId: asset1.assetId, amount: 1, from: testAccount, to: testAccount, skipSending: true }, algod),
          algokit.transferAsset({ assetId: asset1.assetId, amount: 2, from: testAccount, to: testAccount, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        type: TransactionType.axfer,
        sender: testAccount.addr,
        maxAmount: 1,
      },
      extractFromGroupResult(txns, 0),
    )
  })

  test('Works for app create', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: 'test' }, { sender: testAccount, sendParams: { skipSending: true } }),
          (await app({ create: false }, testAccount)).creation.transaction,
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        appCreate: true,
      },
      extractFromGroupResult(txns, 1),
    )
  })

  test('Works for app ID', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const app2 = await app({ create: true })
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: 'test' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app2.app.callAbi({ value: 'test' }, { sender: testAccount, sendParams: { skipSending: true } }),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        appId: Number(app1.creation.confirmation!.applicationIndex!),
      },
      extractFromGroupResult(txns, 0),
    )
  })

  test('Works for on-complete', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: 'test' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app1.app.optIn.optIn({}, { sender: testAccount, sendParams: { skipSending: true } }),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        appOnComplete: ApplicationOnComplete.optin,
      },
      extractFromGroupResult(txns, 1),
    )
  })

  test('Works for method signature', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: 'test' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app1.app.optIn.optIn({}, { sender: testAccount, sendParams: { skipSending: true } }),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        methodSignature: 'opt_in()void',
      },
      extractFromGroupResult(txns, 1),
    )
  })

  test('Works for method signatures', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: 'test' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app1.app.optIn.optIn({}, { sender: testAccount, sendParams: { skipSending: true } }),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        methodSignatures: ['opt_in()void', 'madeUpMethod()void'],
      },
      extractFromGroupResult(txns, 1),
    )
  })

  test('Works for app args', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: 'test1' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app1.app.callAbi({ value: 'test2' }, { sender: testAccount, sendParams: { skipSending: true } }),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        // ARC-4 string has first 2 bytes with length of the string so slice them off before comparing
        appCallArgumentsMatch: (args) => !!args && Buffer.from(args[1].slice(2)).toString('utf-8') === 'test1',
      },
      extractFromGroupResult(txns, 0),
    )
  })

  test('Works for custom', async () => {
    const { testAccount, algod } = localnet.context
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.transferAlgos({ amount: (1).algos(), from: testAccount, to: testAccount, skipSending: true }, algod),
          algokit.transferAlgos({ amount: (2).algos(), from: testAccount, to: testAccount, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        customFilter: (t) => t.id === txns.txIds[1],
      },
      extractFromGroupResult(txns, 1),
    )
  })
})
