[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / MultisigSig

# Interface: MultisigSig

[types/block](../modules/types_block.md).MultisigSig

Data that represents a multisig signature

**`See`**

https://github.com/algorand/go-algorand/blob/master/crypto/multisig.go#L36

## Table of contents

### Properties

- [subsig](types_block.MultisigSig.md#subsig)
- [thr](types_block.MultisigSig.md#thr)
- [v](types_block.MultisigSig.md#v)

## Properties

### subsig

• **subsig**: \{ `pk`: `Uint8Array` ; `s?`: `Uint8Array`  }[]

Sub-signatures

#### Defined in

[types/block.ts:187](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L187)

___

### thr

• **thr**: `number`

Multisig threshold

#### Defined in

[types/block.ts:185](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L185)

___

### v

• **v**: `number`

Multisig version

#### Defined in

[types/block.ts:183](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L183)
