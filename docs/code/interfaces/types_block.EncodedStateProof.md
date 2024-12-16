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

[src/types/block.ts:697](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L697)

___

### S

• **S**: [`EncodedMerkleArrayProof`](types_block.EncodedMerkleArrayProof.md)

sigProofs

#### Defined in

[src/types/block.ts:692](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L692)

___

### c

• **c**: `Buffer`

sigCommit

#### Defined in

[src/types/block.ts:683](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L683)

___

### pr

• **pr**: `bigint`[]

positionsToReveal

#### Defined in

[src/types/block.ts:712](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L712)

___

### r

• **r**: `Map`\<`bigint`, [`EncodedReveal`](types_block.EncodedReveal.md)\>

reveal

#### Defined in

[src/types/block.ts:707](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L707)

___

### v

• `Optional` **v**: `number`

merkleSignatureSaltVersion

#### Defined in

[src/types/block.ts:702](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L702)

___

### w

• **w**: `bigint`

sigWeight

#### Defined in

[src/types/block.ts:687](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L687)
