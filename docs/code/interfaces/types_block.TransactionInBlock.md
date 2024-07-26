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
- [closeRewards](types_block.TransactionInBlock.md#closerewards)
- [createdAppId](types_block.TransactionInBlock.md#createdappid)
- [createdAssetId](types_block.TransactionInBlock.md#createdassetid)
- [genesisHash](types_block.TransactionInBlock.md#genesishash)
- [genesisId](types_block.TransactionInBlock.md#genesisid)
- [logs](types_block.TransactionInBlock.md#logs)
- [parentOffset](types_block.TransactionInBlock.md#parentoffset)
- [parentTransactionId](types_block.TransactionInBlock.md#parenttransactionid)
- [receiverRewards](types_block.TransactionInBlock.md#receiverrewards)
- [roundIndex](types_block.TransactionInBlock.md#roundindex)
- [roundNumber](types_block.TransactionInBlock.md#roundnumber)
- [roundOffset](types_block.TransactionInBlock.md#roundoffset)
- [roundTimestamp](types_block.TransactionInBlock.md#roundtimestamp)
- [senderRewards](types_block.TransactionInBlock.md#senderrewards)
- [transaction](types_block.TransactionInBlock.md#transaction)

## Properties

### assetCloseAmount

• `Optional` **assetCloseAmount**: `number` \| `bigint`

The asset close amount if the sender asset position was closed from this transaction.

#### Defined in

[types/block.ts:391](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L391)

___

### blockTransaction

• **blockTransaction**: [`BlockTransaction`](types_block.BlockTransaction.md) \| [`BlockInnerTransaction`](../modules/types_block.md#blockinnertransaction)

The block data for the transaction

#### Defined in

[types/block.ts:333](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L333)

___

### closeAmount

• `Optional` **closeAmount**: `number`

The ALGO close amount if the sender account was closed from this transaction.

#### Defined in

[types/block.ts:393](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L393)

___

### closeRewards

• `Optional` **closeRewards**: `number`

Rewards in microalgos applied to the close remainder to account.

#### Defined in

[types/block.ts:397](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L397)

___

### createdAppId

• `Optional` **createdAppId**: `number`

The app ID if an app was created from this transaction.

#### Defined in

[types/block.ts:389](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L389)

___

### createdAssetId

• `Optional` **createdAssetId**: `number`

The asset ID if an asset was created from this transaction.

#### Defined in

[types/block.ts:387](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L387)

___

### genesisHash

• **genesisHash**: `Buffer`

The binary genesis hash of the network the transaction is within.

#### Defined in

[types/block.ts:374](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L374)

___

### genesisId

• **genesisId**: `string`

The string genesis ID of the network the transaction is within.

#### Defined in

[types/block.ts:376](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L376)

___

### logs

• `Optional` **logs**: `Uint8Array`[]

Any logs that were issued as a result of this transaction.

#### Defined in

[types/block.ts:395](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L395)

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

[types/block.ts:372](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L372)

___

### parentTransactionId

• `Optional` **parentTransactionId**: `string`

The ID of the parent transaction if this is an inner transaction.

#### Defined in

[types/block.ts:360](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L360)

___

### receiverRewards

• `Optional` **receiverRewards**: `number`

Rewards in microalgos applied to the receiver account.

#### Defined in

[types/block.ts:401](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L401)

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

[types/block.ts:356](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L356)

___

### roundNumber

• **roundNumber**: `number`

The round number of the block the transaction is within.

#### Defined in

[types/block.ts:378](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L378)

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

[types/block.ts:344](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L344)

___

### roundTimestamp

• **roundTimestamp**: `number`

The round unix timestamp of the block the transaction is within.

#### Defined in

[types/block.ts:380](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L380)

___

### senderRewards

• `Optional` **senderRewards**: `number`

Rewards in microalgos applied to the sender account.

#### Defined in

[types/block.ts:399](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L399)

___

### transaction

• **transaction**: `Transaction`

The transaction as an algosdk `Transaction` object.

#### Defined in

[types/block.ts:385](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L385)
