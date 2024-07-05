[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / TransactionInBlock

# Interface: TransactionInBlock

[types/block](../modules/types_block.md).TransactionInBlock

The representation of all important data for a single transaction or inner transaction
and its side effects within a committed block.

## Table of contents

### Properties

- [assetCloseAmount](types_block.TransactionInBlock.md#assetcloseamount)
- [blockTransaction](types_block.TransactionInBlock.md#blocktransaction)
- [closeAmount](types_block.TransactionInBlock.md#closeamount)
- [createdAppId](types_block.TransactionInBlock.md#createdappid)
- [createdAssetId](types_block.TransactionInBlock.md#createdassetid)
- [genesisHash](types_block.TransactionInBlock.md#genesishash)
- [genesisId](types_block.TransactionInBlock.md#genesisid)
- [logs](types_block.TransactionInBlock.md#logs)
- [parentOffset](types_block.TransactionInBlock.md#parentoffset)
- [parentTransactionId](types_block.TransactionInBlock.md#parenttransactionid)
- [roundIndex](types_block.TransactionInBlock.md#roundindex)
- [roundNumber](types_block.TransactionInBlock.md#roundnumber)
- [roundOffset](types_block.TransactionInBlock.md#roundoffset)
- [roundTimestamp](types_block.TransactionInBlock.md#roundtimestamp)
- [transaction](types_block.TransactionInBlock.md#transaction)

## Properties

### assetCloseAmount

• `Optional` **assetCloseAmount**: `number` \| `bigint`

The asset close amount if the sender asset position was closed from this transaction.

#### Defined in

[types/block.ts:342](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L342)

___

### blockTransaction

• **blockTransaction**: [`BlockTransaction`](types_block.BlockTransaction.md) \| [`BlockInnerTransaction`](../modules/types_block.md#blockinnertransaction)

The block data for the transaction

#### Defined in

[types/block.ts:284](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L284)

___

### closeAmount

• `Optional` **closeAmount**: `number`

The ALGO close amount if the sender account was closed from this transaction.

#### Defined in

[types/block.ts:344](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L344)

___

### createdAppId

• `Optional` **createdAppId**: `number`

The app ID if an app was created from this transaction.

#### Defined in

[types/block.ts:340](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L340)

___

### createdAssetId

• `Optional` **createdAssetId**: `number`

The asset ID if an asset was created from this transaction.

#### Defined in

[types/block.ts:338](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L338)

___

### genesisHash

• **genesisHash**: `Buffer`

The binary genesis hash of the network the transaction is within.

#### Defined in

[types/block.ts:325](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L325)

___

### genesisId

• **genesisId**: `string`

The string genesis ID of the network the transaction is within.

#### Defined in

[types/block.ts:327](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L327)

___

### logs

• `Optional` **logs**: `Uint8Array`[]

Any logs that were issued as a result of this transaction.

#### Defined in

[types/block.ts:346](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L346)

___

### parentOffset

• `Optional` **parentOffset**: `number`

The offset within the parent transaction.

**`Example`**

```ts
- `undefined`
 - `undefined`
   - 0
   - 1
     - 2
 - `undefined`
```

#### Defined in

[types/block.ts:323](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L323)

___

### parentTransactionId

• `Optional` **parentTransactionId**: `string`

The ID of the parent transaction if this is an inner transaction.

#### Defined in

[types/block.ts:311](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L311)

___

### roundIndex

• **roundIndex**: `number`

The index within the block.txns array of this transaction or if it's an inner transaction of it's ultimate parent transaction.

**`Example`**

```ts
- 0
 - 1
   - 1
   - 1
     - 1
 - 2
```

#### Defined in

[types/block.ts:307](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L307)

___

### roundNumber

• **roundNumber**: `number`

The round number of the block the transaction is within.

#### Defined in

[types/block.ts:329](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L329)

___

### roundOffset

• **roundOffset**: `number`

The offset of the transaction within the round including inner transactions.

**`Example`**

```ts
- 0
 - 1
   - 2
   - 3
     - 4
 - 5
```

#### Defined in

[types/block.ts:295](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L295)

___

### roundTimestamp

• **roundTimestamp**: `number`

The round unix timestamp of the block the transaction is within.

#### Defined in

[types/block.ts:331](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L331)

___

### transaction

• **transaction**: `Transaction`

The transaction as an algosdk `Transaction` object.

#### Defined in

[types/block.ts:336](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L336)
