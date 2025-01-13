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
- [intraRoundOffset](types_block.TransactionInBlock.md#intraroundoffset)
- [logs](types_block.TransactionInBlock.md#logs)
- [parentTransactionId](types_block.TransactionInBlock.md#parenttransactionid)
- [receiverRewards](types_block.TransactionInBlock.md#receiverrewards)
- [rootIntraRoundOffset](types_block.TransactionInBlock.md#rootintraroundoffset)
- [rootTransactionId](types_block.TransactionInBlock.md#roottransactionid)
- [roundNumber](types_block.TransactionInBlock.md#roundnumber)
- [roundTimestamp](types_block.TransactionInBlock.md#roundtimestamp)
- [senderRewards](types_block.TransactionInBlock.md#senderrewards)
- [transaction](types_block.TransactionInBlock.md#transaction)
- [transactionId](types_block.TransactionInBlock.md#transactionid)

## Properties

### assetCloseAmount

• `Optional` **assetCloseAmount**: `bigint`

The asset close amount if the sender asset position was closed from this transaction.

#### Defined in

[src/types/block.ts:385](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L385)

___

### blockTransaction

• **blockTransaction**: [`BlockTransaction`](types_block.BlockTransaction.md) \| [`BlockInnerTransaction`](../modules/types_block.md#blockinnertransaction)

The block data for the transaction

#### Defined in

[src/types/block.ts:336](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L336)

___

### closeAmount

• `Optional` **closeAmount**: `bigint`

The ALGO close amount if the sender account was closed from this transaction.

#### Defined in

[src/types/block.ts:387](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L387)

___

### closeRewards

• `Optional` **closeRewards**: `bigint`

Rewards in microalgos applied to the close remainder to account.

#### Defined in

[src/types/block.ts:391](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L391)

___

### createdAppId

• `Optional` **createdAppId**: `bigint`

The app ID if an app was created from this transaction.

#### Defined in

[src/types/block.ts:383](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L383)

___

### createdAssetId

• `Optional` **createdAssetId**: `bigint`

The asset ID if an asset was created from this transaction.

#### Defined in

[src/types/block.ts:381](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L381)

___

### genesisHash

• **genesisHash**: `Buffer`

The binary genesis hash of the network the transaction is within.

#### Defined in

[src/types/block.ts:368](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L368)

___

### genesisId

• **genesisId**: `string`

The string genesis ID of the network the transaction is within.

#### Defined in

[src/types/block.ts:370](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L370)

___

### intraRoundOffset

• **intraRoundOffset**: `number`

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

[src/types/block.ts:354](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L354)

___

### logs

• `Optional` **logs**: `Uint8Array`[]

Any logs that were issued as a result of this transaction.

#### Defined in

[src/types/block.ts:389](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L389)

___

### parentTransactionId

• `Optional` **parentTransactionId**: `string`

The ID of the parent transaction if this is an inner transaction.

#### Defined in

[src/types/block.ts:366](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L366)

___

### receiverRewards

• `Optional` **receiverRewards**: `bigint`

Rewards in microalgos applied to the receiver account.

#### Defined in

[src/types/block.ts:395](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L395)

___

### rootIntraRoundOffset

• `Optional` **rootIntraRoundOffset**: `number`

The intra-round offset of the root transaction if this is an inner transaction.

#### Defined in

[src/types/block.ts:362](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L362)

___

### rootTransactionId

• `Optional` **rootTransactionId**: `string`

The ID of the root transaction if this is an inner transaction.

#### Defined in

[src/types/block.ts:358](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L358)

___

### roundNumber

• **roundNumber**: `bigint`

The round number of the block the transaction is within.

#### Defined in

[src/types/block.ts:372](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L372)

___

### roundTimestamp

• **roundTimestamp**: `bigint`

The round unix timestamp of the block the transaction is within.

#### Defined in

[src/types/block.ts:374](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L374)

___

### senderRewards

• `Optional` **senderRewards**: `bigint`

Rewards in microalgos applied to the sender account.

#### Defined in

[src/types/block.ts:393](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L393)

___

### transaction

• **transaction**: `Transaction`

The transaction as an algosdk `Transaction` object.

#### Defined in

[src/types/block.ts:379](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L379)

___

### transactionId

• **transactionId**: `string`

The transaction ID

**`Example`**

```ts
- W6IG6SETWKISJV4JQSS6GNZGWKYXOOLH7FT3NQM4BIFRLCOXOQHA if it's a root transaction
 - W6IG6SETWKISJV4JQSS6GNZGWKYXOOLH7FT3NQM4BIFRLCOXOQHA/inner/1 if it's an inner transaction
```

#### Defined in

[src/types/block.ts:343](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L343)
