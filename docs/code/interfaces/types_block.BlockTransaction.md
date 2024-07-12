[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / BlockTransaction

# Interface: BlockTransaction

[types/block](../modules/types_block.md).BlockTransaction

Data that is returned in a raw Algorand block for a single transaction

**`See`**

https://github.com/algorand/go-algorand/blob/master/data/transactions/signedtxn.go#L32

## Table of contents

### Properties

- [aca](types_block.BlockTransaction.md#aca)
- [apid](types_block.BlockTransaction.md#apid)
- [ca](types_block.BlockTransaction.md#ca)
- [caid](types_block.BlockTransaction.md#caid)
- [dt](types_block.BlockTransaction.md#dt)
- [hgh](types_block.BlockTransaction.md#hgh)
- [hgi](types_block.BlockTransaction.md#hgi)
- [lsig](types_block.BlockTransaction.md#lsig)
- [msig](types_block.BlockTransaction.md#msig)
- [sgnr](types_block.BlockTransaction.md#sgnr)
- [sig](types_block.BlockTransaction.md#sig)
- [txn](types_block.BlockTransaction.md#txn)

## Properties

### aca

• `Optional` **aca**: `number` \| `bigint`

Asset closing amount in decimal units

#### Defined in

[types/block.ts:190](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L190)

___

### apid

• `Optional` **apid**: `number`

App ID when an app is created by the transaction

#### Defined in

[types/block.ts:188](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L188)

___

### ca

• `Optional` **ca**: `number`

Algo closing amount in microAlgos

#### Defined in

[types/block.ts:192](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L192)

___

### caid

• `Optional` **caid**: `number`

Asset ID when an asset is created by the transaction

#### Defined in

[types/block.ts:186](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L186)

___

### dt

• `Optional` **dt**: [`BlockTransactionEvalDelta`](types_block.BlockTransactionEvalDelta.md)

The eval deltas for the block

#### Defined in

[types/block.ts:184](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L184)

___

### hgh

• `Optional` **hgh**: `boolean`

Has genesis hash

#### Defined in

[types/block.ts:196](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L196)

___

### hgi

• `Optional` **hgi**: `boolean`

Has genesis id

#### Defined in

[types/block.ts:194](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L194)

___

### lsig

• `Optional` **lsig**: [`LogicSig`](types_block.LogicSig.md)

Logic signature

#### Defined in

[types/block.ts:200](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L200)

___

### msig

• `Optional` **msig**: [`MultisigSig`](types_block.MultisigSig.md)

Transaction multisig signature

#### Defined in

[types/block.ts:202](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L202)

___

### sgnr

• `Optional` **sgnr**: `Uint8Array`

The signer, if signing with a different key than the Transaction type `from` property indicates

#### Defined in

[types/block.ts:204](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L204)

___

### sig

• `Optional` **sig**: `Uint8Array`

Transaction ED25519 signature

#### Defined in

[types/block.ts:198](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L198)

___

### txn

• **txn**: `EncodedTransaction`

The encoded transaction data

#### Defined in

[types/block.ts:182](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L182)
