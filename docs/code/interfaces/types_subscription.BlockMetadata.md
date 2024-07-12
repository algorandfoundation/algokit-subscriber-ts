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
- [participationUpdates](types_subscription.BlockMetadata.md#participationupdates)
- [previousBlockHash](types_subscription.BlockMetadata.md#previousblockhash)
- [rewards](types_subscription.BlockMetadata.md#rewards)
- [round](types_subscription.BlockMetadata.md#round)
- [seed](types_subscription.BlockMetadata.md#seed)
- [stateProofTracking](types_subscription.BlockMetadata.md#stateprooftracking)
- [timestamp](types_subscription.BlockMetadata.md#timestamp)
- [transactionsRoot](types_subscription.BlockMetadata.md#transactionsroot)
- [transactionsRootSha256](types_subscription.BlockMetadata.md#transactionsrootsha256)
- [txnCounter](types_subscription.BlockMetadata.md#txncounter)
- [upgradeState](types_subscription.BlockMetadata.md#upgradestate)
- [upgradeVote](types_subscription.BlockMetadata.md#upgradevote)

## Properties

### fullTransactionCount

• **fullTransactionCount**: `number`

Full count of transactions and inner transactions (recursively) in this block.

#### Defined in

[types/subscription.ts:53](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L53)

___

### genesisHash

• **genesisHash**: `string`

The base64 genesis hash of the chain.

#### Defined in

[types/subscription.ts:43](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L43)

___

### genesisId

• **genesisId**: `string`

The genesis ID of the chain.

#### Defined in

[types/subscription.ts:41](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L41)

___

### hash

• `Optional` **hash**: `string`

The base64 block hash.

#### Defined in

[types/subscription.ts:35](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L35)

___

### parentTransactionCount

• **parentTransactionCount**: `number`

Count of parent transactions in this block

#### Defined in

[types/subscription.ts:51](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L51)

___

### participationUpdates

• `Optional` **participationUpdates**: [`ParticipationUpdates`](types_subscription.ParticipationUpdates.md)

Participation account data that needs to be checked/acted on by the network.

#### Defined in

[types/subscription.ts:68](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L68)

___

### previousBlockHash

• `Optional` **previousBlockHash**: `string`

The base64 previous block hash.

#### Defined in

[types/subscription.ts:45](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L45)

___

### rewards

• `Optional` **rewards**: [`BlockRewards`](types_subscription.BlockRewards.md)

Fields relating to rewards

#### Defined in

[types/subscription.ts:49](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L49)

___

### round

• **round**: `number`

The round of the block.

#### Defined in

[types/subscription.ts:37](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L37)

___

### seed

• **seed**: `string`

The base64 seed of the block.

#### Defined in

[types/subscription.ts:47](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L47)

___

### stateProofTracking

• `Optional` **stateProofTracking**: [`BlockStateProofTracking`](types_subscription.BlockStateProofTracking.md)[]

Tracks the status of state proofs.

#### Defined in

[types/subscription.ts:64](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L64)

___

### timestamp

• **timestamp**: `number`

Block creation timestamp in seconds since epoch

#### Defined in

[types/subscription.ts:39](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L39)

___

### transactionsRoot

• **transactionsRoot**: `string`

TransactionsRoot authenticates the set of transactions appearing in the block. More specifically, it's the root of a merkle tree whose leaves are the block's Txids, in lexicographic order. For the empty block, it's 0. Note that the TxnRoot does not authenticate the signatures on the transactions, only the transactions themselves. Two blocks with the same transactions but in a different order and with different signatures will have the same TxnRoot.
Pattern : "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==\|[A-Za-z0-9+/]{3}=)?$"

#### Defined in

[types/subscription.ts:58](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L58)

___

### transactionsRootSha256

• **transactionsRootSha256**: `string`

TransactionsRootSHA256 is an auxiliary TransactionRoot, built using a vector commitment instead of a merkle tree, and SHA256 hash function instead of the default SHA512_256. This commitment can be used on environments where only the SHA256 function exists.

#### Defined in

[types/subscription.ts:60](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L60)

___

### txnCounter

• **txnCounter**: `number`

Number of the next transaction that will be committed after this block.  It is 0 when no transactions have ever been committed (since TxnCounter started being supported).

#### Defined in

[types/subscription.ts:55](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L55)

___

### upgradeState

• `Optional` **upgradeState**: [`BlockUpgradeState`](types_subscription.BlockUpgradeState.md)

Fields relating to a protocol upgrade.

#### Defined in

[types/subscription.ts:62](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L62)

___

### upgradeVote

• `Optional` **upgradeVote**: [`BlockUpgradeVote`](types_subscription.BlockUpgradeVote.md)

Fields relating to voting for a protocol upgrade.

#### Defined in

[types/subscription.ts:66](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L66)
