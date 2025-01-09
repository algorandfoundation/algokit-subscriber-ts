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

[src/types/block.ts:743](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L743)

___

### S

• **S**: [`EncodedMerkleArrayProof`](types_block.EncodedMerkleArrayProof.md)

sigProofs

#### Defined in

[src/types/block.ts:738](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L738)

___

### c

• **c**: `Buffer`

sigCommit

#### Defined in

[src/types/block.ts:729](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L729)

___

### pr

• **pr**: `bigint`[]

positionsToReveal

#### Defined in

[src/types/block.ts:758](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L758)

___

### r

• **r**: `Map`\<`bigint`, [`EncodedReveal`](types_block.EncodedReveal.md)\>

reveal

#### Defined in

[src/types/block.ts:753](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L753)

___

### v

• `Optional` **v**: `bigint`

merkleSignatureSaltVersion

#### Defined in

[src/types/block.ts:748](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L748)

___

### w

• **w**: `bigint`

sigWeight

#### Defined in

[src/types/block.ts:733](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L733)
