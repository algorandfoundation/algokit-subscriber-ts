[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / Arc28EventToProcess

# Interface: Arc28EventToProcess

[types/subscription](../modules/types_subscription.md).Arc28EventToProcess

An ARC-28 event to be processed

## Hierarchy

- **`Arc28EventToProcess`**

  ↳ [`EmittedArc28Event`](types_subscription.EmittedArc28Event.md)

## Table of contents

### Properties

- [eventDefinition](types_subscription.Arc28EventToProcess.md#eventdefinition)
- [eventName](types_subscription.Arc28EventToProcess.md#eventname)
- [eventPrefix](types_subscription.Arc28EventToProcess.md#eventprefix)
- [eventSignature](types_subscription.Arc28EventToProcess.md#eventsignature)
- [groupName](types_subscription.Arc28EventToProcess.md#groupname)

## Properties

### eventDefinition

• **eventDefinition**: [`Arc28Event`](types_subscription.Arc28Event.md)

The ARC-28 definition of the event

#### Defined in

[types/subscription.ts:34](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L34)

___

### eventName

• **eventName**: `string`

The name of the ARC-28 event that was triggered

#### Defined in

[types/subscription.ts:28](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L28)

___

### eventPrefix

• **eventPrefix**: `string`

The 4-byte hex prefix for the event

#### Defined in

[types/subscription.ts:32](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L32)

___

### eventSignature

• **eventSignature**: `string`

The signature of the event e.g. `EventName(type1,type2)`

#### Defined in

[types/subscription.ts:30](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L30)

___

### groupName

• **groupName**: `string`

The name of the ARC-28 event group the event belongs to

#### Defined in

[types/subscription.ts:26](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L26)
