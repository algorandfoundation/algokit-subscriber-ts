[@algorandfoundation/algokit-subscriber](../README.md) / [types/arc-28](../modules/types_arc_28.md) / Arc28EventToProcess

# Interface: Arc28EventToProcess

[types/arc-28](../modules/types_arc_28.md).Arc28EventToProcess

An ARC-28 event to be processed

## Hierarchy

- **`Arc28EventToProcess`**

  ↳ [`EmittedArc28Event`](types_arc_28.EmittedArc28Event.md)

## Table of contents

### Properties

- [eventDefinition](types_arc_28.Arc28EventToProcess.md#eventdefinition)
- [eventName](types_arc_28.Arc28EventToProcess.md#eventname)
- [eventPrefix](types_arc_28.Arc28EventToProcess.md#eventprefix)
- [eventSignature](types_arc_28.Arc28EventToProcess.md#eventsignature)
- [groupName](types_arc_28.Arc28EventToProcess.md#groupname)

## Properties

### eventDefinition

• **eventDefinition**: [`Arc28Event`](types_arc_28.Arc28Event.md)

The ARC-28 definition of the event

#### Defined in

[types/arc-28.ts:35](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L35)

___

### eventName

• **eventName**: `string`

The name of the ARC-28 event that was triggered

#### Defined in

[types/arc-28.ts:29](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L29)

___

### eventPrefix

• **eventPrefix**: `string`

The 4-byte hex prefix for the event

#### Defined in

[types/arc-28.ts:33](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L33)

___

### eventSignature

• **eventSignature**: `string`

The signature of the event e.g. `EventName(type1,type2)`

#### Defined in

[types/arc-28.ts:31](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L31)

___

### groupName

• **groupName**: `string`

The name of the ARC-28 event group the event belongs to

#### Defined in

[types/arc-28.ts:27](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L27)
