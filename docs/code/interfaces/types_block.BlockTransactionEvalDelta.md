[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / BlockTransactionEvalDelta

# Interface: BlockTransactionEvalDelta

[types/block](../modules/types_block.md).BlockTransactionEvalDelta

Eval deltas for a block

## Table of contents

### Properties

- [gd](types_block.BlockTransactionEvalDelta.md#gd)
- [itx](types_block.BlockTransactionEvalDelta.md#itx)
- [ld](types_block.BlockTransactionEvalDelta.md#ld)
- [lg](types_block.BlockTransactionEvalDelta.md#lg)

## Properties

### gd

• **gd**: `Record`\<`string`, [`BlockValueDelta`](types_block.BlockValueDelta.md)\>

The delta of global state, keyed by key

#### Defined in

[src/types/block.ts:247](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L247)

___

### itx

• `Optional` **itx**: [`BlockInnerTransaction`](../modules/types_block.md#blockinnertransaction)[]

Inner transactions

#### Defined in

[src/types/block.ts:253](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L253)

___

### ld

• **ld**: `Record`\<`number`, `Record`\<`string`, [`BlockValueDelta`](types_block.BlockValueDelta.md)\>\>

The delta of local state keyed by account ID offset in [txn.Sender, ...txn.Accounts] and then keyed by key

#### Defined in

[src/types/block.ts:249](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L249)

___

### lg

• **lg**: `Uint8Array`[]

Logs

#### Defined in

[src/types/block.ts:251](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L251)
