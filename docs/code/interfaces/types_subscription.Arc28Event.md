[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / Arc28Event

# Interface: Arc28Event

[types/subscription](../modules/types_subscription.md).Arc28Event

The definition of metadata for an ARC-28 event per https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0028.md#event.

## Table of contents

### Properties

- [args](types_subscription.Arc28Event.md#args)
- [desc](types_subscription.Arc28Event.md#desc)
- [name](types_subscription.Arc28Event.md#name)

## Properties

### args

• **args**: \{ `desc?`: `string` ; `name?`: `string` ; `type`: `string`  }[]

The arguments of the event, in order

#### Defined in

[types/subscription.ts:13](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L13)

___

### desc

• `Optional` **desc**: `string`

Optional, user-friendly description for the event

#### Defined in

[types/subscription.ts:11](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L11)

___

### name

• **name**: `string`

The name of the event

#### Defined in

[types/subscription.ts:9](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L9)
