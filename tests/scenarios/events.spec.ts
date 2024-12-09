import invariant from 'tiny-invariant'
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { Arc28Event } from '../../src/types'
import { filterFixture } from '../filterFixture'
import { app } from '../testing-app'

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

  test('Works for simple event', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txn = await app1.appClient.send.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr.toString(),
          appId: app1.result.appId,
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
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txn = await app1.appClient.send.emitSwappedTwice({ args: { a: 1, b: 2 }, sender: testAccount.addr })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr.toString(),
          appId: app1.result.appId,
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
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txn = await app1.appClient.send.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr.toString(),
          appId: app1.result.appId,
        },
        txn,
        [
          {
            groupName: 'group1',
            events: [swappedEvent],
            processForAppIds: [app1.result.appId],
          },
        ],
      )
    ).subscribedTransactions[0]

    invariant(subscription.arc28Events)
    expect(subscription.arc28Events.length).toBe(1)
  })

  test('Respects app ID filter exclusion', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txn = await app1.appClient.send.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr.toString(),
          appId: app1.result.appId,
        },
        txn,
        [
          {
            groupName: 'group1',
            events: [swappedEvent],
            processForAppIds: [app1.result.appId + 1n],
          },
        ],
      )
    ).subscribedTransactions[0]

    expect(subscription.arc28Events).toBeFalsy()
  })

  test('Respects app predicate filter inclusion', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txn = await app1.appClient.send.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr.toString(),
          appId: app1.result.appId,
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
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txn = await app1.appClient.send.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr.toString(),
          appId: app1.result.appId,
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
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txn = await app1.appClient.send.emitComplex({ args: { a: 1, b: 2, array: [1, 2, 3] }, sender: testAccount.addr })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr.toString(),
          appId: app1.result.appId,
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
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txn = await app1.appClient.send.emitComplex({ args: { a: 1, b: 2, array: [1, 2, 3] }, sender: testAccount.addr })

    const subscription = (
      await subscribeAndVerify(
        {
          sender: testAccount.addr.toString(),
          appId: app1.result.appId,
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
    const { testAccount } = localnet.context
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txns = await localnet.algorand
      .newGroup()
      .addAppCallMethodCall(await app1.appClient.params.callAbi({ args: { value: '1' }, sender: testAccount.addr }))
      .addAppCallMethodCall(await app1.appClient.params.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr }))
      .addPayment({
        amount: (1).microAlgos(),
        sender: testAccount.addr,
        receiver: testAccount.addr,
      })
      .send()

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr.toString(),
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
    const { testAccount } = localnet.context
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txns = await localnet.algorand
      .newGroup()
      .addAppCallMethodCall(await app1.appClient.params.callAbi({ args: { value: '1' }, sender: testAccount.addr }))
      .addAppCallMethodCall(await app1.appClient.params.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr }))
      .addPayment({ amount: (1).microAlgos(), sender: testAccount.addr, receiver: testAccount.addr })
      .send()

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr.toString(),
        arc28Events: [{ eventName: 'Swapped', groupName: 'group1' }],
      },
      extractFromGroupResult(txns, 1),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processForAppIds: [app1.result.appId],
        },
      ],
    )
  })

  test('ARC-28 event subscription validates app ID (exclude)', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txns = await localnet.algorand
      .newGroup()
      .addAppCallMethodCall(await app1.appClient.params.callAbi({ args: { value: '1' }, sender: testAccount.addr }))
      .addAppCallMethodCall(await app1.appClient.params.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr }))
      .addPayment({ amount: (1).microAlgos(), sender: testAccount.addr, receiver: testAccount.addr })
      .send()

    const subscription = await subscribeAlgod(
      {
        sender: testAccount.addr.toString(),
        arc28Events: [{ eventName: 'Swapped', groupName: 'group1' }],
      },
      extractFromGroupResult(txns, 0),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processForAppIds: [app1.result.appId + 1n],
        },
      ],
    )

    expect(subscription.subscribedTransactions.length).toBe(0)

    const subscription2 = await subscribeIndexer(
      {
        sender: testAccount.addr.toString(),
        arc28Events: [{ eventName: 'Swapped', groupName: 'group1' }],
      },
      extractFromGroupResult(txns, 0),
      [
        {
          groupName: 'group1',
          events: [swappedEvent],
          processForAppIds: [app1.result.appId + 1n],
        },
      ],
    )

    expect(subscription2.subscribedTransactions.length).toBe(0)
  })

  test('ARC-28 event subscription validates predicate (include)', async () => {
    const { testAccount } = localnet.context
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txns = await localnet.algorand
      .newGroup()
      .addAppCallMethodCall(await app1.appClient.params.callAbi({ args: { value: '1' }, sender: testAccount.addr }))
      .addAppCallMethodCall(await app1.appClient.params.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr }))
      .addPayment({ amount: (1).microAlgos(), sender: testAccount.addr, receiver: testAccount.addr })
      .send()

    await subscribeAndVerifyFilter(
      {
        sender: testAccount.addr.toString(),
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
    const { testAccount } = localnet.context
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txns = await localnet.algorand
      .newGroup()
      .addAppCallMethodCall(await app1.appClient.params.callAbi({ args: { value: '1' }, sender: testAccount.addr }))
      .addAppCallMethodCall(await app1.appClient.params.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr }))
      .addPayment({ amount: (1).microAlgos(), sender: testAccount.addr, receiver: testAccount.addr })
      .send()

    const subscription = await subscribeAlgod(
      {
        sender: testAccount.addr.toString(),
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
        sender: testAccount.addr.toString(),
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
    const { testAccount } = localnet.context
    const app1 = await app({ create: true, algorand: localnet.algorand, creator: systemAccount() })
    const txns = await localnet.algorand
      .newGroup()
      .addAppCallMethodCall(await app1.appClient.params.callAbi({ args: { value: '1' }, sender: testAccount.addr }))
      .addAppCallMethodCall(await app1.appClient.params.emitSwapped({ args: { a: 1, b: 2 }, sender: testAccount.addr }))
      .addPayment({ amount: (1).microAlgos(), sender: testAccount.addr, receiver: testAccount.addr })
      .send()

    const subscription = await subscribeAlgod(
      {
        sender: testAccount.addr.toString(),
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
        sender: testAccount.addr.toString(),
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
