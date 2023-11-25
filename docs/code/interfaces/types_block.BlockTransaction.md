[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / BlockTransaction

# Interface: BlockTransaction

[types/block](../modules/types_block.md).BlockTransaction

## Table of contents

### Properties

- [aca](types_block.BlockTransaction.md#aca)
- [apid](types_block.BlockTransaction.md#apid)
- [ca](types_block.BlockTransaction.md#ca)
- [caid](types_block.BlockTransaction.md#caid)
- [hgi](types_block.BlockTransaction.md#hgi)
- [txn](types_block.BlockTransaction.md#txn)

## Properties

### aca

• `Optional` **aca**: `number`

Asset closing amount in decimal units

#### Defined in

[types/block.ts:66](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L66)

___

### apid

• `Optional` **apid**: `number`

App ID when an app is created by the transaction

#### Defined in

[types/block.ts:64](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L64)

___

### ca

• `Optional` **ca**: `number`

Algo closing amount in microAlgos

#### Defined in

[types/block.ts:68](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L68)

___

### caid

• `Optional` **caid**: `number`

Asset ID when an asset is created by the transaction

#### Defined in

[types/block.ts:62](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L62)

___

### hgi

• **hgi**: `boolean`

Has genesis id

#### Defined in

[types/block.ts:70](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L70)

___

### txn

• **txn**: `EncodedTransaction`

The encoded transaction data

#### Defined in

[types/block.ts:60](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L60)
