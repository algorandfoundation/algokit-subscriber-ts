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
- [round](types_subscription.BlockMetadata.md#round)
- [seed](types_subscription.BlockMetadata.md#seed)
- [timestamp](types_subscription.BlockMetadata.md#timestamp)

## Properties

### fullTransactionCount

• **fullTransactionCount**: `number`

Full count of transactions and inner transactions (recursively) in this block.

#### Defined in

[types/subscription.ts:48](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L48)

___

### genesisHash

• **genesisHash**: `string`

The base64 genesis hash of the chain.

#### Defined in

[types/subscription.ts:40](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L40)

___

### genesisId

• **genesisId**: `string`

The genesis ID of the chain.

#### Defined in

[types/subscription.ts:38](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L38)

___

### hash

• `Optional` **hash**: `string`

#### Defined in

[types/subscription.ts:32](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L32)

___

### parentTransactionCount

• **parentTransactionCount**: `number`

Count of parent transactions in this block

#### Defined in

[types/subscription.ts:46](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L46)

___

### previousBlockHash

• `Optional` **previousBlockHash**: `string`

The previous block hash.

#### Defined in

[types/subscription.ts:42](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L42)

___

### round

• **round**: `number`

The round of the block.

#### Defined in

[types/subscription.ts:34](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L34)

___

### seed

• `Optional` **seed**: `string`

The base64 seed of the block.

#### Defined in

[types/subscription.ts:44](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L44)

___

### timestamp

• **timestamp**: `string`

The ISO 8601 timestamp of the block.

#### Defined in

[types/subscription.ts:36](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L36)
