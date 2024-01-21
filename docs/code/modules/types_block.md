[@algorandfoundation/algokit-subscriber](../README.md) / types/block

# Module: types/block

## Table of contents

### Interfaces

- [Block](../interfaces/types_block.Block.md)
- [BlockTransaction](../interfaces/types_block.BlockTransaction.md)
- [BlockTransactionEvalDelta](../interfaces/types_block.BlockTransactionEvalDelta.md)
- [BlockValueDelta](../interfaces/types_block.BlockValueDelta.md)
- [LogicSig](../interfaces/types_block.LogicSig.md)
- [MultisigSig](../interfaces/types_block.MultisigSig.md)

### Type Aliases

- [BlockInnerTransaction](types_block.md#blockinnertransaction)

## Type Aliases

### BlockInnerTransaction

Ƭ **BlockInnerTransaction**: `Omit`\<[`BlockTransaction`](../interfaces/types_block.BlockTransaction.md), ``"hgi"`` \| ``"hgh"``\>

Data that is returned in a raw Algorand block for a single inner transaction

#### Defined in

[types/block.ts:121](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L121)
