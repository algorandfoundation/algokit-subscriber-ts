[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / LogicSig

# Interface: LogicSig

[types/block](../modules/types_block.md).LogicSig

Data that represents a multisig signature

**`See`**

https://github.com/algorand/go-algorand/blob/master/data/transactions/logicsig.go#L32

## Table of contents

### Properties

- [arg](types_block.LogicSig.md#arg)
- [l](types_block.LogicSig.md#l)
- [msig](types_block.LogicSig.md#msig)
- [sig](types_block.LogicSig.md#sig)

## Properties

### arg

• `Optional` **arg**: `Buffer`[]

Arguments passed into the logic signature

#### Defined in

[types/block.ts:193](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L193)

___

### l

• **l**: `Uint8Array`

Logic sig code

#### Defined in

[types/block.ts:187](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L187)

___

### msig

• `Optional` **msig**: [`MultisigSig`](types_block.MultisigSig.md)

Multisig signature for delegated operations

#### Defined in

[types/block.ts:191](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L191)

___

### sig

• `Optional` **sig**: `Uint8Array`

ED25519 signature for delegated operations

#### Defined in

[types/block.ts:189](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L189)
