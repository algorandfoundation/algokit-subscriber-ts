[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / TransactionSubscriptionResult

# Interface: TransactionSubscriptionResult

[types/subscription](../modules/types_subscription.md).TransactionSubscriptionResult

The result of a single subscription pull/poll.

## Table of contents

### Properties

- [currentRound](types_subscription.TransactionSubscriptionResult.md#currentround)
- [newWatermark](types_subscription.TransactionSubscriptionResult.md#newwatermark)
- [subscribedTransactions](types_subscription.TransactionSubscriptionResult.md#subscribedtransactions)
- [syncedRoundRange](types_subscription.TransactionSubscriptionResult.md#syncedroundrange)

## Properties

### currentRound

• **currentRound**: `number`

The current detected tip of the configured Algorand blockchain.

#### Defined in

[types/subscription.ts:84](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L84)

___

### newWatermark

• **newWatermark**: `number`

The new watermark value to persist for the next call to
`getSubscribedTransactions` to continue the sync.
Will be equal to `syncedRoundRange[1]`. Only persist this
after processing (or in the same atomic transaction as)
subscribed transactions to keep it reliable.

#### Defined in

[types/subscription.ts:90](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L90)

___

### subscribedTransactions

• **subscribedTransactions**: `TransactionResult`[]

Any transactions that matched the given filter within
the synced round range. This uses the [indexer transaction
format](https://developer.algorand.org/docs/rest-apis/indexer/#transaction)
to represent the data.

#### Defined in

[types/subscription.ts:96](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L96)

___

### syncedRoundRange

• **syncedRoundRange**: [startRound: number, endRound: number]

The round range that was synced from/to

#### Defined in

[types/subscription.ts:82](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L82)
