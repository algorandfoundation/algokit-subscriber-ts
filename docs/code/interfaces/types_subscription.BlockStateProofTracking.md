[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / BlockStateProofTracking

# Interface: BlockStateProofTracking

[types/subscription](../modules/types_subscription.md).BlockStateProofTracking

## Table of contents

### Properties

- [nextRound](types_subscription.BlockStateProofTracking.md#nextround)
- [onlineTotalWeight](types_subscription.BlockStateProofTracking.md#onlinetotalweight)
- [type](types_subscription.BlockStateProofTracking.md#type)
- [votersCommitment](types_subscription.BlockStateProofTracking.md#voterscommitment)

## Properties

### nextRound

• `Optional` **nextRound**: `number`

(n) Next round for which we will accept a state proof transaction.

#### Defined in

[types/subscription.ts:103](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L103)

___

### onlineTotalWeight

• `Optional` **onlineTotalWeight**: `number`

(t) The total number of microalgos held by the online accounts during the
StateProof round.

#### Defined in

[types/subscription.ts:109](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L109)

___

### type

• `Optional` **type**: `number`

State Proof Type. Note the raw object uses map with this as key.

#### Defined in

[types/subscription.ts:114](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L114)

___

### votersCommitment

• `Optional` **votersCommitment**: `string`

(v) Root of a vector commitment containing online accounts that will help sign
the proof.

#### Defined in

[types/subscription.ts:120](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L120)
