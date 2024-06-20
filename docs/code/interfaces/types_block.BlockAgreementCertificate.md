[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / BlockAgreementCertificate

# Interface: BlockAgreementCertificate

[types/block](../modules/types_block.md).BlockAgreementCertificate

Data this is returned in a raw Algorand block to certify the block.

**`See`**

 - https://github.com/algorand/go-algorand/blob/master/agreement/certificate.go
 - https://github.com/algorand/go-algorand/blob/master/agreement/bundle.go#L31
 - https://github.com/algorand/go-algorand/blob/master/agreement/proposal.go

## Table of contents

### Properties

- [eqv](types_block.BlockAgreementCertificate.md#eqv)
- [per](types_block.BlockAgreementCertificate.md#per)
- [prop](types_block.BlockAgreementCertificate.md#prop)
- [rnd](types_block.BlockAgreementCertificate.md#rnd)
- [step](types_block.BlockAgreementCertificate.md#step)
- [vote](types_block.BlockAgreementCertificate.md#vote)

## Properties

### eqv

• **eqv**: [`BlockVote`](types_block.BlockVote.md)[]

Equivocation votes

#### Defined in

[types/block.ts:40](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L40)

___

### per

• **per**: `bigint`

Period represents the current period of the source.

#### Defined in

[types/block.ts:25](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L25)

___

### prop

• **prop**: `Object`

The proposal

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `dig` | `Uint8Array` | Block digest |
| `encdig` | `Uint8Array` | Encoding digest (the cryptographic hash of the proposal) |
| `oprop` | `Uint8Array` | Original proposer |

#### Defined in

[types/block.ts:29](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L29)

___

### rnd

• **rnd**: `number`

Round number

#### Defined in

[types/block.ts:23](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L23)

___

### step

• **step**: `number`

Step represents the current period of the source.

#### Defined in

[types/block.ts:27](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L27)

___

### vote

• **vote**: [`BlockVote`](types_block.BlockVote.md)[]

Votes

#### Defined in

[types/block.ts:38](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L38)
