[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / TransactionInBlock

# Interface: TransactionInBlock

[types/block](../modules/types_block.md).TransactionInBlock

The representation of all important data for a single transaction or inner transaction
and its side effects within a committed block.

## Table of contents

### Properties

- [assetCloseAmount](types_block.TransactionInBlock.md#assetcloseamount)
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
- [signedTxnWithAD](types_block.TransactionInBlock.md#signedtxnwithad)
- [transaction](types_block.TransactionInBlock.md#transaction)
- [transactionId](types_block.TransactionInBlock.md#transactionid)

## Properties

### assetCloseAmount

• `Optional` **assetCloseAmount**: `bigint`

The asset close amount if the sender asset position was closed from this transaction.

#### Defined in

[src/types/block.ts:58](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L58)

___

### closeAmount

• `Optional` **closeAmount**: `bigint`

The ALGO close amount if the sender account was closed from this transaction.

#### Defined in

[src/types/block.ts:60](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L60)

___

### closeRewards

• `Optional` **closeRewards**: `bigint`

Rewards in microalgos applied to the close remainder to account.

#### Defined in

[src/types/block.ts:64](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L64)

___

### createdAppId

• `Optional` **createdAppId**: `bigint`

The app ID if an app was created from this transaction.

#### Defined in

[src/types/block.ts:56](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L56)

___

### createdAssetId

• `Optional` **createdAssetId**: `bigint`

The asset ID if an asset was created from this transaction.

#### Defined in

[src/types/block.ts:54](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L54)

___

### genesisHash

• `Optional` **genesisHash**: `Buffer`

The binary genesis hash of the network the transaction is within.

#### Defined in

[src/types/block.ts:44](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L44)

___

### genesisId

• `Optional` **genesisId**: `string`

The string genesis ID of the network the transaction is within.

#### Defined in

[src/types/block.ts:46](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L46)

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

[src/types/block.ts:30](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L30)

___

### logs

• `Optional` **logs**: `Uint8Array`[]

Any logs that were issued as a result of this transaction.

#### Defined in

[src/types/block.ts:62](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L62)

___

### parentTransactionId

• `Optional` **parentTransactionId**: `string`

The ID of the parent transaction if this is an inner transaction.

#### Defined in

[src/types/block.ts:42](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L42)

___

### receiverRewards

• `Optional` **receiverRewards**: `bigint`

Rewards in microalgos applied to the receiver account.

#### Defined in

[src/types/block.ts:68](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L68)

___

### rootIntraRoundOffset

• `Optional` **rootIntraRoundOffset**: `number`

The intra-round offset of the root transaction if this is an inner transaction.

#### Defined in

[src/types/block.ts:38](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L38)

___

### rootTransactionId

• `Optional` **rootTransactionId**: `string`

The ID of the root transaction if this is an inner transaction.

#### Defined in

[src/types/block.ts:34](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L34)

___

### roundNumber

• **roundNumber**: `bigint`

The round number of the block the transaction is within.

#### Defined in

[src/types/block.ts:48](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L48)

___

### roundTimestamp

• **roundTimestamp**: `bigint`

The round unix timestamp of the block the transaction is within.

#### Defined in

[src/types/block.ts:50](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L50)

___

### senderRewards

• `Optional` **senderRewards**: `bigint`

Rewards in microalgos applied to the sender account.

#### Defined in

[src/types/block.ts:66](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L66)

___

### signedTxnWithAD

• **signedTxnWithAD**: `SignedTxnWithAD`

The signed transaction with apply data from the block

#### Defined in

[src/types/block.ts:10](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L10)

___

### transaction

• **transaction**: `Transaction`

The transaction as an algosdk `Transaction` object.

#### Defined in

[src/types/block.ts:52](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L52)

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

[src/types/block.ts:19](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L19)
