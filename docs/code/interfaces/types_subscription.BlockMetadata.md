[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / BlockMetadata

# Interface: BlockMetadata

[types/subscription](../modules/types_subscription.md).BlockMetadata

Metadata about a block that was retrieved from algod.

## Table of contents

### Properties

- [fullTransactionCount](types_subscription.BlockMetadata.md#fulltransactioncount)
- [genesisHash](types_subscription.BlockMetadata.md#genesishash)
- [genesisId](types_subscription.BlockMetadata.md#genesisid)
- [hash](types_subscription.BlockMetadata.md#hash)
- [parentTransactionCount](types_subscription.BlockMetadata.md#parenttransactioncount)
- [previousBlockHash](types_subscription.BlockMetadata.md#previousblockhash)
- [rewards](types_subscription.BlockMetadata.md#rewards)
- [round](types_subscription.BlockMetadata.md#round)
- [seed](types_subscription.BlockMetadata.md#seed)
- [timestamp](types_subscription.BlockMetadata.md#timestamp)
- [transactionCounter](types_subscription.BlockMetadata.md#transactioncounter)
- [transactionsRoot](types_subscription.BlockMetadata.md#transactionsroot)
- [transactionsRootSha256](types_subscription.BlockMetadata.md#transactionsrootsha256)
- [upgradeState](types_subscription.BlockMetadata.md#upgradestate)

## Properties

### fullTransactionCount

• **fullTransactionCount**: `number`

Full count of transactions and inner transactions (recursively) in this block.

#### Defined in

[types/subscription.ts:52](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L52)

___

### genesisHash

• **genesisHash**: `string`

The base64 genesis hash of the chain.

#### Defined in

[types/subscription.ts:42](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L42)

___

### genesisId

• **genesisId**: `string`

The genesis ID of the chain.

#### Defined in

[types/subscription.ts:40](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L40)

___

### hash

• `Optional` **hash**: `string`

#### Defined in

[types/subscription.ts:34](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L34)

___

### parentTransactionCount

• **parentTransactionCount**: `number`

Count of parent transactions in this block

#### Defined in

[types/subscription.ts:50](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L50)

___

### previousBlockHash

• `Optional` **previousBlockHash**: `string`

The previous block hash.

#### Defined in

[types/subscription.ts:44](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L44)

___

### rewards

• `Optional` **rewards**: [`BlockRewards`](types_subscription.BlockRewards.md)

#### Defined in

[types/subscription.ts:48](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L48)

___

### round

• **round**: `number`

The round of the block.

#### Defined in

[types/subscription.ts:36](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L36)

___

### seed

• `Optional` **seed**: `string`

The base64 seed of the block.

#### Defined in

[types/subscription.ts:46](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L46)

___

### timestamp

• **timestamp**: `string`

The ISO 8601 timestamp of the block.

#### Defined in

[types/subscription.ts:38](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L38)

___

### transactionCounter

• **transactionCounter**: `number`

number of the next transaction that will be committed after this block.  It is 0 when no transactions have ever been committed (since TxnCounter started being supported).

#### Defined in

[types/subscription.ts:54](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L54)

___

### transactionsRoot

• **transactionsRoot**: `string`

TransactionsRoot authenticates the set of transactions appearing in the block. More specifically, it's the root of a merkle tree whose leaves are the block's Txids, in lexicographic order. For the empty block, it's 0. Note that the TxnRoot does not authenticate the signatures on the transactions, only the transactions themselves. Two blocks with the same transactions but in a different order and with different signatures will have the same TxnRoot.
Pattern : "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==\|[A-Za-z0-9+/]{3}=)?$"

#### Defined in

[types/subscription.ts:57](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L57)

___

### transactionsRootSha256

• **transactionsRootSha256**: `string`

TransactionsRootSHA256 is an auxiliary TransactionRoot, built using a vector commitment instead of a merkle tree, and SHA256 hash function instead of the default SHA512_256. This commitment can be used on environments where only the SHA256 function exists.

#### Defined in

[types/subscription.ts:59](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L59)

___

### upgradeState

• `Optional` **upgradeState**: [`BlockUpgradeState`](types_subscription.BlockUpgradeState.md)

#### Defined in

[types/subscription.ts:61](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L61)
