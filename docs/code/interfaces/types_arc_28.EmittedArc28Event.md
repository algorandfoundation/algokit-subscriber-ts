[@algorandfoundation/algokit-subscriber](../README.md) / [types/arc-28](../modules/types_arc_28.md) / EmittedArc28Event

# Interface: EmittedArc28Event

[types/arc-28](../modules/types_arc_28.md).EmittedArc28Event

An emitted ARC-28 event extracted from an app call log.

## Hierarchy

- [`Arc28EventToProcess`](types_arc_28.Arc28EventToProcess.md)

  ↳ **`EmittedArc28Event`**

## Table of contents

### Properties

- [args](types_arc_28.EmittedArc28Event.md#args)
- [argsByName](types_arc_28.EmittedArc28Event.md#argsbyname)
- [eventDefinition](types_arc_28.EmittedArc28Event.md#eventdefinition)
- [eventName](types_arc_28.EmittedArc28Event.md#eventname)
- [eventPrefix](types_arc_28.EmittedArc28Event.md#eventprefix)
- [eventSignature](types_arc_28.EmittedArc28Event.md#eventsignature)
- [groupName](types_arc_28.EmittedArc28Event.md#groupname)

## Properties

### args

• **args**: `ABIValue`[]

The ordered arguments extracted from the event that was emitted

#### Defined in

[types/arc-28.ts:41](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L41)

___

### argsByName

• **argsByName**: `Record`\<`string`, `ABIValue`\>

The named arguments extracted from the event that was emitted (where the arguments had a name defined)

#### Defined in

[types/arc-28.ts:43](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L43)

___

### eventDefinition

• **eventDefinition**: [`Arc28Event`](types_arc_28.Arc28Event.md)

The ARC-28 definition of the event

#### Inherited from

[Arc28EventToProcess](types_arc_28.Arc28EventToProcess.md).[eventDefinition](types_arc_28.Arc28EventToProcess.md#eventdefinition)

#### Defined in

[types/arc-28.ts:35](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L35)

___

### eventName

• **eventName**: `string`

The name of the ARC-28 event that was triggered

#### Inherited from

[Arc28EventToProcess](types_arc_28.Arc28EventToProcess.md).[eventName](types_arc_28.Arc28EventToProcess.md#eventname)

#### Defined in

[types/arc-28.ts:29](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L29)

___

### eventPrefix

• **eventPrefix**: `string`

The 4-byte hex prefix for the event

#### Inherited from

[Arc28EventToProcess](types_arc_28.Arc28EventToProcess.md).[eventPrefix](types_arc_28.Arc28EventToProcess.md#eventprefix)

#### Defined in

[types/arc-28.ts:33](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L33)

___

### eventSignature

• **eventSignature**: `string`

The signature of the event e.g. `EventName(type1,type2)`

#### Inherited from

[Arc28EventToProcess](types_arc_28.Arc28EventToProcess.md).[eventSignature](types_arc_28.Arc28EventToProcess.md#eventsignature)

#### Defined in

[types/arc-28.ts:31](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L31)

___

### groupName

• **groupName**: `string`

The name of the ARC-28 event group the event belongs to

#### Inherited from

[Arc28EventToProcess](types_arc_28.Arc28EventToProcess.md).[groupName](types_arc_28.Arc28EventToProcess.md#groupname)

#### Defined in

[types/arc-28.ts:27](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/arc-28.ts#L27)
