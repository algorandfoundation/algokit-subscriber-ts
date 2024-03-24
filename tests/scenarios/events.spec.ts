import { sendGroupOfTransactions, transferAlgos } from '@algorandfoundation/algokit-utils'
import { Account } from 'algosdk'
import invariant from 'tiny-invariant'
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { Arc28Event } from '../../src/types'
import { TestingAppClient } from '../contract/client'
import { filterFixture } from '../filterFixture'

describe('Subscribing to app calls that emit events', () => {
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

  const swappedEvent: Arc28Event = {
    name: 'Swapped',
    args: [
      {
        name: 'a',
        type: 'uint64',
      },

      {
        name: 'b',
        type: 'uint64',
      },
    ],
  }

  const complexEvent: Arc28Event = {
    name: 'Complex',
    args: [
      {
        name: 'array',
        type: 'uint32[]',
      },

      {
        name: 'int',
        type: 'uint64',
      },
    ],
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

  test('Works for simple event', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true })
    const txn = await app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr,
          appId: Number(app1.creation.appId),
        },
        txn,
        [
          {
            groupName: 'group1',
            events: [swappedEvent],
          },
        ],
      )
    ).subscribedTransactions[0]

    invariant(subscription.arc28Events)
    expect(subscription.arc28Events.length).toBe(1)
    expect(subscription.arc28Events[0].args.length).toEqual(2)
    expect(subscription.arc28Events[0].args[0]).toEqual(1n)
    expect(subscription.arc28Events[0].args[1]).toEqual(2n)
    expect(subscription.arc28Events[0].argsByName).toEqual({ a: 1n, b: 2n })
    expect(subscription.arc28Events[0].eventName).toBe('Swapped')
    expect(subscription.arc28Events[0].eventPrefix).toBe('1ccbd925')
    expect(subscription.arc28Events[0].eventSignature).toBe('Swapped(uint64,uint64)')
    expect(subscription.arc28Events[0].groupName).toBe('group1')
  })

  test('Processes multiple events', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true })
    const txn = await app1.app.emitSwappedTwice({ a: 1, b: 2 }, { sender: testAccount })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr,
          appId: Number(app1.creation.appId),
        },
        txn,
        [
          {
            groupName: 'group1',
            events: [swappedEvent],
          },
        ],
      )
    ).subscribedTransactions[0]

    invariant(subscription.arc28Events)
    expect(subscription.arc28Events.length).toBe(2)
    expect(subscription.arc28Events[1].argsByName).toEqual({ b: 1n, a: 2n })
    expect(subscription.arc28Events[1].groupName).toBe('group1')
  })

  test('Respects app ID filter inclusion', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true })
    const txn = await app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr,
          appId: Number(app1.creation.appId),
        },
        txn,
        [
          {
            groupName: 'group1',
            events: [swappedEvent],
            processForAppIds: [Number(app1.creation.appId)],
          },
        ],
      )
    ).subscribedTransactions[0]

    invariant(subscription.arc28Events)
    expect(subscription.arc28Events.length).toBe(1)
  })

  test('Respects app ID filter exclusion', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true })
    const txn = await app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr,
          appId: Number(app1.creation.appId),
        },
        txn,
        [
          {
            groupName: 'group1',
            events: [swappedEvent],
            processForAppIds: [Number(app1.creation.appId) + 1],
          },
        ],
      )
    ).subscribedTransactions[0]

    expect(subscription.arc28Events).toBeFalsy()
  })

  test('Respects app predicate filter inclusion', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true })
    const txn = await app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr,
          appId: Number(app1.creation.appId),
        },
        txn,
        [
          {
            groupName: 'group1',
            events: [swappedEvent],
            processTransaction: (transaction) => transaction.id === txn.transaction.txID(),
          },
        ],
      )
    ).subscribedTransactions[0]

    invariant(subscription.arc28Events)
    expect(subscription.arc28Events.length).toBe(1)
  })

  test('Respects app predicate filter exclusion', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true })
    const txn = await app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr,
          appId: Number(app1.creation.appId),
        },
        txn,
        [
          {
            groupName: 'group1',
            events: [swappedEvent],
            processTransaction: () => false,
          },
        ],
      )
    ).subscribedTransactions[0]

    expect(subscription.arc28Events).toBeFalsy()
  })

  test('Works for complex event / multiple events in group', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true })
    const txn = await app1.app.emitComplex({ a: 1, b: 2, array: [1, 2, 3] }, { sender: testAccount })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr,
          appId: Number(app1.creation.appId),
        },
        txn,
        [
          {
            groupName: 'group1',
            events: [swappedEvent, complexEvent],
          },
        ],
      )
    ).subscribedTransactions[0]

    invariant(subscription.arc28Events)
    expect(subscription.arc28Events.length).toBe(2)

    expect(subscription.arc28Events[0].args.length).toEqual(2)
    expect(subscription.arc28Events[0].args[0]).toEqual(1n)
    expect(subscription.arc28Events[0].args[1]).toEqual(2n)
    expect(subscription.arc28Events[0].argsByName).toEqual({ a: 1n, b: 2n })
    expect(subscription.arc28Events[0].eventName).toBe('Swapped')
    expect(subscription.arc28Events[0].eventPrefix).toBe('1ccbd925')
    expect(subscription.arc28Events[0].eventSignature).toBe('Swapped(uint64,uint64)')
    expect(subscription.arc28Events[0].groupName).toBe('group1')

    expect(subscription.arc28Events[1].args.length).toEqual(2)
    expect(subscription.arc28Events[1].args[0]).toEqual([1n, 2n, 3n])
    expect(subscription.arc28Events[1].args[1]).toEqual(2n)
    expect(subscription.arc28Events[1].argsByName).toEqual({ array: [1n, 2n, 3n], int: 2n })
    expect(subscription.arc28Events[1].eventName).toBe('Complex')
    expect(subscription.arc28Events[1].eventPrefix).toBe('18da5ea7')
    expect(subscription.arc28Events[1].eventSignature).toBe('Complex(uint32[],uint64)')
    expect(subscription.arc28Events[1].groupName).toBe('group1')
  })

  test('Works for multiple groups', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true })
    const txn = await app1.app.emitComplex({ a: 1, b: 2, array: [1, 2, 3] }, { sender: testAccount })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr,
          appId: Number(app1.creation.appId),
        },
        txn,
        [
          {
            groupName: 'group1',
            events: [complexEvent],
          },
          {
            groupName: 'group2',
            events: [swappedEvent],
          },
        ],
      )
    ).subscribedTransactions[0]

    invariant(subscription.arc28Events)
    expect(subscription.arc28Events.length).toBe(2)

    expect(subscription.arc28Events[0].eventSignature).toBe('Swapped(uint64,uint64)')
    expect(subscription.arc28Events[0].groupName).toBe('group2')

    expect(subscription.arc28Events[1].eventSignature).toBe('Complex(uint32[],uint64)')
    expect(subscription.arc28Events[1].groupName).toBe('group1')
  })

  test('Allows ARC-28 event subscription', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: '1' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount, sendParams: { skipSending: true } }),
          transferAlgos({ amount: (1).microAlgos(), from: testAccount, to: testAccount.addr, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        arc28Events: [{ eventName: 'Swapped', groupName: 'group1' }],
      },
      extractFromGroupResult(txns, 1),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
        },
      ],
    )
  })

  test('ARC-28 event subscription validates app ID (include)', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: '1' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount, sendParams: { skipSending: true } }),
          transferAlgos({ amount: (1).microAlgos(), from: testAccount, to: testAccount.addr, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        arc28Events: [{ eventName: 'Swapped', groupName: 'group1' }],
      },
      extractFromGroupResult(txns, 1),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processForAppIds: [Number(app1.creation.appId)],
        },
      ],
    )
  })

  test('ARC-28 event subscription validates app ID (exclude)', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: '1' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount, sendParams: { skipSending: true } }),
          transferAlgos({ amount: (1).microAlgos(), from: testAccount, to: testAccount.addr, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    const subscription = await subscribeAlgod(
      {
        sender: testAccount.addr,
        arc28Events: [{ eventName: 'Swapped', groupName: 'group1' }],
      },
      extractFromGroupResult(txns, 0),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processForAppIds: [Number(app1.creation.appId) + 1],
        },
      ],
    )

    expect(subscription.subscribedTransactions.length).toBe(0)

    const subscription2 = await subscribeIndexer(
      {
        sender: testAccount.addr,
        arc28Events: [{ eventName: 'Swapped', groupName: 'group1' }],
      },
      extractFromGroupResult(txns, 0),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processForAppIds: [Number(app1.creation.appId) + 1],
        },
      ],
    )

    expect(subscription2.subscribedTransactions.length).toBe(0)
  })

  test('ARC-28 event subscription validates predicate (include)', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: '1' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount, sendParams: { skipSending: true } }),
          transferAlgos({ amount: (1).microAlgos(), from: testAccount, to: testAccount.addr, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr,
        arc28Events: [{ eventName: 'Swapped', groupName: 'group1' }],
      },
      extractFromGroupResult(txns, 1),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processTransaction: (transaction) => transaction.id === txns.transactions[1].txID(),
        },
      ],
    )
  })

  test('ARC-28 event subscription validates predicate (exclude)', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: '1' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount, sendParams: { skipSending: true } }),
          transferAlgos({ amount: (1).microAlgos(), from: testAccount, to: testAccount.addr, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    const subscription = await subscribeAlgod(
      {
        sender: testAccount.addr,
        arc28Events: [{ eventName: 'Swapped', groupName: 'group1' }],
      },
      extractFromGroupResult(txns, 0),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processTransaction: (transaction) => transaction.id !== txns.transactions[1].txID(),
        },
      ],
    )

    expect(subscription.subscribedTransactions.length).toBe(0)

    const subscription2 = await subscribeIndexer(
      {
        sender: testAccount.addr,
        arc28Events: [{ eventName: 'Swapped', groupName: 'group1' }],
      },
      extractFromGroupResult(txns, 0),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processTransaction: (transaction) => transaction.id !== txns.transactions[1].txID(),
        },
      ],
    )

    expect(subscription2.subscribedTransactions.length).toBe(0)
  })

  test('ARC-28 event subscription validates group', async () => {
    const { testAccount, algod } = localnet.context
    const app1 = await app({ create: true })
    const txns = await sendGroupOfTransactions(
      {
        transactions: [
          app1.app.callAbi({ value: '1' }, { sender: testAccount, sendParams: { skipSending: true } }),
          app1.app.emitSwapped({ a: 1, b: 2 }, { sender: testAccount, sendParams: { skipSending: true } }),
          transferAlgos({ amount: (1).microAlgos(), from: testAccount, to: testAccount.addr, skipSending: true }, algod),
        ],
        signer: testAccount,
      },
      algod,
    )

    const subscription = await subscribeAlgod(
      {
        sender: testAccount.addr,
        arc28Events: [{ eventName: 'Swapped', groupName: 'group2' }],
      },
      extractFromGroupResult(txns, 0),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processTransaction: (transaction) => transaction.id !== txns.transactions[1].txID(),
        },
      ],
    )

    expect(subscription.subscribedTransactions.length).toBe(0)

    const subscription2 = await subscribeIndexer(
      {
        sender: testAccount.addr,
        arc28Events: [{ eventName: 'Swapped', groupName: 'group2' }],
      },
      extractFromGroupResult(txns, 0),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processTransaction: (transaction) => transaction.id !== txns.transactions[1].txID(),
        },
      ],
    )

    expect(subscription2.subscribedTransactions.length).toBe(0)
  })
})
