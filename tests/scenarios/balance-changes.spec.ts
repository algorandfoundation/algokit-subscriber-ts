import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk, { SuggestedParams } from 'algosdk'
import invariant from 'tiny-invariant'
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { BalanceChangeRole } from '../../src/types'
import { filterFixture } from '../filterFixture'

describe('Subscribing to calls that effect balance changes', () => {
  const {
    localnet,
    systemAccount,
    subscribeAlgod,
    subscribeIndexer,
    subscribeAndVerify,
    subscribeAndVerifyFilter,
    extractFromGroupResult,
    ...hooks
  } = filterFixture()

  beforeAll(hooks.beforeAll, 10_000)
  beforeEach(hooks.beforeEach, 10_000)
  afterEach(hooks.afterEach)
  const acfgCreate = (params: SuggestedParams, from: string, fee: number, total?: bigint | number) => {
    params.fee = fee
    params.flatFee = true
    return algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      suggestedParams: params,
      from,
      decimals: 0,
      total: total ?? 100,
      defaultFrozen: false,
      clawback: from,
      manager: from,
    })
  }

  const acfgDestroy = (params: SuggestedParams, from: string, fee: number, assetIndex: number) => {
    params.fee = fee
    params.flatFee = true
    return algosdk.makeAssetDestroyTxnWithSuggestedParamsFromObject({
      suggestedParams: params,
      from,
      assetIndex,
    })
  }

  const pay = (params: SuggestedParams, amount: number, from: string, to: string, fee: number, closeRemainderTo?: string) => {
    params.fee = fee
    params.flatFee = true
    return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams: params,
      amount,
      from,
      to,
      closeRemainderTo,
    })
  }

  const axfer = (
    params: SuggestedParams,
    assetId: number | bigint,
    amount: number | bigint,
    from: string,
    to: string,
    revocationTarget?: string,
    closeRemainderTo?: string,
  ) => {
    return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams: params,
      amount,
      from,
      to,
      closeRemainderTo,
      assetIndex: Number(assetId),
      revocationTarget,
    })
  }

  test('Works for asset create transactions', async () => {
    // Assets are always minted into the creator/sender account, even if a reserve address is supplied
    const { testAccount, algod } = localnet.context
    const params = await algokit.getTransactionParams(undefined, algod)
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          {
            signer: testAccount,
            transaction: acfgCreate(params, testAccount.addr, 2000, 100_000_000),
          },
        ],
      },
      algod,
    )
    const asset = txns.confirmations![0].assetIndex!

    const subscription = await subscribeAndVerify(
      {
        balanceChanges: [
          {
            role: [BalanceChangeRole.AssetCreator],
          },
        ],
      },
      extractFromGroupResult(txns, 0),
    )

    const transaction = subscription.subscribedTransactions[0]
    invariant(transaction.balanceChanges)
    expect(transaction.balanceChanges.length).toBe(2)

    expect(transaction.balanceChanges[0].address).toBe(testAccount.addr)
    expect(transaction.balanceChanges[0].amount).toBe(-2000n) // min txn fee
    expect(transaction.balanceChanges[0].roles).toEqual([BalanceChangeRole.Sender])
    expect(transaction.balanceChanges[0].assetId).toBe(0)

    expect(transaction.balanceChanges[1].address).toBe(testAccount.addr)
    expect(transaction.balanceChanges[1].amount).toBe(100_000_000n)
    expect(transaction.balanceChanges[1].roles).toEqual([BalanceChangeRole.AssetCreator])
    expect(transaction.balanceChanges[1].assetId).toBe(asset)
  })

  test('Works for asset destroy transactions', async () => {
    const { testAccount, algod } = localnet.context
    const params = await algokit.getTransactionParams(undefined, algod)
    const createAssetTxns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          {
            signer: testAccount,
            transaction: acfgCreate(params, testAccount.addr, 2000, 100_000_000),
          },
        ],
      },
      algod,
    )
    const asset = createAssetTxns.confirmations![0].assetIndex!

    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          {
            signer: testAccount,
            transaction: acfgDestroy(params, testAccount.addr, 2000, Number(asset)),
          },
        ],
      },
      algod,
    )

    const subscription = await subscribeAndVerify(
      {
        balanceChanges: [
          {
            role: [BalanceChangeRole.AssetDestroyer],
          },
        ],
      },
      extractFromGroupResult(txns, 0),
    )

    const transaction = subscription.subscribedTransactions[0]
    invariant(transaction.balanceChanges)
    expect(transaction.balanceChanges.length).toBe(2)

    expect(transaction.balanceChanges[0].address).toBe(testAccount.addr)
    expect(transaction.balanceChanges[0].amount).toBe(-2000n) // min txn fee
    expect(transaction.balanceChanges[0].roles).toEqual([BalanceChangeRole.Sender])
    expect(transaction.balanceChanges[0].assetId).toBe(0)

    expect(transaction.balanceChanges[1].address).toBe(testAccount.addr)
    expect(transaction.balanceChanges[1].amount).toBe(0n)
    expect(transaction.balanceChanges[1].roles).toEqual([BalanceChangeRole.AssetDestroyer])
    expect(transaction.balanceChanges[1].assetId).toBe(asset)
  })

  test('Works for > 53-bit totals', async () => {
    const { testAccount, algod, generateAccount } = localnet.context
    const params = await algokit.getTransactionParams(undefined, algod)
    const random = await generateAccount({ initialFunds: (1).algos() })
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          {
            signer: testAccount,
            transaction: acfgCreate(params, testAccount.addr, 2000, 135_640_597_783_270_612n), // this is > Number.MAX_SAFE_INTEGER
          },
        ],
      },
      algod,
    )
    const asset = txns.confirmations![0].assetIndex!
    const axferTxns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          {
            signer: random,
            transaction: axfer(params, asset, 0, random.addr, random.addr), // Opt-in
          },
          {
            signer: testAccount,
            transaction: axfer(params, asset, 134_640_597_783_270_612n, testAccount.addr, random.addr), // this is > Number.MAX_SAFE_INTEGER
          },
        ],
      },
      algod,
    )

    const subscription = await subscribeAndVerifyFilter(
      {
        balanceChanges: [
          {
            assetId: [Number(asset)],
            address: testAccount.addr,
            role: [BalanceChangeRole.Sender],
            minAbsoluteAmount: 134_640_597_783_270_612n,
          },
        ],
      },
      extractFromGroupResult(axferTxns, 1),
    )

    expect(
      subscription.algod.subscribedTransactions[0].balanceChanges?.map((b) => ({
        ...b,
        address: b.address === testAccount.addr ? 'testAccount' : b.address === random.addr ? 'random' : b.address,
        assetId: b.assetId === 0 ? 0 : b.assetId === asset ? 'ASSET' : b.assetId,
      })),
    ).toMatchInlineSnapshot(`
      [
        {
          "address": "testAccount",
          "amount": -2000n,
          "assetId": 0,
          "roles": [
            "Sender",
          ],
        },
        {
          "address": "testAccount",
          "amount": -134640597783270612n,
          "assetId": "ASSET",
          "roles": [
            "Sender",
          ],
        },
        {
          "address": "random",
          "amount": 134640597783270612n,
          "assetId": "ASSET",
          "roles": [
            "Receiver",
          ],
        },
      ]
    `)
    expect(
      subscription.indexer.subscribedTransactions[0].balanceChanges?.map((b) => ({
        ...b,
        address: b.address === testAccount.addr ? 'testAccount' : b.address === random.addr ? 'random' : b.address,
        assetId: b.assetId === 0 ? 0 : b.assetId === asset ? 'ASSET' : b.assetId,
      })),
    ).toMatchInlineSnapshot(`
      [
        {
          "address": "testAccount",
          "amount": -2000n,
          "assetId": 0,
          "roles": [
            "Sender",
          ],
        },
        {
          "address": "testAccount",
          "amount": -134640597783270612n,
          "assetId": "ASSET",
          "roles": [
            "Sender",
          ],
        },
        {
          "address": "random",
          "amount": 134640597783270612n,
          "assetId": "ASSET",
          "roles": [
            "Receiver",
          ],
        },
      ]
    `)
  })

  test('Works with balance change filter on fee algos', async () => {
    const { testAccount, algod, generateAccount } = localnet.context
    const randomAccount = await generateAccount({ initialFunds: (1).algos() })
    const params = await algokit.getTransactionParams(undefined, algod)
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          {
            signer: randomAccount,
            transaction: acfgCreate(params, randomAccount.addr, 3000),
          },
          {
            signer: testAccount,
            transaction: acfgCreate(params, testAccount.addr, 1000),
          },
          {
            signer: testAccount,
            transaction: acfgCreate(params, testAccount.addr, 3000),
          },
          {
            signer: testAccount,
            transaction: acfgCreate(params, testAccount.addr, 5000),
          },
        ],
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        balanceChanges: [
          {
            assetId: [0],
            address: testAccount.addr,
            role: [BalanceChangeRole.Sender],
            minAmount: -4000,
            maxAmount: -2000,
            minAbsoluteAmount: 2000,
            maxAbsoluteAmount: 4000,
          },
        ],
      },
      extractFromGroupResult(txns, 2),
    )
  })

  test('Works with various balance change filters on algo transfer', async () => {
    try {
      const { algod, generateAccount } = localnet.context
      const account = await generateAccount({ initialFunds: (200_000).microAlgos() })
      const account2 = await generateAccount({ initialFunds: (200_000).microAlgos() })
      const account3 = await generateAccount({ initialFunds: (200_000).microAlgos() })
      const address = {
        [account.addr]: 'account1',
        [account2.addr]: 'account2',
        [account3.addr]: 'account3',
      }
      const params = await algokit.getTransactionParams(undefined, algod)
      const txns = await algokit.sendGroupOfTransactions(
        {
          transactions: [
            pay(params, 1000, account.addr, account2.addr, 1000), // 0: account -2000, account2 +1000
            pay(params, 1000, account2.addr, account.addr, 1000), // 1: account +1000, account2 -2000
            pay(params, 2000, account.addr, account2.addr, 1000), // 2: account -3000, account2 +2000
            pay(params, 2000, account2.addr, account.addr, 1000), // 3: account +2000, account2 -3000
            pay(params, 3000, account.addr, account2.addr, 1000), // 4: account -4000, account2 +3000
            pay(params, 3000, account2.addr, account.addr, 1000), // 5: account +3000, account2 -4000
            // account 197k, account2 197k, account3 200k
            pay(params, 100_000, account.addr, account2.addr, 1000, account3.addr), // 6: account -197k, account2 +100k, account3 +96k
            pay(params, 100_000, account2.addr, account.addr, 1000, account.addr), // 7: account +296k, account2 -297k
            pay(params, 100_000, account3.addr, account2.addr, 2000, account.addr), // 8: account +194k, account2 +100k, account3 -296k
            pay(params, 0, account.addr, account.addr, 0), // 9: account 0 (fee covered by previous)
          ].map((transaction) => ({
            signer:
              algosdk.encodeAddress(transaction.from.publicKey) === account.addr
                ? account
                : algosdk.encodeAddress(transaction.from.publicKey) === account2.addr
                  ? account2
                  : account3,
            transaction,
          })),
        },
        algod,
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0],
              address: account.addr,
              role: [BalanceChangeRole.Sender],
              minAbsoluteAmount: 2001,
              maxAbsoluteAmount: 3000,
            },
          ],
        },
        extractFromGroupResult(txns, 2),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0],
              address: account.addr,
              role: [BalanceChangeRole.Sender],
              minAmount: -3000,
              maxAmount: -2001,
            },
          ],
        },
        extractFromGroupResult(txns, 2),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0],
              address: account.addr,
              minAmount: -2000,
              maxAmount: -2000,
            },
          ],
        },
        extractFromGroupResult(txns, 0),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0],
              address: account.addr,
              minAmount: 1000,
              maxAmount: 1000,
            },
          ],
        },
        extractFromGroupResult(txns, 1),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0],
              address: account2.addr,
              role: [BalanceChangeRole.Sender],
              minAmount: -3000,
              maxAmount: -2001,
              minAbsoluteAmount: 2001,
              maxAbsoluteAmount: 3000,
            },
          ],
        },
        extractFromGroupResult(txns, 3),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0],
              address: account.addr,
              minAbsoluteAmount: 1,
              maxAbsoluteAmount: 1000,
            },
          ],
        },
        extractFromGroupResult(txns, 1),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0],
              address: account2.addr,
              maxAbsoluteAmount: 1000,
            },
          ],
        },
        extractFromGroupResult(txns, 0),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0],
              address: account3.addr,
              role: BalanceChangeRole.CloseTo,
            },
          ],
        },
        extractFromGroupResult(txns, 6),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0],
              address: account3.addr,
              role: [BalanceChangeRole.CloseTo, BalanceChangeRole.Sender],
              minAmount: 0,
            },
          ],
        },
        extractFromGroupResult(txns, 6),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              minAmount: 196_000,
            },
          ],
        },
        extractFromGroupResult(txns, 7),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              address: [account2.addr, account3.addr],
              minAbsoluteAmount: 296_000,
              maxAbsoluteAmount: 296_000,
            },
          ],
        },
        extractFromGroupResult(txns, 8),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              minAbsoluteAmount: 297_000,
            },
          ],
        },
        extractFromGroupResult(txns, 7),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              maxAmount: -297_000,
            },
          ],
        },
        extractFromGroupResult(txns, 7),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              minAmount: 0,
              maxAmount: 0,
            },
          ],
        },
        extractFromGroupResult(txns, 9),
      )

      const result = await subscribeAlgod({ balanceChanges: [{ minAmount: 0 }] }, extractFromGroupResult(txns, 0))
      const balanceChanges = result.subscribedTransactions.map((s) =>
        s
          .balanceChanges!.map((b) => ({
            ...b,
            address: address[b.address],
          }))
          .sort((a, b) => a.address.localeCompare(b.address))
          .map((b) => `${b.address}: ${Number(b.amount)} (${b.roles.join(', ')})`),
      )
      expect(balanceChanges).toMatchInlineSnapshot(`
        [
          [
            "account1: -2000 (Sender)",
            "account2: 1000 (Receiver)",
          ],
          [
            "account1: 1000 (Receiver)",
            "account2: -2000 (Sender)",
          ],
          [
            "account1: -3000 (Sender)",
            "account2: 2000 (Receiver)",
          ],
          [
            "account1: 2000 (Receiver)",
            "account2: -3000 (Sender)",
          ],
          [
            "account1: -4000 (Sender)",
            "account2: 3000 (Receiver)",
          ],
          [
            "account1: 3000 (Receiver)",
            "account2: -4000 (Sender)",
          ],
          [
            "account1: -197000 (Sender)",
            "account2: 100000 (Receiver)",
            "account3: 96000 (CloseTo)",
          ],
          [
            "account1: 296000 (Receiver, CloseTo)",
            "account2: -297000 (Sender)",
          ],
          [
            "account1: 194000 (CloseTo)",
            "account2: 100000 (Receiver)",
            "account3: -296000 (Sender)",
          ],
          [
            "account1: 0 (Sender, Receiver)",
          ],
        ]
      `)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      throw e
    }
  }, 30_000)

  test('Works with various balance change filters on asset transfer', async () => {
    try {
      const { algod, generateAccount, testAccount } = localnet.context
      const account = await generateAccount({ initialFunds: (1).algos() })
      const account2 = await generateAccount({ initialFunds: (1).algos() })
      const account3 = await generateAccount({ initialFunds: (1).algos() })
      const params = await algokit.getTransactionParams(undefined, algod)
      const asset1 = Number(
        (
          await algokit.sendTransaction(
            {
              transaction: acfgCreate(params, testAccount.addr, 1000),
              from: testAccount,
            },
            algod,
          )
        ).confirmation!.assetIndex!,
      )
      const asset2 = Number(
        (
          await algokit.sendTransaction(
            {
              transaction: acfgCreate(params, testAccount.addr, 1001),
              from: testAccount,
            },
            algod,
          )
        ).confirmation!.assetIndex!,
      )
      // eslint-disable-next-line no-console
      console.log('accounts', [testAccount.addr, account.addr, account2.addr, account3.addr], 'assets', [asset1, asset2])
      const address = {
        [testAccount.addr]: 'testAccount',
        [account.addr]: 'account1',
        [account2.addr]: 'account2',
        [account3.addr]: 'account3',
      }
      const asset = {
        [asset1]: 'asset1',
        [asset2]: 'asset2',
      }
      await algokit.assetOptIn({ account: account, assetId: asset1 }, algod)
      await algokit.assetOptIn({ account: account2, assetId: asset1 }, algod)
      await algokit.assetOptIn({ account: account3, assetId: asset1 }, algod)
      await algokit.assetOptIn({ account: account, assetId: asset2 }, algod)
      await algokit.assetOptIn({ account: account2, assetId: asset2 }, algod)
      await algokit.assetOptIn({ account: account3, assetId: asset2 }, algod)
      await algokit.transferAsset({ amount: 10, from: testAccount, to: account, assetId: asset1 }, algod)
      await algokit.transferAsset({ amount: 10, from: testAccount, to: account2, assetId: asset1 }, algod)
      await algokit.transferAsset({ amount: 20, from: testAccount, to: account3, assetId: asset1 }, algod)
      await algokit.transferAsset({ amount: 10, from: testAccount, to: account, assetId: asset2 }, algod)
      await algokit.transferAsset({ amount: 23, from: testAccount, to: account2, assetId: asset2 }, algod)
      // a1: account 10, account2 10, account3 0
      // a2: account 10, account2 10, account3 0
      const txns = await algokit.sendGroupOfTransactions(
        {
          transactions: [
            axfer(params, asset1, 1, account.addr, account2.addr), // 0: a1: account -1, account2 +1
            axfer(params, asset1, 1, account2.addr, account.addr), // 1: a1: account +1, account2 -1
            axfer(params, asset1, 2, account.addr, account2.addr), // 2: a1: account -2, account2 +2
            axfer(params, asset1, 2, account2.addr, account.addr), // 3: a1: account +2, account2 -2
            axfer(params, asset1, 3, testAccount.addr, account2.addr, account.addr), // 4: a1: account -3, account2 +3 (clawback)
            axfer(params, asset1, 3, testAccount.addr, account.addr, account2.addr), // 5: a1: account +3, account2 -3 (clawback)
            axfer(params, asset1, 7, account.addr, account2.addr, undefined, account3.addr), // 6: a1: account -10, account2 +7, account3 +3
            (await algokit.assetOptIn({ account: account, assetId: asset1, skipSending: true }, algod)).transaction, // 7: Opt-in account to asset1 again
            axfer(params, asset1, 7, account2.addr, account.addr, undefined, account.addr), // 8: a1: account +17, account2 -17
            (await algokit.assetOptIn({ account: account2, assetId: asset1, skipSending: true }, algod)).transaction, // 9: Opt-in account2 to asset1 again
            axfer(params, asset1, 3, account3.addr, account2.addr, undefined, account.addr), // 10: a1: account +20, account2 +3, account3 -23
            axfer(params, asset2, 1, account.addr, account2.addr), // 11: a2: account -1, account2 +1
            axfer(params, asset2, 23, account2.addr, account.addr), // 12: a2: account +23, account2 -23
          ].map((transaction) => ({
            signer:
              algosdk.encodeAddress(transaction.from.publicKey) === account.addr
                ? account
                : algosdk.encodeAddress(transaction.from.publicKey) === account2.addr
                  ? account2
                  : algosdk.encodeAddress(transaction.from.publicKey) === testAccount.addr
                    ? testAccount
                    : account3,
            transaction,
          })),
        },
        algod,
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              address: account.addr,
              role: [BalanceChangeRole.Sender],
              minAbsoluteAmount: 1.1,
              maxAbsoluteAmount: 2,
            },
          ],
        },
        extractFromGroupResult(txns, 2),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              address: account.addr,
              role: [BalanceChangeRole.Sender],
              minAmount: -2,
              maxAmount: -1.1,
            },
          ],
        },
        extractFromGroupResult(txns, 2),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              address: account.addr,
              minAmount: -1,
              maxAmount: -1,
            },
          ],
        },
        extractFromGroupResult(txns, 0),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              address: account.addr,
              minAmount: 1,
              maxAmount: 1,
            },
          ],
        },
        extractFromGroupResult(txns, 1),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              address: account2.addr,
              role: [BalanceChangeRole.Sender],
              minAmount: -2,
              maxAmount: -1.1,
              minAbsoluteAmount: 1.1,
              maxAbsoluteAmount: 2,
            },
          ],
        },
        extractFromGroupResult(txns, 3),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              address: account.addr,
              minAmount: 0.1,
              maxAbsoluteAmount: 1,
            },
          ],
        },
        extractFromGroupResult(txns, 1),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              address: account2.addr,
              minAmount: 0.1,
              maxAbsoluteAmount: 1,
            },
          ],
        },
        extractFromGroupResult(txns, 0),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              address: account3.addr,
              role: BalanceChangeRole.CloseTo,
            },
          ],
        },
        extractFromGroupResult(txns, 6),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              address: account3.addr,
              role: [BalanceChangeRole.CloseTo, BalanceChangeRole.Sender],
              minAmount: 0,
            },
          ],
        },
        extractFromGroupResult(txns, 6),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              minAmount: 18,
            },
          ],
        },
        extractFromGroupResult(txns, 10),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              address: [account2.addr, account3.addr],
              minAbsoluteAmount: 17,
              maxAbsoluteAmount: 17,
            },
          ],
        },
        extractFromGroupResult(txns, 8),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              minAbsoluteAmount: 23,
            },
          ],
        },
        extractFromGroupResult(txns, 10),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              address: account2.addr,
              maxAmount: -23,
              maxAbsoluteAmount: 23, // Stop algo balance changes triggering it
            },
          ],
        },
        extractFromGroupResult(txns, 12),
      )

      const result = await subscribeAlgod({ balanceChanges: [{ minAmount: 0 }] }, extractFromGroupResult(txns, 0))
      const balanceChanges = result.subscribedTransactions.map((s) =>
        s
          .balanceChanges!.filter((b) => b.assetId !== 0)
          .map((b) => ({
            ...b,
            address: address[b.address],
            assetId: asset[b.assetId],
          }))
          .sort((a, b) => a.address.localeCompare(b.address))
          .map((b) => `${b.address}: ${Number(b.amount)} x ${b.assetId} (${b.roles.join(', ')})`),
      )
      expect(balanceChanges).toMatchInlineSnapshot(`
                [
                  [
                    "account1: -1 x asset1 (Sender)",
                    "account2: 1 x asset1 (Receiver)",
                  ],
                  [
                    "account1: 1 x asset1 (Receiver)",
                    "account2: -1 x asset1 (Sender)",
                  ],
                  [
                    "account1: -2 x asset1 (Sender)",
                    "account2: 2 x asset1 (Receiver)",
                  ],
                  [
                    "account1: 2 x asset1 (Receiver)",
                    "account2: -2 x asset1 (Sender)",
                  ],
                  [
                    "account1: -3 x asset1 (Sender)",
                    "account2: 3 x asset1 (Receiver)",
                  ],
                  [
                    "account1: 3 x asset1 (Receiver)",
                    "account2: -3 x asset1 (Sender)",
                  ],
                  [
                    "account1: -10 x asset1 (Sender)",
                    "account2: 7 x asset1 (Receiver)",
                    "account3: 3 x asset1 (CloseTo)",
                  ],
                  [
                    "account1: 0 x asset1 (Sender, Receiver)",
                  ],
                  [
                    "account1: 17 x asset1 (Receiver, CloseTo)",
                    "account2: -17 x asset1 (Sender)",
                  ],
                  [
                    "account2: 0 x asset1 (Sender, Receiver)",
                  ],
                  [
                    "account1: 20 x asset1 (CloseTo)",
                    "account2: 3 x asset1 (Receiver)",
                    "account3: -23 x asset1 (Sender)",
                  ],
                  [
                    "account1: -1 x asset2 (Sender)",
                    "account2: 1 x asset2 (Receiver)",
                  ],
                  [
                    "account1: 23 x asset2 (Receiver)",
                    "account2: -23 x asset2 (Sender)",
                  ],
                ]
              `)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      throw e
    }
  }, 30_000)
})
