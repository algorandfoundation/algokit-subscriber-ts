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

[src/types/block.ts:730](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L730)

___

### S

• **S**: [`EncodedMerkleArrayProof`](types_block.EncodedMerkleArrayProof.md)

sigProofs

#### Defined in

[src/types/block.ts:725](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L725)

___

### c

• **c**: `Buffer`

sigCommit

#### Defined in

[src/types/block.ts:716](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L716)

___

### pr

• **pr**: `bigint`[]

positionsToReveal

#### Defined in

[src/types/block.ts:745](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L745)

___

### r

• **r**: `Map`\<`bigint`, [`EncodedReveal`](types_block.EncodedReveal.md)\>

reveal

#### Defined in

[src/types/block.ts:740](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L740)

___

### v

• `Optional` **v**: `bigint`

merkleSignatureSaltVersion

#### Defined in

[src/types/block.ts:735](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L735)

___

### w

• **w**: `bigint`

sigWeight

#### Defined in

[src/types/block.ts:720](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L720)
