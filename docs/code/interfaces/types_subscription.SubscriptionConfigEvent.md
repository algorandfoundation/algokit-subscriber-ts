[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / SubscriptionConfigEvent

# Interface: SubscriptionConfigEvent\<T\>

[types/subscription](../modules/types_subscription.md).SubscriptionConfigEvent

A single event to subscribe to / emit.

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Properties

- [eventName](types_subscription.SubscriptionConfigEvent.md#eventname)
- [filter](types_subscription.SubscriptionConfigEvent.md#filter)
- [mapper](types_subscription.SubscriptionConfigEvent.md#mapper)

## Properties

### eventName

• **eventName**: `string`

Name / identifier to uniquely describe the event

#### Defined in

[types/subscription.ts:217](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L217)

___

### filter

• **filter**: [`TransactionFilter`](types_subscription.TransactionFilter.md)

The transaction filter that determines if the event has occurred

#### Defined in

[types/subscription.ts:219](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L219)

___

### mapper

• `Optional` **mapper**: (`transaction`: [`SubscribedTransaction`](../modules/types_subscription.md#subscribedtransaction)[]) => `Promise`\<`T`[]\>

An optional data mapper if you want the event data to take a certain shape.

If not specified, then the event will receive a `SubscribedTransaction`.

#### Type declaration

▸ (`transaction`): `Promise`\<`T`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `transaction` | [`SubscribedTransaction`](../modules/types_subscription.md#subscribedtransaction)[] |

##### Returns

`Promise`\<`T`[]\>

#### Defined in

[types/subscription.ts:224](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L224)
