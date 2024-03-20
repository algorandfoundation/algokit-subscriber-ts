[@algorandfoundation/algokit-subscriber](../README.md) / types/subscription

# Module: types/subscription

## Table of contents

### Interfaces

- [Arc28Event](../interfaces/types_subscription.Arc28Event.md)
- [Arc28EventGroup](../interfaces/types_subscription.Arc28EventGroup.md)
- [Arc28EventToProcess](../interfaces/types_subscription.Arc28EventToProcess.md)
- [EmittedArc28Event](../interfaces/types_subscription.EmittedArc28Event.md)
- [NamedTransactionFilter](../interfaces/types_subscription.NamedTransactionFilter.md)
- [SubscriptionConfig](../interfaces/types_subscription.SubscriptionConfig.md)
- [SubscriptionConfigEvent](../interfaces/types_subscription.SubscriptionConfigEvent.md)
- [TransactionFilter](../interfaces/types_subscription.TransactionFilter.md)
- [TransactionSubscriptionParams](../interfaces/types_subscription.TransactionSubscriptionParams.md)
- [TransactionSubscriptionResult](../interfaces/types_subscription.TransactionSubscriptionResult.md)

### Type Aliases

- [SubscribedTransaction](types_subscription.md#subscribedtransaction)
- [TypedAsyncEventListener](types_subscription.md#typedasynceventlistener)

## Type Aliases

### SubscribedTransaction

Ƭ **SubscribedTransaction**: `TransactionResult` & \{ `arc28Events?`: [`EmittedArc28Event`](../interfaces/types_subscription.EmittedArc28Event.md)[] ; `filtersMatched?`: `string`[] ; `inner-txns?`: [`SubscribedTransaction`](types_subscription.md#subscribedtransaction)[] ; `parentTransactionId?`: `string`  }

The common model used to expose a transaction that is returned from a subscription.

Substantively, based on the Indexer  [`TransactionResult` model](https://developer.algorand.org/docs/rest-apis/indexer/#transaction) format with some modifications to:
* Add the `parentTransactionId` field so inner transactions have a reference to their parent
* Override the type of `inner-txns` to be `SubscribedTransaction[]` so inner transactions (recursively) get these extra fields too
* Add emitted ARC-28 events via `arc28Events`

#### Defined in

[types/subscription.ts:68](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L68)

___

### TypedAsyncEventListener

Ƭ **TypedAsyncEventListener**\<`T`\>: (`event`: `T`, `eventName`: `string` \| `symbol`) => `Promise`\<`void`\> \| `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`event`, `eventName`): `Promise`\<`void`\> \| `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `eventName` | `string` \| `symbol` |

##### Returns

`Promise`\<`void`\> \| `void`

#### Defined in

[types/subscription.ts:265](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L265)
