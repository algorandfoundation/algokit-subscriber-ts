[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / BlockValueDelta

# Interface: BlockValueDelta

[types/block](../modules/types_block.md).BlockValueDelta

A value delta as a result of a block transaction

## Table of contents

### Properties

- [at](types_block.BlockValueDelta.md#at)
- [bs](types_block.BlockValueDelta.md#bs)
- [ui](types_block.BlockValueDelta.md#ui)

## Properties

### at

• **at**: `number`

DeltaAction is an enum of actions that may be performed when applying a delta to a TEAL key/value store:
  * `1`: SetBytesAction indicates that a TEAL byte slice should be stored at a key
  * `2`: SetUintAction indicates that a Uint should be stored at a key
  * `3`: DeleteAction indicates that the value for a particular key should be deleted

#### Defined in

[types/block.ts:260](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L260)

___

### bs

• `Optional` **bs**: `Uint8Array`

Bytes value

#### Defined in

[types/block.ts:263](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L263)

___

### ui

• `Optional` **ui**: `number`

Uint64 value

#### Defined in

[types/block.ts:266](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L266)
