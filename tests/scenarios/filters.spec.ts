import * as algokit from '@algorandfoundation/algokit-utils'
import { ApplicationOnComplete } from '@algorandfoundation/algokit-utils/types/indexer'
import { SendAtomicTransactionComposerResults } from '@algorandfoundation/algokit-utils/types/transaction'
import algosdk, { Account, TransactionType } from 'algosdk'
import { afterEach, beforeAll, beforeEach, describe, test } from 'vitest'
import { TestingAppClient } from '../contract/client'
import { filterFixture } from '../filterFixture'

describe('Subscribing using various filters', () => {
  const { localnet, systemAccount, subscribeAndVerifyFilter, extractFromGroupResult, ...hooks } = filterFixture()
  const beforeAllFixtures: (() => Promise<void>)[] = []
  beforeAll(async () => {
    await hooks.beforeAll()
    await Promise.all(beforeAllFixtures.map(async (fixture) => await fixture()))
    await localnet.context.waitForIndexer()
  }, 30_000)
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

  let algoTransfersData:
    | {
        testAccount: Account
        account2: Account
        account3: Account
        txns: SendAtomicTransactionComposerResults
      }
    | undefined = undefined
  const algoTransfersFixture = async () => {
    const { algod, generateAccount } = localnet.context
    const testAccount = await generateAccount({ initialFunds: (10).algos() })
    const account2 = await generateAccount({ initialFunds: (3).algos() })
    const account3 = algokit.randomAccount()
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          await algokit.transferAlgos({ amount: (1).algos(), from: testAccount, to: account2, note: 'a', skipSending: true }, algod),
          await algokit.transferAlgos({ amount: (2).algos(), from: testAccount, to: account3, note: 'b', skipSending: true }, algod),
          await algokit.transferAlgos({ amount: (1).algos(), from: account2, to: testAccount, note: 'c', skipSending: true }, algod),
        ].map((t) => ({
          transaction: t.transaction,
          signer: algosdk.encodeAddress(t.transaction.from.publicKey) === testAccount.addr ? testAccount : account2,
        })),
      },
      algod,
    )

    algoTransfersData = {
      testAccount,
      account2,
      account3,
      txns,
    }
  }
  beforeAllFixtures.push(algoTransfersFixture)

  describe('Algo transfers', () => {
    test('Single receiver', async () => {
      const { account2, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          receiver: account2.addr,
        },
        extractFromGroupResult(txns, 0),
      )
    })
    test('Single sender', async () => {
      const { account2, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          sender: account2.addr,
        },
        extractFromGroupResult(txns, 2),
      )
    })
    test('Multiple receivers', async () => {
      const { account2, account3, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          receiver: [account2.addr, account3.addr],
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 1)],
      )
    })
    test('Multiple senders', async () => {
      const { testAccount, account2, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          sender: [testAccount.addr, account2.addr],
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 1), extractFromGroupResult(txns, 2)],
      )
    })

    test('Works for min amount of algos', async () => {
      const { testAccount, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          minAmount: (1).algos().microAlgos + 1,
        },
        extractFromGroupResult(txns, 1),
      )
    })

    test('Works for max amount of algos', async () => {
      const { testAccount, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          maxAmount: (1).algos().microAlgos + 1,
        },
        extractFromGroupResult(txns, 0),
      )
    })

    test('Works for note prefix', async () => {
      const { testAccount, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          notePrefix: 'a',
        },
        extractFromGroupResult(txns, 0),
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          notePrefix: 'b',
        },
        extractFromGroupResult(txns, 1),
      )
    })
  })

  let assetsData:
    | {
        asset1: Awaited<ReturnType<typeof createAsset>>
        asset2: Awaited<ReturnType<typeof createAsset>>
        testAccount: Account
        txns: SendAtomicTransactionComposerResults
      }
    | undefined = undefined
  const assetsFixture = async () => {
    const { algod, generateAccount } = localnet.context
    const testAccount = await generateAccount({ initialFunds: (10).algos() })
    const asset1 = await createAsset(testAccount)
    const asset2 = await createAsset()
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          algokit.assetOptIn({ account: testAccount, assetId: asset1.assetId, skipSending: true }, algod),
          algokit.assetOptIn({ account: testAccount, assetId: asset2.assetId, skipSending: true }, algod),
          await createAssetTxn(testAccount),
          algokit.transferAsset({ assetId: asset1.assetId, amount: 1, from: testAccount, to: testAccount, skipSending: true }, algod),
          algokit.transferAsset({ assetId: asset1.assetId, amount: 2, from: testAccount, to: testAccount, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    assetsData = {
      asset1,
      asset2,
      testAccount,
      txns,
    }
  }
  beforeAllFixtures.push(assetsFixture)

  describe('Asset transactions', () => {
    test('Works for single asset ID', async () => {
      const { testAccount, asset1, txns } = assetsData!
      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          assetId: asset1.assetId,
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 3), extractFromGroupResult(txns, 4)],
      )
    })

    test('Works for multiple asset IDs', async () => {
      const { testAccount, asset1, asset2, txns } = assetsData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          assetId: [asset1.assetId, asset2.assetId],
        },
        [
          extractFromGroupResult(txns, 0),
          extractFromGroupResult(txns, 1),
          extractFromGroupResult(txns, 3),
          extractFromGroupResult(txns, 4),
        ],
      )
    })

    test('Works for asset create', async () => {
      const { testAccount, txns } = assetsData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          assetCreate: true,
        },
        extractFromGroupResult(txns, 2),
      )
    })

    test('Works for transaction type(s)', async () => {
      const { testAccount, txns } = assetsData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          type: TransactionType.axfer,
        },
        [
          extractFromGroupResult(txns, 0),
          extractFromGroupResult(txns, 1),
          extractFromGroupResult(txns, 3),
          extractFromGroupResult(txns, 4),
        ],
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          type: TransactionType.acfg,
        },
        extractFromGroupResult(txns, 2),
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          type: [TransactionType.acfg, TransactionType.axfer],
        },
        [
          extractFromGroupResult(txns, 0),
          extractFromGroupResult(txns, 1),
          extractFromGroupResult(txns, 2),
          extractFromGroupResult(txns, 3),
          extractFromGroupResult(txns, 4),
        ],
      )
    })

    test('Works for min amount of asset', async () => {
      const { testAccount, txns } = assetsData!

      await subscribeAndVerifyFilter(
        {
          type: TransactionType.axfer,
          sender: testAccount.addr,
          minAmount: 2,
        },
        extractFromGroupResult(txns, 4),
      )
    })

    test('Works for max amount of asset', async () => {
      const { testAccount, txns } = assetsData!

      await subscribeAndVerifyFilter(
        {
          type: TransactionType.axfer,
          sender: testAccount.addr,
          maxAmount: 1,
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 1), extractFromGroupResult(txns, 3)],
      )
    })

    test('Works for max amount of asset with asset ID', async () => {
      const { testAccount, txns, asset1 } = assetsData!

      await subscribeAndVerifyFilter(
        {
          type: TransactionType.axfer,
          sender: testAccount.addr,
          maxAmount: 1,
          assetId: asset1.assetId,
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 3)],
      )
    })

    test('Works for min and max amount of asset with asset ID', async () => {
      const { testAccount, txns, asset1 } = assetsData!

      await subscribeAndVerifyFilter(
        {
          type: TransactionType.axfer,
          sender: testAccount.addr,
          minAmount: 1,
          maxAmount: 1,
          assetId: asset1.assetId,
        },
        [extractFromGroupResult(txns, 3)],
      )
    })
  })

  let appData:
    | {
        app1: Awaited<ReturnType<typeof app>>
        app2: Awaited<ReturnType<typeof app>>
        testAccount: Account
        txns: SendAtomicTransactionComposerResults
      }
    | undefined = undefined
  const appsFixture = async () => {
    const { algod, generateAccount } = localnet.context
    const testAccount = await generateAccount({ initialFunds: (10).algos() })
    const app1 = await app({ create: true })
    const app2 = await app({ create: true })
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: 'test1' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app2.app.callAbi({ value: 'test2' }, { sender: testAccount, sendParams: { skipSending: true } }),
          (await app({ create: false }, testAccount)).creation.transaction,
          app1.app.optIn.optIn({}, { sender: testAccount, sendParams: { skipSending: true } }),
        ],
        signer: testAccount,
      },
      algod,
    )

    appData = {
      app1,
      app2,
      testAccount,
      txns,
    }
  }
  beforeAllFixtures.push(appsFixture)

  describe('App transactions', () => {
    test('Works for app create', async () => {
      const { testAccount, txns } = appData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          appCreate: true,
        },
        extractFromGroupResult(txns, 2),
      )
    })

    test('Works for app ID(s)', async () => {
      const { testAccount, app1, app2, txns } = appData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          appId: Number(app1.creation.confirmation!.applicationIndex!),
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 3)],
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          appId: [Number(app1.creation.confirmation!.applicationIndex!), Number(app2.creation.confirmation!.applicationIndex!)],
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 1), extractFromGroupResult(txns, 3)],
      )
    })

    test('Works for on-complete(s)', async () => {
      const { testAccount, txns } = appData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          appOnComplete: ApplicationOnComplete.optin,
        },
        extractFromGroupResult(txns, 3),
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          appOnComplete: [ApplicationOnComplete.optin, ApplicationOnComplete.noop],
        },
        [
          extractFromGroupResult(txns, 0),
          extractFromGroupResult(txns, 1),
          extractFromGroupResult(txns, 2),
          extractFromGroupResult(txns, 3),
        ],
      )
    })

    test('Works for method signature(s)', async () => {
      const { testAccount, txns } = appData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          methodSignature: 'opt_in()void',
        },
        extractFromGroupResult(txns, 3),
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          methodSignature: ['opt_in()void', 'madeUpMethod()void'],
        },
        extractFromGroupResult(txns, 3),
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          methodSignature: ['opt_in()void', 'call_abi(string)string'],
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 1), extractFromGroupResult(txns, 3)],
      )
    })

    test('Works for app args', async () => {
      const { testAccount, txns } = appData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr,
          // ARC-4 string has first 2 bytes with length of the string so slice them off before comparing
          appCallArgumentsMatch: (args) => !!args && args.length > 1 && Buffer.from(args[1].slice(2)).toString('utf-8') === 'test1',
        },
        extractFromGroupResult(txns, 0),
      )
    })
  })

  test('Works for custom filter', async () => {
    const { testAccount, txns } = algoTransfersData!

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        customFilter: (t) => t.id === txns.txIds[1],
      },
      extractFromGroupResult(txns, 1),
    )
  })
})
