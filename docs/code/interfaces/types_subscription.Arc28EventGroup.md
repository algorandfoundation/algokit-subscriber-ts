[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / Arc28EventGroup

# Interface: Arc28EventGroup

[types/subscription](../modules/types_subscription.md).Arc28EventGroup

Specifies a group of ARC-28 event definitions along with instructions for when to attempt to process the events.

## Table of contents

### Properties

- [continueOnError](types_subscription.Arc28EventGroup.md#continueonerror)
- [events](types_subscription.Arc28EventGroup.md#events)
- [groupName](types_subscription.Arc28EventGroup.md#groupname)
- [processForAppIds](types_subscription.Arc28EventGroup.md#processforappids)
- [processTransaction](types_subscription.Arc28EventGroup.md#processtransaction)

## Properties

### continueOnError

• `Optional` **continueOnError**: `boolean`

Whether or not to silently (with warning log) continue if an error is encountered processing the ARC-28 event data; default = false

#### Defined in

[types/subscription.ts:54](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L54)

___

### events

• **events**: [`Arc28Event`](types_subscription.Arc28Event.md)[]

The list of ARC-28 event definitions

#### Defined in

[types/subscription.ts:56](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L56)

___

### groupName

• **groupName**: `string`

The name to designate for this group of events.

#### Defined in

[types/subscription.ts:48](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L48)

___

### processForAppIds

• `Optional` **processForAppIds**: `number`[]

Optional list of app IDs that this event should apply to

#### Defined in

[types/subscription.ts:50](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L50)

___

### processTransaction

• `Optional` **processTransaction**: (`transaction`: `TransactionResult`) => `boolean`

#### Type declaration

▸ (`transaction`): `boolean`

Optional predicate to indicate if these ARC-28 events should be processed for the given transaction

##### Parameters

| Name | Type |
| :------ | :------ |
| `transaction` | `TransactionResult` |

##### Returns

`boolean`

#### Defined in

[types/subscription.ts:52](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L52)
