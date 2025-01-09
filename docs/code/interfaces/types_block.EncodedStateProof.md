[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / EncodedStateProof

# Interface: EncodedStateProof

[types/block](../modules/types_block.md).EncodedStateProof

## Table of contents

### Properties

- [P](types_block.EncodedStateProof.md#p)
- [S](types_block.EncodedStateProof.md#s)
- [c](types_block.EncodedStateProof.md#c)
- [pr](types_block.EncodedStateProof.md#pr)
- [r](types_block.EncodedStateProof.md#r)
- [v](types_block.EncodedStateProof.md#v)
- [w](types_block.EncodedStateProof.md#w)

## Properties

### P

• **P**: [`EncodedMerkleArrayProof`](types_block.EncodedMerkleArrayProof.md)

partProofs

#### Defined in

[src/types/block.ts:731](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L731)

___

### S

• **S**: [`EncodedMerkleArrayProof`](types_block.EncodedMerkleArrayProof.md)

sigProofs

#### Defined in

[src/types/block.ts:726](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L726)

___

### c

• **c**: `Buffer`

sigCommit

#### Defined in

[src/types/block.ts:717](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L717)

___

### pr

• **pr**: `bigint`[]

positionsToReveal

#### Defined in

[src/types/block.ts:746](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L746)

___

### r

• **r**: `Map`\<`bigint`, [`EncodedReveal`](types_block.EncodedReveal.md)\>

reveal

#### Defined in

[src/types/block.ts:741](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L741)

___

### v

• `Optional` **v**: `bigint`

merkleSignatureSaltVersion

#### Defined in

[src/types/block.ts:736](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L736)

___

### w

• **w**: `bigint`

sigWeight

#### Defined in

[src/types/block.ts:721](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L721)
