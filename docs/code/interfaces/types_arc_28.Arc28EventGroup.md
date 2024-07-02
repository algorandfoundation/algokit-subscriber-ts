[@algorandfoundation/algokit-subscriber](../README.md) / [types/arc-28](../modules/types_arc_28.md) / Arc28EventGroup

# Interface: Arc28EventGroup

[types/arc-28](../modules/types_arc_28.md).Arc28EventGroup

Specifies a group of ARC-28 event definitions along with instructions for when to attempt to process the events.

## Table of contents

### Properties

- [continueOnError](types_arc_28.Arc28EventGroup.md#continueonerror)
- [events](types_arc_28.Arc28EventGroup.md#events)
- [groupName](types_arc_28.Arc28EventGroup.md#groupname)
- [processForAppIds](types_arc_28.Arc28EventGroup.md#processforappids)
- [processTransaction](types_arc_28.Arc28EventGroup.md#processtransaction)

## Properties

### continueOnError

• `Optional` **continueOnError**: `boolean`

Whether or not to silently (with warning log) continue if an error is encountered processing the ARC-28 event data; default = false

#### Defined in

[types/arc-28.ts:55](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L55)

___

### events

• **events**: [`Arc28Event`](types_arc_28.Arc28Event.md)[]

The list of ARC-28 event definitions

#### Defined in

[types/arc-28.ts:57](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L57)

___

### groupName

• **groupName**: `string`

The name to designate for this group of events.

#### Defined in

[types/arc-28.ts:49](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L49)

___

### processForAppIds

• `Optional` **processForAppIds**: `number`[]

Optional list of app IDs that this event should apply to

#### Defined in

[types/arc-28.ts:51](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L51)

___

### processTransaction

• `Optional` **processTransaction**: (`transaction`: `TransactionResult`) => `boolean`

Optional predicate to indicate if these ARC-28 events should be processed for the given transaction

#### Type declaration

▸ (`transaction`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `transaction` | `TransactionResult` |

##### Returns

`boolean`

#### Defined in

[types/arc-28.ts:53](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L53)
