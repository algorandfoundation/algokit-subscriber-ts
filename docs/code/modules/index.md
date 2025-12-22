[@algorandfoundation/algokit-subscriber](../README.md) / index

# Module: index

## Table of contents

### Classes

- [AlgorandSubscriber](../classes/index.AlgorandSubscriber.md)

### Functions

- [getSubscribedTransactions](index.md#getsubscribedtransactions)

## Functions

### getSubscribedTransactions

▸ **getSubscribedTransactions**(`subscription`, `algod`, `indexerClient?`): `Promise`\<[`TransactionSubscriptionResult`](../interfaces/types_subscription.TransactionSubscriptionResult.md)\>

Executes a single pull/poll to subscribe to transactions on the configured Algorand
blockchain for the given subscription context.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `subscription` | [`TransactionSubscriptionParams`](../interfaces/types_subscription.TransactionSubscriptionParams.md) | The subscription context. |
| `algod` | `AlgodClient` | An Algod client. |
| `indexerClient?` | `IndexerClient` | An optional indexer client, only needed when `onMaxRounds` is `catchup-with-indexer`. |

#### Returns

`Promise`\<[`TransactionSubscriptionResult`](../interfaces/types_subscription.TransactionSubscriptionResult.md)\>

The result of this subscription pull/poll.

#### Defined in

[src/subscriptions.ts:54](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriptions.ts#L54)
