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

[src/types/arc-28.ts:55](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L55)

---

### events

• **events**: [`Arc28Event`](types_arc_28.Arc28Event.md)[]

The list of ARC-28 event definitions

#### Defined in

[src/types/arc-28.ts:57](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L57)

---

### groupName

• **groupName**: `string`

The name to designate for this group of events.

#### Defined in

[src/types/arc-28.ts:49](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L49)

---

### processForAppIds

• `Optional` **processForAppIds**: `bigint`[]

Optional list of app IDs that this event should apply to

#### Defined in

[src/types/arc-28.ts:51](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L51)

---

### processTransaction

• `Optional` **processTransaction**: (`transaction`: [`SubscribedTransaction`](../classes/types_subscription.SubscribedTransaction.md)) => `boolean`

Optional predicate to indicate if these ARC-28 events should be processed for the given transaction

#### Type declaration

▸ (`transaction`): `boolean`

##### Parameters

| Name          | Type                                                                              |
| :------------ | :-------------------------------------------------------------------------------- |
| `transaction` | [`SubscribedTransaction`](../classes/types_subscription.SubscribedTransaction.md) |

##### Returns

`boolean`

#### Defined in

[src/types/arc-28.ts:53](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L53)
