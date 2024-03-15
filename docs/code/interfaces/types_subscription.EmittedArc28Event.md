[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / EmittedArc28Event

# Interface: EmittedArc28Event

[types/subscription](../modules/types_subscription.md).EmittedArc28Event

An emitted ARC-28 event extracted from an app call log.

## Hierarchy

- [`Arc28EventToProcess`](types_subscription.Arc28EventToProcess.md)

  ↳ **`EmittedArc28Event`**

## Table of contents

### Properties

- [args](types_subscription.EmittedArc28Event.md#args)
- [argsByName](types_subscription.EmittedArc28Event.md#argsbyname)
- [eventDefinition](types_subscription.EmittedArc28Event.md#eventdefinition)
- [eventName](types_subscription.EmittedArc28Event.md#eventname)
- [eventPrefix](types_subscription.EmittedArc28Event.md#eventprefix)
- [eventSignature](types_subscription.EmittedArc28Event.md#eventsignature)
- [groupName](types_subscription.EmittedArc28Event.md#groupname)

## Properties

### args

• **args**: `ABIValue`[]

The ordered arguments extracted from the event that was emitted

#### Defined in

[types/subscription.ts:40](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L40)

___

### argsByName

• **argsByName**: `Record`\<`string`, `ABIValue`\>

The named arguments extracted from the event that was emitted (where the arguments had a name defined)

#### Defined in

[types/subscription.ts:42](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L42)

___

### eventDefinition

• **eventDefinition**: [`Arc28Event`](types_subscription.Arc28Event.md)

The ARC-28 definition of the event

#### Inherited from

[Arc28EventToProcess](types_subscription.Arc28EventToProcess.md).[eventDefinition](types_subscription.Arc28EventToProcess.md#eventdefinition)

#### Defined in

[types/subscription.ts:34](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L34)

___

### eventName

• **eventName**: `string`

The name of the ARC-28 event that was triggered

#### Inherited from

[Arc28EventToProcess](types_subscription.Arc28EventToProcess.md).[eventName](types_subscription.Arc28EventToProcess.md#eventname)

#### Defined in

[types/subscription.ts:28](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L28)

___

### eventPrefix

• **eventPrefix**: `string`

The 4-byte hex prefix for the event

#### Inherited from

[Arc28EventToProcess](types_subscription.Arc28EventToProcess.md).[eventPrefix](types_subscription.Arc28EventToProcess.md#eventprefix)

#### Defined in

[types/subscription.ts:32](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L32)

___

### eventSignature

• **eventSignature**: `string`

The signature of the event e.g. `EventName(type1,type2)`

#### Inherited from

[Arc28EventToProcess](types_subscription.Arc28EventToProcess.md).[eventSignature](types_subscription.Arc28EventToProcess.md#eventsignature)

#### Defined in

[types/subscription.ts:30](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L30)

___

### groupName

• **groupName**: `string`

The name of the ARC-28 event group the event belongs to

#### Inherited from

[Arc28EventToProcess](types_subscription.Arc28EventToProcess.md).[groupName](types_subscription.Arc28EventToProcess.md#groupname)

#### Defined in

[types/subscription.ts:26](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L26)
