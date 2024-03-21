[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / TransactionSubscriptionParams

# Interface: TransactionSubscriptionParams

[types/subscription](../modules/types_subscription.md).TransactionSubscriptionParams

Parameters to control a single subscription pull/poll.

## Table of contents

### Properties

- [arc28Events](types_subscription.TransactionSubscriptionParams.md#arc28events)
- [filters](types_subscription.TransactionSubscriptionParams.md#filters)
- [maxRoundsToSync](types_subscription.TransactionSubscriptionParams.md#maxroundstosync)
- [syncBehaviour](types_subscription.TransactionSubscriptionParams.md#syncbehaviour)
- [watermark](types_subscription.TransactionSubscriptionParams.md#watermark)

## Properties

### arc28Events

• `Optional` **arc28Events**: [`Arc28EventGroup`](types_subscription.Arc28EventGroup.md)[]

Any ARC-28 event definitions to process from app call logs

#### Defined in

[types/subscription.ts:104](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L104)

___

### filters

• **filters**: [`NamedTransactionFilter`](types_subscription.NamedTransactionFilter.md)[]

The filter(s) to apply to find transactions of interest.
A list of filters with corresponding names.

**`Example`**

```typescript
 filter: [{
  name: 'asset-transfers',
  filter: {
    type: TransactionType.axfer,
    //...
  }
 }, {
  name: 'payments',
  filter: {
    type: TransactionType.pay,
    //...
  }
 }]
```

#### Defined in

[types/subscription.ts:102](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L102)

___

### maxRoundsToSync

• **maxRoundsToSync**: `number`

The maximum number of rounds to sync for each subscription pull/poll.

This gives you control over how many rounds you wait for at a time,
your staleness tolerance when using `skip-sync-newest` or `fail`, and
your catchup speed when using `sync-oldest`.

#### Defined in

[types/subscription.ts:122](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L122)

___

### syncBehaviour

• **syncBehaviour**: ``"skip-sync-newest"`` \| ``"sync-oldest"`` \| ``"sync-oldest-start-now"`` \| ``"catchup-with-indexer"`` \| ``"fail"``

If the current tip of the configured Algorand blockchain is more than `maxRoundsToSync`
past `watermark` then how should that be handled:
 * `skip-sync-newest`: Discard old blocks/transactions and sync the newest; useful
   for real-time notification scenarios where you don't care about history and
   are happy to lose old transactions.
 * `sync-oldest`: Sync from the oldest rounds forward `maxRoundsToSync` rounds
   using algod; note: this will be slow if you are starting from 0 and requires
   an archival node.
 * `sync-oldest-start-now`: Same as `sync-oldest`, but if the `watermark` is `0`
   then start at the current round i.e. don't sync historical records, but once
   subscribing starts sync everything; note: if it falls behind it requires an
   archival node.
 * `catchup-with-indexer`: Sync to round `currentRound - maxRoundsToSync + 1`
   using indexer (much faster than using algod for long time periods) and then
   use algod from there.
 * `fail`: Throw an error.

#### Defined in

[types/subscription.ts:140](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L140)

___

### watermark

• **watermark**: `number`

The current round watermark that transactions have previously been synced to.

Persist this value as you process transactions processed from this method
to allow for resilient and incremental syncing.

Syncing will start from `watermark + 1`.

Start from 0 if you want to start from the beginning of time, noting that
will be slow if `onMaxRounds` is `sync-oldest`.

#### Defined in

[types/subscription.ts:115](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L115)
