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
  const acfg = (params: SuggestedParams, from: string, fee: number) => {
    params.fee = fee
    params.flatFee = true
    return algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      suggestedParams: params,
      from,
      decimals: 0,
      total: 1,
      defaultFrozen: false,
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

  test('Works for non transfer', async () => {
    const { testAccount, algod } = localnet.context
    const params = await algokit.getTransactionParams(undefined, algod)
    const txns = await algokit.sendGroupOfTransactions(
      {
        transactions: [
          {
            signer: testAccount,
            transaction: acfg(params, testAccount.addr, 2000),
          },
        ],
      },
      algod,
    )

    const subscription = await subscribeAndVerify(
      {
        balanceChanges: [
          {
            assetId: [0],
            address: testAccount.addr,
            role: [BalanceChangeRole.Sender],
          },
        ],
      },
      extractFromGroupResult(txns, 0),
    )

    const transaction = subscription.subscribedTransactions[0]
    invariant(transaction.balanceChanges)
    expect(transaction.balanceChanges.length).toBe(1)
    expect(transaction.balanceChanges[0].address).toBe(testAccount.addr)
    expect(transaction.balanceChanges[0].amount).toBe(-2000n) // min txn fee
    expect(transaction.balanceChanges[0].roles).toEqual([BalanceChangeRole.Sender])
    expect(transaction.balanceChanges[0].assetId).toBe(0)
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
            transaction: acfg(params, randomAccount.addr, 3000),
          },
          {
            signer: testAccount,
            transaction: acfg(params, testAccount.addr, 1000),
          },
          {
            signer: testAccount,
            transaction: acfg(params, testAccount.addr, 3000),
          },
          {
            signer: testAccount,
            transaction: acfg(params, testAccount.addr, 5000),
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
            pay(params, 100_000, account3.addr, account2.addr, 1000, account.addr), // 8: account +195k, account2 +100k, account3 -296k
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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      throw e
    }
  }, 30_000)
})
