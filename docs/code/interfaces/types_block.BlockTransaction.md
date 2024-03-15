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

• `Optional` **aca**: `number`

Asset closing amount in decimal units

#### Defined in

[types/block.ts:72](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L72)

___

### apid

• `Optional` **apid**: `number`

App ID when an app is created by the transaction

#### Defined in

[types/block.ts:70](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L70)

___

### ca

• `Optional` **ca**: `number`

Algo closing amount in microAlgos

#### Defined in

[types/block.ts:74](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L74)

___

### caid

• `Optional` **caid**: `number`

Asset ID when an asset is created by the transaction

#### Defined in

[types/block.ts:68](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L68)

___

### dt

• `Optional` **dt**: [`BlockTransactionEvalDelta`](types_block.BlockTransactionEvalDelta.md)

The eval deltas for the block

#### Defined in

[types/block.ts:66](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L66)

___

### hgh

• `Optional` **hgh**: `boolean`

Has genesis hash

#### Defined in

[types/block.ts:78](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L78)

___

### hgi

• **hgi**: `boolean`

Has genesis id

#### Defined in

[types/block.ts:76](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L76)

___

### lsig

• `Optional` **lsig**: [`LogicSig`](types_block.LogicSig.md)

Logic signature

#### Defined in

[types/block.ts:82](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L82)

___

### msig

• `Optional` **msig**: [`MultisigSig`](types_block.MultisigSig.md)

Transaction multisig signature

#### Defined in

[types/block.ts:84](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L84)

___

### sgnr

• `Optional` **sgnr**: `Uint8Array`

The signer, if signing with a different key than the Transaction type `from` property indicates

#### Defined in

[types/block.ts:86](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L86)

___

### sig

• `Optional` **sig**: `Uint8Array`

Transaction ED25519 signature

#### Defined in

[types/block.ts:80](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L80)

___

### txn

• **txn**: `EncodedTransaction`

The encoded transaction data

#### Defined in

[types/block.ts:64](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L64)
