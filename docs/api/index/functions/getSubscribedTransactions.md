---
title: getSubscribedTransactions
---

[**@algorandfoundation/algokit-subscriber**](../../README.md)

***

# Function: getSubscribedTransactions()

> **getSubscribedTransactions**(`subscription`, `algod`, `indexer?`): `Promise`\<[`TransactionSubscriptionResult`](../../types/subscription/interfaces/TransactionSubscriptionResult.md)\>

Defined in: [src/subscriptions.ts:56](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/3e6c3e8af08bc1cedae06a39e26c56d94c235a63/src/subscriptions.ts#L56)

Executes a single pull/poll to subscribe to transactions on the configured Algorand
blockchain for the given subscription context.

## Parameters

### subscription

[`TransactionSubscriptionParams`](../../types/subscription/interfaces/TransactionSubscriptionParams.md)

The subscription context.

### algod

`AlgodClient`

An Algod client.

### indexer?

`IndexerClient`

An optional indexer client, only needed when `onMaxRounds` is `catchup-with-indexer`.

## Returns

`Promise`\<[`TransactionSubscriptionResult`](../../types/subscription/interfaces/TransactionSubscriptionResult.md)\>

The result of this subscription pull/poll.
