import { ApplicationOnComplete } from '@algorandfoundation/algokit-utils/types/indexer'
import { SendAtomicTransactionComposerResults } from '@algorandfoundation/algokit-utils/types/transaction'
import { Account, TransactionType } from 'algosdk'
import { afterEach, beforeAll, beforeEach, describe, test } from 'vitest'
import { TestingAppFactory } from '../contract/client'
import { filterFixture } from '../filterFixture'
import { app } from '../testing-app'

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
    const create = await localnet.algorand
      .newGroup()
      .addTransaction(await createAssetTxn(creator ?? systemAccount()))
      .send()

    return {
      assetId: BigInt(create.confirmations[0].assetIndex!),
      ...create,
    }
  }

  const createAssetTxn = async (creator: Account) => {
    return await localnet.algorand.createTransaction.assetCreate({
      sender: creator ? creator.addr : systemAccount().addr,
      decimals: 0,
      total: 100n,
    })
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
    const { generateAccount } = localnet.context
    const testAccount = await generateAccount({ initialFunds: (10).algos() })
    const account2 = await generateAccount({ initialFunds: (3).algos() })
    const account3 = localnet.algorand.account.random().account
    const txns = await localnet.algorand
      .newGroup()
      .addPayment({
        sender: testAccount.addr,
        receiver: account2.addr,
        amount: (1).algos(),
        note: 'a',
      })
      .addPayment({
        sender: testAccount.addr,
        receiver: account3.addr,
        amount: (2).algos(),
        note: 'b',
      })
      .addPayment({
        sender: account2.addr,
        receiver: testAccount.addr,
        amount: (1).algos(),
        note: 'c',
      })
      .send()

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
          receiver: account2.addr.toString(),
        },
        extractFromGroupResult(txns, 0),
      )
    })
    test('Single sender', async () => {
      const { account2, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          sender: account2.addr.toString(),
        },
        extractFromGroupResult(txns, 2),
      )
    })
    test('Multiple receivers', async () => {
      const { account2, account3, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          receiver: [account2.addr.toString(), account3.addr.toString()],
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 1)],
      )
    })
    test('Multiple senders', async () => {
      const { testAccount, account2, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          sender: [testAccount.addr.toString(), account2.addr.toString()],
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 1), extractFromGroupResult(txns, 2)],
      )
    })

    test('Works for min amount of algos', async () => {
      const { testAccount, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
          minAmount: (1).algos().microAlgos + 1n,
        },
        extractFromGroupResult(txns, 1),
      )
    })

    test('Works for max amount of algos', async () => {
      const { testAccount, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
          maxAmount: (1).algos().microAlgos + 1n,
        },
        extractFromGroupResult(txns, 0),
      )
    })

    test('Works for note prefix', async () => {
      const { testAccount, txns } = algoTransfersData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
          notePrefix: 'a',
        },
        extractFromGroupResult(txns, 0),
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
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
    const { generateAccount } = localnet.context
    const testAccount = await generateAccount({ initialFunds: (10).algos() })
    const asset1 = await createAsset(testAccount)
    const asset2 = await createAsset()
    const txns = await localnet.algorand.send
      .newGroup()
      .addAssetOptIn({
        sender: testAccount.addr,
        assetId: asset1.assetId,
      })
      .addAssetOptIn({
        sender: testAccount.addr,
        assetId: asset2.assetId,
      })
      .addTransaction(await createAssetTxn(testAccount))
      .addAssetTransfer({
        assetId: asset1.assetId,
        amount: 1n,
        sender: testAccount.addr,
        receiver: testAccount.addr,
      })
      .addAssetTransfer({
        assetId: asset1.assetId,
        amount: 2n,
        sender: testAccount.addr,
        receiver: testAccount.addr,
      })
      .send()

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
          sender: testAccount.addr.toString(),
          assetId: asset1.assetId,
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 3), extractFromGroupResult(txns, 4)],
      )
    })

    test('Works for multiple asset IDs', async () => {
      const { testAccount, asset1, asset2, txns } = assetsData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
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
          sender: testAccount.addr.toString(),
          assetCreate: true,
        },
        extractFromGroupResult(txns, 2),
      )
    })

    test('Works for transaction type(s)', async () => {
      const { testAccount, txns } = assetsData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
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
          sender: testAccount.addr.toString(),
          type: TransactionType.acfg,
        },
        extractFromGroupResult(txns, 2),
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
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
          sender: testAccount.addr.toString(),
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
          sender: testAccount.addr.toString(),
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
          sender: testAccount.addr.toString(),
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
          sender: testAccount.addr.toString(),
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
        app1: Awaited<ReturnType<TestingAppFactory['send']['create']['bare']>>
        app2: Awaited<ReturnType<TestingAppFactory['send']['create']['bare']>>
        testAccount: Account
        txns: SendAtomicTransactionComposerResults
      }
    | undefined = undefined
  const appsFixture = async () => {
    const { generateAccount } = localnet.context
    const testAccount = await generateAccount({ initialFunds: (10).algos() })

    const temp = await app({ create: false, algorand: localnet.algorand, creator: testAccount })
    await localnet.algorand.send.newGroup().addTransaction(temp).send()

    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount(), note: 'app1' })
    const app2 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount(), note: 'app2' })
    const txns = await localnet.algorand
      .newGroup()
      .addAppCallMethodCall(await app1.appClient.params.callAbi({ args: { value: 'test1' }, sender: testAccount.addr }))
      .addAppCallMethodCall(await app2.appClient.params.callAbi({ args: { value: 'test2' }, sender: testAccount.addr }))
      .addTransaction(await app({ create: false, algorand: localnet.algorand, creator: testAccount }))
      .addAppCallMethodCall(await app1.appClient.params.optIn.optIn({ sender: testAccount.addr, args: {} }))
      .send()

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
          sender: testAccount.addr.toString(),
          appCreate: true,
        },
        extractFromGroupResult(txns, 2),
      )
    })

    test('Works for app ID(s)', async () => {
      const { testAccount, app1, app2, txns } = appData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
          appId: Number(app1.result.confirmation!.applicationIndex!),
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 3)],
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
          appId: [Number(app1.result.confirmation!.applicationIndex!), Number(app2.result.confirmation!.applicationIndex!)],
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 1), extractFromGroupResult(txns, 3)],
      )
    })

    test('Works for on-complete(s)', async () => {
      const { testAccount, txns } = appData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
          appOnComplete: ApplicationOnComplete.optin,
        },
        extractFromGroupResult(txns, 3),
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
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
          sender: testAccount.addr.toString(),
          methodSignature: 'opt_in()void',
        },
        extractFromGroupResult(txns, 3),
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
          methodSignature: ['opt_in()void', 'madeUpMethod()void'],
        },
        extractFromGroupResult(txns, 3),
      )

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
          methodSignature: ['opt_in()void', 'call_abi(string)string'],
        },
        [extractFromGroupResult(txns, 0), extractFromGroupResult(txns, 1), extractFromGroupResult(txns, 3)],
      )
    })

    test('Works for app args', async () => {
      const { testAccount, txns } = appData!

      await subscribeAndVerifyFilter(
        {
          sender: testAccount.addr.toString(),
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
        sender: testAccount.addr.toString(),
        customFilter: (t) => t.id === txns.txIds[1],
      },
      extractFromGroupResult(txns, 1),
    )
  })
})
