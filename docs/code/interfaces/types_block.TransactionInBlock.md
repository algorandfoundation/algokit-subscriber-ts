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

[types/block.ts:398](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L398)

___

### blockTransaction

• **blockTransaction**: [`BlockTransaction`](types_block.BlockTransaction.md) \| [`BlockInnerTransaction`](../modules/types_block.md#blockinnertransaction)

The block data for the transaction

#### Defined in

[types/block.ts:340](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L340)

___

### closeAmount

• `Optional` **closeAmount**: `number`

The ALGO close amount if the sender account was closed from this transaction.

#### Defined in

[types/block.ts:400](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L400)

___

### closeRewards

• `Optional` **closeRewards**: `number`

Rewards in microalgos applied to the close remainder to account.

#### Defined in

[types/block.ts:404](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L404)

___

### createdAppId

• `Optional` **createdAppId**: `number`

The app ID if an app was created from this transaction.

#### Defined in

[types/block.ts:396](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L396)

___

### createdAssetId

• `Optional` **createdAssetId**: `number`

The asset ID if an asset was created from this transaction.

#### Defined in

[types/block.ts:394](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L394)

___

### genesisHash

• **genesisHash**: `Buffer`

The binary genesis hash of the network the transaction is within.

#### Defined in

[types/block.ts:381](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L381)

___

### genesisId

• **genesisId**: `string`

The string genesis ID of the network the transaction is within.

#### Defined in

[types/block.ts:383](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L383)

___

### logs

• `Optional` **logs**: `Uint8Array`[]

Any logs that were issued as a result of this transaction.

#### Defined in

[types/block.ts:402](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L402)

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

[types/block.ts:379](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L379)

___

### parentTransactionId

• `Optional` **parentTransactionId**: `string`

The ID of the parent transaction if this is an inner transaction.

#### Defined in

[types/block.ts:367](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L367)

___

### receiverRewards

• `Optional` **receiverRewards**: `number`

Rewards in microalgos applied to the receiver account.

#### Defined in

[types/block.ts:408](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L408)

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

[types/block.ts:363](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L363)

___

### roundNumber

• **roundNumber**: `number`

The round number of the block the transaction is within.

#### Defined in

[types/block.ts:385](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L385)

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

[types/block.ts:351](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L351)

___

### roundTimestamp

• **roundTimestamp**: `number`

The round unix timestamp of the block the transaction is within.

#### Defined in

[types/block.ts:387](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L387)

___

### senderRewards

• `Optional` **senderRewards**: `number`

Rewards in microalgos applied to the sender account.

#### Defined in

[types/block.ts:406](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L406)

___

### transaction

• **transaction**: `Transaction`

The transaction as an algosdk `Transaction` object.

#### Defined in

[types/block.ts:392](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L392)
