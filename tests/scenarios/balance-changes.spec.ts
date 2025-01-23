import { microAlgo } from '@algorandfoundation/algokit-utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { Address } from 'algosdk'
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
  const acfgCreate = (sender: Address, fee: AlgoAmount, total?: bigint) => {
    return localnet.algorand.createTransaction.assetCreate({
      sender,
      decimals: 0,
      total: total ?? 100n,
      defaultFrozen: false,
      clawback: sender,
      manager: sender,
      staticFee: fee,
    })
  }

  const acfgDestroy = (sender: Address, fee: AlgoAmount, assetId: bigint) => {
    return localnet.algorand.createTransaction.assetDestroy({
      sender,
      assetId,
      staticFee: fee,
    })
  }

  const pay = (amount: AlgoAmount, sender: Address, receiver: Address, fee: AlgoAmount, closeRemainderTo?: Address) => {
    return localnet.algorand.createTransaction.payment({
      amount,
      sender,
      receiver,
      closeRemainderTo,
      staticFee: fee,
    })
  }

  const axfer = (
    assetId: bigint,
    amount: bigint,
    sender: Address,
    receiver: Address,
    fee: AlgoAmount,
    clawbackTarget?: Address,
    closeAssetTo?: Address,
  ) => {
    return localnet.algorand.createTransaction.assetTransfer({
      amount,
      sender,
      receiver,
      closeAssetTo,
      assetId,
      clawbackTarget,
      staticFee: fee,
    })
  }

  test('Works for asset create transactions', async () => {
    // Assets are always minted into the creator/sender account, even if a reserve address is supplied
    const { testAccount } = localnet.context
    const txns = await localnet.algorand
      .newGroup()
      .addTransaction(await acfgCreate(testAccount.addr, microAlgo(2000), 100_000_000n))
      .send()
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

    expect(transaction.balanceChanges[0].address).toBe(testAccount.addr.toString())
    expect(transaction.balanceChanges[0].amount).toBe(-2000n) // min txn fee
    expect(transaction.balanceChanges[0].roles).toEqual([BalanceChangeRole.Sender])
    expect(transaction.balanceChanges[0].assetId).toBe(0n)

    expect(transaction.balanceChanges[1].address).toBe(testAccount.addr.toString())
    expect(transaction.balanceChanges[1].amount).toBe(100_000_000n)
    expect(transaction.balanceChanges[1].roles).toEqual([BalanceChangeRole.AssetCreator])
    expect(transaction.balanceChanges[1].assetId).toBe(asset)
  })

  test('Works for asset destroy transactions', async () => {
    const { testAccount } = localnet.context
    const createAssetTxns = await localnet.algorand
      .newGroup()
      .addTransaction(await acfgCreate(testAccount.addr, microAlgo(2000), 100_000_000n))
      .send()
    const asset = createAssetTxns.confirmations![0].assetIndex!

    const txns = await localnet.algorand
      .newGroup()
      .addTransaction(await acfgDestroy(testAccount.addr, microAlgo(2000), asset))
      .send()

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

    expect(transaction.balanceChanges[0].address).toBe(testAccount.addr.toString())
    expect(transaction.balanceChanges[0].amount).toBe(-2000n) // min txn fee
    expect(transaction.balanceChanges[0].roles).toEqual([BalanceChangeRole.Sender])
    expect(transaction.balanceChanges[0].assetId).toBe(0n)

    expect(transaction.balanceChanges[1].address).toBe(testAccount.addr.toString())
    expect(transaction.balanceChanges[1].amount).toBe(0n)
    expect(transaction.balanceChanges[1].roles).toEqual([BalanceChangeRole.AssetDestroyer])
    expect(transaction.balanceChanges[1].assetId).toBe(asset)
  })

  test('Works for > 53-bit totals', async () => {
    const { testAccount, generateAccount } = localnet.context
    const random = await generateAccount({ initialFunds: (1).algos() })
    const txns = await localnet.algorand
      .newGroup()
      .addTransaction(await acfgCreate(testAccount.addr, microAlgo(2000), 135_640_597_783_270_612n)) // this is > Number.MAX_SAFE_INTEGER
      .send()
    const asset = txns.confirmations![0].assetIndex!
    const axferTxns = await localnet.algorand
      .newGroup()
      .addTransaction(await axfer(asset, 0n, random.addr, random.addr, microAlgo(2000))) // Opt-in
      .addTransaction(await axfer(asset, 134_640_597_783_270_612n, testAccount.addr, random.addr, microAlgo(2000))) // this is > Number.MAX_SAFE_INTEGER
      .send()

    const subscription = await subscribeAndVerifyFilter(
      {
        balanceChanges: [
          {
            assetId: [asset],
            address: testAccount.addr.toString(),
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
        address: b.address === testAccount.addr.toString() ? 'testAccount' : b.address === random.addr.toString() ? 'random' : b.address,
        assetId: b.assetId === 0n ? 0n : b.assetId === asset ? 'ASSET' : b.assetId,
      })),
    ).toMatchInlineSnapshot(`
      [
        {
          "address": "testAccount",
          "amount": -2000n,
          "assetId": 0n,
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
        address: b.address === testAccount.addr.toString() ? 'testAccount' : b.address === random.addr.toString() ? 'random' : b.address,
        assetId: b.assetId === 0n ? 0n : b.assetId === asset ? 'ASSET' : b.assetId,
      })),
    ).toMatchInlineSnapshot(`
      [
        {
          "address": "testAccount",
          "amount": -2000n,
          "assetId": 0n,
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
    const { testAccount, generateAccount } = localnet.context
    const randomAccount = await generateAccount({ initialFunds: (1).algos() })
    const txns = await localnet.algorand
      .newGroup()
      .addTransaction(await acfgCreate(randomAccount.addr, microAlgo(3000)))
      .addTransaction(await acfgCreate(testAccount.addr, microAlgo(1000)))
      .addTransaction(await acfgCreate(testAccount.addr, microAlgo(3000)))
      .addTransaction(await acfgCreate(testAccount.addr, microAlgo(5000)))
      .send()

    await subscribeAndVerifyFilter(
      {
        balanceChanges: [
          {
            assetId: [0n],
            address: testAccount.addr.toString(),
            role: [BalanceChangeRole.Sender],
            minAmount: -4000n,
            maxAmount: -2000n,
            minAbsoluteAmount: 2000n,
            maxAbsoluteAmount: 4000n,
          },
        ],
      },
      extractFromGroupResult(txns, 2),
    )
  })

  test('Works with various balance change filters on algo transfer', async () => {
    try {
      const { generateAccount } = localnet.context
      const account = await generateAccount({ initialFunds: (200_000).microAlgos() })
      const account2 = await generateAccount({ initialFunds: (200_000).microAlgos() })
      const account3 = await generateAccount({ initialFunds: (200_000).microAlgos() })
      const address = {
        [account.addr.toString()]: 'account1',
        [account2.addr.toString()]: 'account2',
        [account3.addr.toString()]: 'account3',
      }
      const txns = await localnet.algorand
        .newGroup()
        .addTransaction(await pay(microAlgo(1000), account.addr, account2.addr, microAlgo(1000))) // 0: account -2000, account2 +1000
        .addTransaction(await pay(microAlgo(1000), account2.addr, account.addr, microAlgo(1000))) // 1: account +1000, account2 -2000
        .addTransaction(await pay(microAlgo(2000), account.addr, account2.addr, microAlgo(1000))) // 2: account -3000, account2 +2000
        .addTransaction(await pay(microAlgo(2000), account2.addr, account.addr, microAlgo(1000))) // 3: account +2000, account2 -3000
        .addTransaction(await pay(microAlgo(3000), account.addr, account2.addr, microAlgo(1000))) // 4: account -4000, account2 +3000
        .addTransaction(await pay(microAlgo(3000), account2.addr, account.addr, microAlgo(1000))) // 5: account +3000, account2 -4000
        // account 197k, account2 197k, account3 200k
        .addTransaction(await pay(microAlgo(100_000), account.addr, account2.addr, microAlgo(1000), account3.addr)) // 6: account -197k, account2 +100k, account3 +96k
        .addTransaction(await pay(microAlgo(100_000), account2.addr, account.addr, microAlgo(1000), account.addr)) // 7: account +296k, account2 -297k
        .addTransaction(await pay(microAlgo(100_000), account3.addr, account2.addr, microAlgo(2000), account.addr)) // 8: account +194k, account2 +100k, account3 -296k
        .addTransaction(await pay(microAlgo(0), account.addr, account.addr, microAlgo(0))) // 9: account 0 (fee covered by previous)
        .send()

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0n],
              address: account.addr.toString(),
              role: [BalanceChangeRole.Sender],
              minAbsoluteAmount: 2001n,
              maxAbsoluteAmount: 3000n,
            },
          ],
        },
        extractFromGroupResult(txns, 2),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0n],
              address: account.addr.toString(),
              role: [BalanceChangeRole.Sender],
              minAmount: -3000n,
              maxAmount: -2001n,
            },
          ],
        },
        extractFromGroupResult(txns, 2),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0n],
              address: account.addr.toString(),
              minAmount: -2000n,
              maxAmount: -2000n,
            },
          ],
        },
        extractFromGroupResult(txns, 0),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0n],
              address: account.addr.toString(),
              minAmount: 1000n,
              maxAmount: 1000n,
            },
          ],
        },
        extractFromGroupResult(txns, 1),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0n],
              address: account2.addr.toString(),
              role: [BalanceChangeRole.Sender],
              minAmount: -3000n,
              maxAmount: -2001n,
              minAbsoluteAmount: 2001n,
              maxAbsoluteAmount: 3000n,
            },
          ],
        },
        extractFromGroupResult(txns, 3),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0n],
              address: account.addr.toString(),
              minAbsoluteAmount: 1n,
              maxAbsoluteAmount: 1000n,
            },
          ],
        },
        extractFromGroupResult(txns, 1),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0n],
              address: account2.addr.toString(),
              maxAbsoluteAmount: 1000n,
            },
          ],
        },
        extractFromGroupResult(txns, 0),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [0n],
              address: account3.addr.toString(),
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
              assetId: [0n],
              address: account3.addr.toString(),
              role: [BalanceChangeRole.CloseTo, BalanceChangeRole.Sender],
              minAmount: 0n,
            },
          ],
        },
        extractFromGroupResult(txns, 6),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              minAmount: 196_000n,
            },
          ],
        },
        extractFromGroupResult(txns, 7),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              address: [account2.addr.toString(), account3.addr.toString()],
              minAbsoluteAmount: 296_000n,
              maxAbsoluteAmount: 296_000n,
            },
          ],
        },
        extractFromGroupResult(txns, 8),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              minAbsoluteAmount: 297_000n,
            },
          ],
        },
        extractFromGroupResult(txns, 7),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              maxAmount: -297_000n,
            },
          ],
        },
        extractFromGroupResult(txns, 7),
      )

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              minAmount: 0n,
              maxAmount: 0n,
            },
          ],
        },
        extractFromGroupResult(txns, 9),
      )

      const result = await subscribeAlgod({ balanceChanges: [{ minAmount: 0n }] }, extractFromGroupResult(txns, 0))
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
      const { algorand, generateAccount, testAccount } = localnet.context
      const account = await generateAccount({ initialFunds: (1).algos() })
      const account2 = await generateAccount({ initialFunds: (1).algos() })
      const account3 = await generateAccount({ initialFunds: (1).algos() })

      const asset1 = (
        await algorand
          .newGroup()
          .addTransaction(await acfgCreate(testAccount.addr, microAlgo(1000)))
          .send()
      ).confirmations![0].assetIndex!

      const asset2 = (
        await algorand
          .newGroup()
          .addTransaction(await acfgCreate(testAccount.addr, microAlgo(1001)))
          .send()
      ).confirmations![0].assetIndex!

      // eslint-disable-next-line no-console
      console.log(
        'accounts',
        [testAccount.addr.toString(), account.addr.toString(), account2.addr.toString(), account3.addr.toString()],
        'assets',
        [asset1, asset2],
      )
      const address = {
        [testAccount.addr.toString()]: 'testAccount',
        [account.addr.toString()]: 'account1',
        [account2.addr.toString()]: 'account2',
        [account3.addr.toString()]: 'account3',
      }
      const asset = {
        [asset1.toString()]: 'asset1',
        [asset2.toString()]: 'asset2',
      }

      await algorand.send.assetOptIn({ sender: account.addr, assetId: asset1 })
      await algorand.send.assetOptIn({ sender: account2.addr, assetId: asset1 })
      await algorand.send.assetOptIn({ sender: account3.addr, assetId: asset1 })
      await algorand.send.assetOptIn({ sender: account.addr, assetId: asset2 })
      await algorand.send.assetOptIn({ sender: account2.addr, assetId: asset2 })
      await algorand.send.assetOptIn({ sender: account3.addr, assetId: asset2 })
      await algorand.send.assetTransfer({ amount: 10n, sender: testAccount.addr, receiver: account.addr, assetId: asset1 })
      await algorand.send.assetTransfer({ amount: 10n, sender: testAccount.addr, receiver: account2.addr, assetId: asset1 })
      await algorand.send.assetTransfer({ amount: 20n, sender: testAccount.addr, receiver: account3.addr, assetId: asset1 })
      await algorand.send.assetTransfer({ amount: 10n, sender: testAccount.addr, receiver: account.addr, assetId: asset2 })
      await algorand.send.assetTransfer({ amount: 23n, sender: testAccount.addr, receiver: account2.addr, assetId: asset2 })

      // a1: account 10, account2 10, account3 0
      // a2: account 10, account2 10, account3 0
      const txns = await algorand
        .newGroup()
        .addTransaction(await axfer(asset1, 1n, account.addr, account2.addr, microAlgo(2000))) // 0: a1: account -1, account2 +1
        .addTransaction(await axfer(asset1, 1n, account2.addr, account.addr, microAlgo(2000))) // 1: a1: account +1, account2 -1
        .addTransaction(await axfer(asset1, 2n, account.addr, account2.addr, microAlgo(2000))) // 2: a1: account -2, account2 +2
        .addTransaction(await axfer(asset1, 2n, account2.addr, account.addr, microAlgo(2000))) // 3: a1: account +2, account2 -2
        .addTransaction(await axfer(asset1, 3n, testAccount.addr, account2.addr, microAlgo(2000), account.addr)) // 4: a1: account -3, account2 +3 (clawback)
        .addTransaction(await axfer(asset1, 3n, testAccount.addr, account.addr, microAlgo(2000), account2.addr)) // 5: a1: account +3, account2 -3 (clawback)
        .addTransaction(await axfer(asset1, 7n, account.addr, account2.addr, microAlgo(2000), undefined, account3.addr)) // 6: a1: account -10, account2 +7, account3 +3
        .addAssetOptIn({
          // 7: Opt-in account to asset1 again
          sender: account.addr,
          assetId: asset1,
        })
        .addTransaction(await axfer(asset1, 7n, account2.addr, account.addr, microAlgo(2000), undefined, account.addr)) // 8: a1: account +17, account2 -17
        .addAssetOptIn({
          // 9: Opt-in account2 to asset1 again
          sender: account2.addr,
          assetId: asset1,
        })
        .addTransaction(await axfer(asset1, 3n, account3.addr, account2.addr, microAlgo(2000), undefined, account.addr)) // 10: a1: account +20, account2 +3, account3 -23
        .addTransaction(await axfer(asset2, 1n, account.addr, account2.addr, microAlgo(2000))) // 11: a2: account -1, account2 +1
        .addTransaction(await axfer(asset2, 23n, account2.addr, account.addr, microAlgo(2000))) // 12: a2: account +23, account2 -23
        .send()

      await subscribeAndVerifyFilter(
        {
          balanceChanges: [
            {
              assetId: [asset1],
              address: account.addr.toString(),
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
              address: account.addr.toString(),
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
              address: account.addr.toString(),
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
              address: account.addr.toString(),
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
              address: account2.addr.toString(),
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
              address: account.addr.toString(),
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
              address: account2.addr.toString(),
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
              address: account3.addr.toString(),
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
              address: account3.addr.toString(),
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
              address: [account2.addr.toString(), account3.addr.toString()],
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
              address: account2.addr.toString(),
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
          .balanceChanges!.filter((b) => b.assetId !== 0n)
          .map((b) => ({
            ...b,
            address: address[b.address.toString()],
            assetId: asset[b.assetId.toString()],
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
