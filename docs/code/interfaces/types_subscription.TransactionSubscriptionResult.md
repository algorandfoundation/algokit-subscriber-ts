[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / TransactionSubscriptionResult

# Interface: TransactionSubscriptionResult

[types/subscription](../modules/types_subscription.md).TransactionSubscriptionResult

The result of a single subscription pull/poll.

## Table of contents

### Properties

- [blockMetadata](types_subscription.TransactionSubscriptionResult.md#blockmetadata)
- [currentRound](types_subscription.TransactionSubscriptionResult.md#currentround)
- [newWatermark](types_subscription.TransactionSubscriptionResult.md#newwatermark)
- [startingWatermark](types_subscription.TransactionSubscriptionResult.md#startingwatermark)
- [subscribedTransactions](types_subscription.TransactionSubscriptionResult.md#subscribedtransactions)
- [syncedRoundRange](types_subscription.TransactionSubscriptionResult.md#syncedroundrange)

## Properties

### blockMetadata

• `Optional` **blockMetadata**: [`BlockMetadata`](types_subscription.BlockMetadata.md)[]

The metadata about any blocks that were retrieved from algod as part
of the subscription poll.

#### Defined in

[types/subscription.ts:29](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L29)

___

### currentRound

• **currentRound**: `number`

The current detected tip of the configured Algorand blockchain.

#### Defined in

[types/subscription.ts:11](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L11)

___

### newWatermark

• **newWatermark**: `number`

The new watermark value to persist for the next call to
`getSubscribedTransactions` to continue the sync.
Will be equal to `syncedRoundRange[1]`. Only persist this
after processing (or in the same atomic transaction as)
subscribed transactions to keep it reliable.

#### Defined in

[types/subscription.ts:19](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L19)

___

### startingWatermark

• **startingWatermark**: `number`

The watermark value that was retrieved at the start of the subscription poll.

#### Defined in

[types/subscription.ts:13](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L13)

___

### subscribedTransactions

• **subscribedTransactions**: [`SubscribedTransaction`](../modules/types_subscription.md#subscribedtransaction)[]

Any transactions that matched the given filter within
the synced round range. This substantively uses the [indexer transaction
format](https://developer.algorand.org/docs/rest-apis/indexer/#transaction)
to represent the data with some additional fields.

#### Defined in

[types/subscription.ts:25](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L25)

___

### syncedRoundRange

• **syncedRoundRange**: [startRound: number, endRound: number]

The round range that was synced from/to

#### Defined in

[types/subscription.ts:9](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L9)
