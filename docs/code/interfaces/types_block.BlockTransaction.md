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

• `Optional` **aca**: `bigint`

Asset closing amount in decimal units

#### Defined in

[src/types/block.ts:193](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L193)

___

### apid

• `Optional` **apid**: `bigint`

App ID when an app is created by the transaction

#### Defined in

[src/types/block.ts:191](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L191)

___

### ca

• `Optional` **ca**: `bigint`

Algo closing amount in microAlgos

#### Defined in

[src/types/block.ts:195](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L195)

___

### caid

• `Optional` **caid**: `bigint`

Asset ID when an asset is created by the transaction

#### Defined in

[src/types/block.ts:189](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L189)

___

### dt

• `Optional` **dt**: [`BlockTransactionEvalDelta`](types_block.BlockTransactionEvalDelta.md)

The eval deltas for the block

#### Defined in

[src/types/block.ts:187](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L187)

___

### hgh

• `Optional` **hgh**: `boolean`

Has genesis hash

#### Defined in

[src/types/block.ts:199](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L199)

___

### hgi

• `Optional` **hgi**: `boolean`

Has genesis id

#### Defined in

[src/types/block.ts:197](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L197)

___

### lsig

• `Optional` **lsig**: [`LogicSig`](types_block.LogicSig.md)

Logic signature

#### Defined in

[src/types/block.ts:203](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L203)

___

### msig

• `Optional` **msig**: [`MultisigSig`](types_block.MultisigSig.md)

Transaction multisig signature

#### Defined in

[src/types/block.ts:205](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L205)

___

### sgnr

• `Optional` **sgnr**: `Uint8Array`

The signer, if signing with a different key than the Transaction type `from` property indicates

#### Defined in

[src/types/block.ts:207](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L207)

___

### sig

• `Optional` **sig**: `Uint8Array`

Transaction ED25519 signature

#### Defined in

[src/types/block.ts:201](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L201)

___

### txn

• **txn**: [`EncodedTransaction`](types_block.EncodedTransaction.md)

The encoded transaction data

#### Defined in

[src/types/block.ts:185](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L185)
