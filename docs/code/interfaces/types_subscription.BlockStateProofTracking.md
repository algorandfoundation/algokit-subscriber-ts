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

• `Optional` **nextRound**: `bigint`

(n) Next round for which we will accept a state proof transaction.

#### Defined in

[src/types/subscription.ts:105](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L105)

___

### onlineTotalWeight

• `Optional` **onlineTotalWeight**: `number`

(t) The total number of microalgos held by the online accounts during the
StateProof round.

#### Defined in

[src/types/subscription.ts:111](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L111)

___

### type

• `Optional` **type**: `number`

State Proof Type. Note the raw object uses map with this as key.

#### Defined in

[src/types/subscription.ts:116](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L116)

___

### votersCommitment

• `Optional` **votersCommitment**: `string`

(v) Root of a vector commitment containing online accounts that will help sign
the proof.

#### Defined in

[src/types/subscription.ts:122](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L122)
