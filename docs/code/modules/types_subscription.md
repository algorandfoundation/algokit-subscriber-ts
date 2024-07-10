[@algorandfoundation/algokit-subscriber](../README.md) / types/subscription

# Module: types/subscription

## Table of contents

### Enumerations

- [BalanceChangeRole](../enums/types_subscription.BalanceChangeRole.md)

### Interfaces

- [AlgorandSubscriberConfig](../interfaces/types_subscription.AlgorandSubscriberConfig.md)
- [BalanceChange](../interfaces/types_subscription.BalanceChange.md)
- [BeforePollMetadata](../interfaces/types_subscription.BeforePollMetadata.md)
- [BlockMetadata](../interfaces/types_subscription.BlockMetadata.md)
- [BlockRewards](../interfaces/types_subscription.BlockRewards.md)
- [BlockStateProofTracking](../interfaces/types_subscription.BlockStateProofTracking.md)
- [BlockUpgradeState](../interfaces/types_subscription.BlockUpgradeState.md)
- [BlockUpgradeVote](../interfaces/types_subscription.BlockUpgradeVote.md)
- [CoreTransactionSubscriptionParams](../interfaces/types_subscription.CoreTransactionSubscriptionParams.md)
- [NamedTransactionFilter](../interfaces/types_subscription.NamedTransactionFilter.md)
- [ParticipationUpdates](../interfaces/types_subscription.ParticipationUpdates.md)
- [SubscriberConfigFilter](../interfaces/types_subscription.SubscriberConfigFilter.md)
- [TransactionFilter](../interfaces/types_subscription.TransactionFilter.md)
- [TransactionSubscriptionParams](../interfaces/types_subscription.TransactionSubscriptionParams.md)
- [TransactionSubscriptionResult](../interfaces/types_subscription.TransactionSubscriptionResult.md)

### Type Aliases

- [ErrorListener](types_subscription.md#errorlistener)
- [SubscribedTransaction](types_subscription.md#subscribedtransaction)
- [TypedAsyncEventListener](types_subscription.md#typedasynceventlistener)

## Type Aliases

### ErrorListener

Ƭ **ErrorListener**: (`error`: `unknown`) => `Promise`\<`void`\> \| `void`

#### Type declaration

▸ (`error`): `Promise`\<`void`\> \| `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `unknown` |

##### Returns

`Promise`\<`void`\> \| `void`

#### Defined in

[types/subscription.ts:391](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L391)

___

### SubscribedTransaction

Ƭ **SubscribedTransaction**: `TransactionResult` & \{ `arc28Events?`: [`EmittedArc28Event`](../interfaces/types_arc_28.EmittedArc28Event.md)[] ; `balanceChanges?`: [`BalanceChange`](../interfaces/types_subscription.BalanceChange.md)[] ; `filtersMatched?`: `string`[] ; `inner-txns?`: [`SubscribedTransaction`](types_subscription.md#subscribedtransaction)[] ; `parentTransactionId?`: `string`  }

The common model used to expose a transaction that is returned from a subscription.

Substantively, based on the Indexer  [`TransactionResult` model](https://developer.algorand.org/docs/rest-apis/indexer/#transaction) format with some modifications to:
* Add the `parentTransactionId` field so inner transactions have a reference to their parent
* Override the type of `inner-txns` to be `SubscribedTransaction[]` so inner transactions (recursively) get these extra fields too
* Add emitted ARC-28 events via `arc28Events`
* Balance changes in algo or assets

#### Defined in

[types/subscription.ts:161](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L161)

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

[types/subscription.ts:389](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L389)
