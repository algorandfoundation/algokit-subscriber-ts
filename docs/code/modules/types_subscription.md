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
- [SubscribedTransaction](../interfaces/types_subscription.SubscribedTransaction.md)
- [SubscriberConfigFilter](../interfaces/types_subscription.SubscriberConfigFilter.md)
- [TransactionFilter](../interfaces/types_subscription.TransactionFilter.md)
- [TransactionSubscriptionParams](../interfaces/types_subscription.TransactionSubscriptionParams.md)
- [TransactionSubscriptionResult](../interfaces/types_subscription.TransactionSubscriptionResult.md)

### Type Aliases

- [ErrorListener](types_subscription.md#errorlistener)
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

[src/types/subscription.ts:397](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L397)

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

[src/types/subscription.ts:395](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L395)
