import { sendGroupOfTransactions, transferAlgos } from '@algorandfoundation/algokit-utils'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { SendAtomicTransactionComposerResults, SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import { beforeEach, describe, test } from '@jest/globals'
import { Account } from 'algosdk'
import invariant from 'tiny-invariant'
import { Arc28Event, Arc28EventGroup, TransactionFilter } from '../../src/types/subscription'
import { TestingAppClient } from '../contract/client'
import { GetSubscribedTransactions, SendXTransactions } from '../transactions'

describe('Subscribing to app calls that emit events', () => {
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

  const localnet = algorandFixture()
  let systemAccount: Account

  beforeAll(async () => {
    await localnet.beforeEach()
    systemAccount = await localnet.context.generateAccount({ initialFunds: (100).algos() })
  })

  beforeEach(localnet.beforeEach, 10e6)
  afterEach(() => {
    jest.clearAllMocks()
  })

  const subscribeAlgod = async (filter: TransactionFilter, result: SendTransactionResult, arc28Events?: Arc28EventGroup[]) => {
    // Ensure there is another transaction so algod subscription can process something
    await SendXTransactions(1, systemAccount, localnet.context.algod)
    // Run the subscription
    const subscribed = await GetSubscribedTransactions(
      {
        roundsToSync: 1,
        syncBehaviour: 'sync-oldest',
        watermark: Number(result.confirmation?.confirmedRound) - 1,
        currentRound: Number(result.confirmation?.confirmedRound),
        filters: filter,
        arc28Events,
      },
      localnet.context.algod,
    )
    return subscribed
  }

  const subscribeIndexer = async (filter: TransactionFilter, result: SendTransactionResult, arc28Events?: Arc28EventGroup[]) => {
    // Wait for indexer to catch up
    await localnet.context.waitForIndexerTransaction(result.transaction.txID())
    // Run the subscription
    const subscribed = await GetSubscribedTransactions(
      {
        roundsToSync: 1,
        syncBehaviour: 'catchup-with-indexer',
        watermark: 0,
        currentRound: Number(result.confirmation?.confirmedRound) + 1,
        filters: filter,
        arc28Events,
      },
      localnet.context.algod,
      localnet.context.indexer,
    )
    return subscribed
  }

  const subscribeAndVerify = async (filter: TransactionFilter, result: SendTransactionResult, arc28Events?: Arc28EventGroup[]) => {
    const subscribed = await subscribeAlgod(filter, result, arc28Events)
    expect(subscribed.subscribedTransactions.length).toBe(1)
    expect(subscribed.subscribedTransactions[0].id).toBe(result.transaction.txID())

    return subscribed
  }

  const subscribeAndVerifyFilter = async (filter: TransactionFilter, result: SendTransactionResult, arc28Events?: Arc28EventGroup[]) => {
    const [algod, indexer] = await Promise.all([subscribeAlgod(filter, result, arc28Events), subscribeIndexer(filter, result, arc28Events)])

    expect(algod.subscribedTransactions.length).toBe(1)
    expect(algod.subscribedTransactions[0].id).toBe(result.transaction.txID())
    expect(indexer.subscribedTransactions.length).toBe(1)
    expect(indexer.subscribedTransactions[0].id).toBe(result.transaction.txID())

    return { algod, indexer }
  }

  const extractFromGroupResult = (groupResult: Omit<SendAtomicTransactionComposerResults, 'returns'>, index: number) => {
    return {
      transaction: groupResult.transactions[index],
      confirmation: groupResult.confirmations?.[index],
    }
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
