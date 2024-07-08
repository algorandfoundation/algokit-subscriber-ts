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

[types/block.ts:166](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L166)

___

### apid

• `Optional` **apid**: `number`

App ID when an app is created by the transaction

#### Defined in

[types/block.ts:164](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L164)

___

### ca

• `Optional` **ca**: `number`

Algo closing amount in microAlgos

#### Defined in

[types/block.ts:168](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L168)

___

### caid

• `Optional` **caid**: `number`

Asset ID when an asset is created by the transaction

#### Defined in

[types/block.ts:162](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L162)

___

### dt

• `Optional` **dt**: [`BlockTransactionEvalDelta`](types_block.BlockTransactionEvalDelta.md)

The eval deltas for the block

#### Defined in

[types/block.ts:160](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L160)

___

### hgh

• `Optional` **hgh**: `boolean`

Has genesis hash

#### Defined in

[types/block.ts:172](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L172)

___

### hgi

• `Optional` **hgi**: `boolean`

Has genesis id

#### Defined in

[types/block.ts:170](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L170)

___

### lsig

• `Optional` **lsig**: [`LogicSig`](types_block.LogicSig.md)

Logic signature

#### Defined in

[types/block.ts:176](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L176)

___

### msig

• `Optional` **msig**: [`MultisigSig`](types_block.MultisigSig.md)

Transaction multisig signature

#### Defined in

[types/block.ts:178](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L178)

___

### sgnr

• `Optional` **sgnr**: `Uint8Array`

The signer, if signing with a different key than the Transaction type `from` property indicates

#### Defined in

[types/block.ts:180](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L180)

___

### sig

• `Optional` **sig**: `Uint8Array`

Transaction ED25519 signature

#### Defined in

[types/block.ts:174](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L174)

___

### txn

• **txn**: `EncodedTransaction`

The encoded transaction data

#### Defined in

[types/block.ts:158](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L158)
