[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / SubscriberConfigFilter

# Interface: SubscriberConfigFilter\<T\>

[types/subscription](../modules/types_subscription.md).SubscriberConfigFilter

A single event to subscribe to / emit.

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`NamedTransactionFilter`](types_subscription.NamedTransactionFilter.md)

  ↳ **`SubscriberConfigFilter`**

## Table of contents

### Properties

- [filter](types_subscription.SubscriberConfigFilter.md#filter)
- [mapper](types_subscription.SubscriberConfigFilter.md#mapper)
- [name](types_subscription.SubscriberConfigFilter.md#name)

## Properties

### filter

• **filter**: [`TransactionFilter`](types_subscription.TransactionFilter.md)

The filter itself.

#### Inherited from

[NamedTransactionFilter](types_subscription.NamedTransactionFilter.md).[filter](types_subscription.NamedTransactionFilter.md#filter)

#### Defined in

[src/types/subscription.ts:310](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L310)

___

### mapper

• `Optional` **mapper**: (`transaction`: [`SubscribedTransaction`](../classes/types_subscription.SubscribedTransaction.md)[]) => `Promise`\<`T`[]\>

An optional data mapper if you want the event data to take a certain shape when subscribing to events with this filter name.

If not specified, then the event will simply receive a `SubscribedTransaction`.

Note: if you provide multiple filters with the same name then only the mapper of the first matching filter will be used

#### Type declaration

▸ (`transaction`): `Promise`\<`T`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `transaction` | [`SubscribedTransaction`](../classes/types_subscription.SubscribedTransaction.md)[] |

##### Returns

`Promise`\<`T`[]\>

#### Defined in

[src/types/subscription.ts:415](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L415)

___

### name

• **name**: `string`

The name to give the filter.

#### Inherited from

[NamedTransactionFilter](types_subscription.NamedTransactionFilter.md).[name](types_subscription.NamedTransactionFilter.md#name)

#### Defined in

[src/types/subscription.ts:308](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L308)
