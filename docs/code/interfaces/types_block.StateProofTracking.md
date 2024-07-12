[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / StateProofTracking

# Interface: StateProofTracking

[types/block](../modules/types_block.md).StateProofTracking

## Table of contents

### Properties

- [n](types_block.StateProofTracking.md#n)
- [t](types_block.StateProofTracking.md#t)
- [v](types_block.StateProofTracking.md#v)

## Properties

### n

• `Optional` **n**: `number`

StateProofNextRound is the next round for which we will accept a StateProof transaction.

#### Defined in

[types/block.ts:317](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L317)

___

### t

• `Optional` **t**: `number`

StateProofOnlineTotalWeight is the total number of microalgos held by the online accounts
during the StateProof round (or zero, if the merkle root is zero - no commitment for StateProof voters).
This is intended for computing the threshold of votes to expect from StateProofVotersCommitment.

#### Defined in

[types/block.ts:313](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L313)

___

### v

• `Optional` **v**: `string`

StateProofVotersCommitment is the root of a vector commitment containing the
online accounts that will help sign a state proof.  The VC root, and the state proof,
happen on blocks that are a multiple of ConsensusParams.StateProofRounds.
For blocks that are not a multiple of ConsensusParams.StateProofRounds, this value is zero.

#### Defined in

[types/block.ts:308](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L308)
