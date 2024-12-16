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

[src/types/block.ts:233](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L233)

___

### thr

• **thr**: `number`

Multisig threshold

#### Defined in

[src/types/block.ts:231](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L231)

___

### v

• **v**: `number`

Multisig version

#### Defined in

[src/types/block.ts:229](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L229)
