[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / BlockVote

# Interface: BlockVote

[types/block](../modules/types_block.md).BlockVote

A vote within a block certificate.

**`See`**

https://github.com/algorand/go-algorand/blob/master/agreement/vote.go

## Table of contents

### Properties

- [cred](types_block.BlockVote.md#cred)
- [sig](types_block.BlockVote.md#sig)
- [snd](types_block.BlockVote.md#snd)

## Properties

### cred

• **cred**: `Object`

Committee credential

**`See`**

https://github.com/algorand/go-algorand/blob/master/data/committee/credential.go

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `pf` | `Uint8Array` | VRF proof of the credential |

#### Defined in

[src/types/block.ts:53](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L53)

___

### sig

• **sig**: \{ `p`: `Uint8Array` ; `p1s`: `Uint8Array` ; `p2`: `Uint8Array` ; `p2s`: `Uint8Array` ; `ps`: `Uint8Array` ; `s`: `Uint8Array`  }[]

One-time signature

**`See`**

https://github.com/algorand/go-algorand/blob/master/crypto/onetimesig.go

#### Defined in

[src/types/block.ts:61](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L61)

___

### snd

• **snd**: `Uint8Array`

Sender of the vote

#### Defined in

[src/types/block.ts:48](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L48)
