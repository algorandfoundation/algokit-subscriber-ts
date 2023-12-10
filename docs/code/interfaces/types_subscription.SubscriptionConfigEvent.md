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

[types/subscription.ts:133](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L133)

___

### filter

• **filter**: [`TransactionFilter`](types_subscription.TransactionFilter.md)

The transaction filter that determines if the event has occurred

#### Defined in

[types/subscription.ts:135](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L135)

___

### mapper

• `Optional` **mapper**: (`transaction`: `TransactionResult`[]) => `Promise`\<`T`[]\>

#### Type declaration

▸ (`transaction`): `Promise`\<`T`[]\>

An optional data mapper if you want the event data to take a certain shape.

If not specified, then the event will receive a `TransactionResult`.

##### Parameters

| Name | Type |
| :------ | :------ |
| `transaction` | `TransactionResult`[] |

##### Returns

`Promise`\<`T`[]\>

#### Defined in

[types/subscription.ts:140](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L140)
