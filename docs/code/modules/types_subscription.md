[@algorandfoundation/algokit-subscriber](../README.md) / types/subscription

# Module: types/subscription

## Table of contents

### Interfaces

- [SubscriptionConfig](../interfaces/types_subscription.SubscriptionConfig.md)
- [SubscriptionConfigEvent](../interfaces/types_subscription.SubscriptionConfigEvent.md)
- [TransactionFilter](../interfaces/types_subscription.TransactionFilter.md)
- [TransactionSubscriptionParams](../interfaces/types_subscription.TransactionSubscriptionParams.md)
- [TransactionSubscriptionResult](../interfaces/types_subscription.TransactionSubscriptionResult.md)

### Type Aliases

- [TypedAsyncEventListener](types_subscription.md#typedasynceventlistener)

## Type Aliases

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

[types/subscription.ts:141](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L141)
