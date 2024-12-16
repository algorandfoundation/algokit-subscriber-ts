[@algorandfoundation/algokit-subscriber](../README.md) / types/block

# Module: types/block

## Table of contents

### Interfaces

- [Block](../interfaces/types_block.Block.md)
- [BlockAgreementCertificate](../interfaces/types_block.BlockAgreementCertificate.md)
- [BlockData](../interfaces/types_block.BlockData.md)
- [BlockTransaction](../interfaces/types_block.BlockTransaction.md)
- [BlockTransactionEvalDelta](../interfaces/types_block.BlockTransactionEvalDelta.md)
- [BlockValueDelta](../interfaces/types_block.BlockValueDelta.md)
- [BlockVote](../interfaces/types_block.BlockVote.md)
- [EncodedAssetParams](../interfaces/types_block.EncodedAssetParams.md)
- [EncodedBoxReference](../interfaces/types_block.EncodedBoxReference.md)
- [EncodedFalconSignatureStruct](../interfaces/types_block.EncodedFalconSignatureStruct.md)
- [EncodedFalconVerifier](../interfaces/types_block.EncodedFalconVerifier.md)
- [EncodedGlobalStateSchema](../interfaces/types_block.EncodedGlobalStateSchema.md)
- [EncodedHashFactory](../interfaces/types_block.EncodedHashFactory.md)
- [EncodedLocalStateSchema](../interfaces/types_block.EncodedLocalStateSchema.md)
- [EncodedMerkleArrayProof](../interfaces/types_block.EncodedMerkleArrayProof.md)
- [EncodedMerkleSignatureVerifier](../interfaces/types_block.EncodedMerkleSignatureVerifier.md)
- [EncodedParticipant](../interfaces/types_block.EncodedParticipant.md)
- [EncodedReveal](../interfaces/types_block.EncodedReveal.md)
- [EncodedSigslotCommit](../interfaces/types_block.EncodedSigslotCommit.md)
- [EncodedStateProof](../interfaces/types_block.EncodedStateProof.md)
- [EncodedStateProofMessage](../interfaces/types_block.EncodedStateProofMessage.md)
- [EncodedTransaction](../interfaces/types_block.EncodedTransaction.md)
- [LogicSig](../interfaces/types_block.LogicSig.md)
- [MultisigSig](../interfaces/types_block.MultisigSig.md)
- [StateProof](../interfaces/types_block.StateProof.md)
- [StateProofMessage](../interfaces/types_block.StateProofMessage.md)
- [StateProofTracking](../interfaces/types_block.StateProofTracking.md)
- [TransactionInBlock](../interfaces/types_block.TransactionInBlock.md)

### Type Aliases

- [BlockInnerTransaction](types_block.md#blockinnertransaction)

## Type Aliases

### BlockInnerTransaction

Ƭ **BlockInnerTransaction**: `Omit`\<[`BlockTransaction`](../interfaces/types_block.BlockTransaction.md), ``"hgi"`` \| ``"hgh"``\>

Data that is returned in a raw Algorand block for a single inner transaction

#### Defined in

[src/types/block.ts:242](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L242)
