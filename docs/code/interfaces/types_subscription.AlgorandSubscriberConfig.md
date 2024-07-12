[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / AlgorandSubscriberConfig

# Interface: AlgorandSubscriberConfig

[types/subscription](../modules/types_subscription.md).AlgorandSubscriberConfig

Configuration for an `AlgorandSubscriber`.

## Hierarchy

- [`CoreTransactionSubscriptionParams`](types_subscription.CoreTransactionSubscriptionParams.md)

  ↳ **`AlgorandSubscriberConfig`**

## Table of contents

### Properties

- [arc28Events](types_subscription.AlgorandSubscriberConfig.md#arc28events)
- [filters](types_subscription.AlgorandSubscriberConfig.md#filters)
- [frequencyInSeconds](types_subscription.AlgorandSubscriberConfig.md#frequencyinseconds)
- [maxIndexerRoundsToSync](types_subscription.AlgorandSubscriberConfig.md#maxindexerroundstosync)
- [maxRoundsToSync](types_subscription.AlgorandSubscriberConfig.md#maxroundstosync)
- [syncBehaviour](types_subscription.AlgorandSubscriberConfig.md#syncbehaviour)
- [waitForBlockWhenAtTip](types_subscription.AlgorandSubscriberConfig.md#waitforblockwhenattip)
- [watermarkPersistence](types_subscription.AlgorandSubscriberConfig.md#watermarkpersistence)

## Properties

### arc28Events

• `Optional` **arc28Events**: [`Arc28EventGroup`](types_arc_28.Arc28EventGroup.md)[]

Any ARC-28 event definitions to process from app call logs

#### Inherited from

[CoreTransactionSubscriptionParams](types_subscription.CoreTransactionSubscriptionParams.md).[arc28Events](types_subscription.CoreTransactionSubscriptionParams.md#arc28events)

#### Defined in

[types/subscription.ts:235](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L235)

___

### filters

• **filters**: [`SubscriberConfigFilter`](types_subscription.SubscriberConfigFilter.md)\<`unknown`\>[]

The set of filters to subscribe to / emit events for, along with optional data mappers.

#### Overrides

[CoreTransactionSubscriptionParams](types_subscription.CoreTransactionSubscriptionParams.md).[filters](types_subscription.CoreTransactionSubscriptionParams.md#filters)

#### Defined in

[types/subscription.ts:363](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L363)

___

### frequencyInSeconds

• `Optional` **frequencyInSeconds**: `number`

The frequency to poll for new blocks in seconds; defaults to 1s

#### Defined in

[types/subscription.ts:365](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L365)

___

### maxIndexerRoundsToSync

• `Optional` **maxIndexerRoundsToSync**: `number`

The maximum number of rounds to sync from indexer when using `syncBehaviour: 'catchup-with-indexer'.

By default there is no limit and it will paginate through all of the rounds.
Sometimes this can result in an incredibly long catchup time that may break the service
due to execution and memory constraints, particularly for filters that result in a large number of transactions.

Instead, this allows indexer catchup to be split into multiple polls, each with a transactionally consistent
boundary based on the number of rounds specified here.

#### Inherited from

[CoreTransactionSubscriptionParams](types_subscription.CoreTransactionSubscriptionParams.md).[maxIndexerRoundsToSync](types_subscription.CoreTransactionSubscriptionParams.md#maxindexerroundstosync)

#### Defined in

[types/subscription.ts:255](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L255)

___

### maxRoundsToSync

• `Optional` **maxRoundsToSync**: `number`

The maximum number of rounds to sync from algod for each subscription pull/poll.

Defaults to 500.

This gives you control over how many rounds you wait for at a time,
your staleness tolerance when using `skip-sync-newest` or `fail`, and
your catchup speed when using `sync-oldest`.

#### Inherited from

[CoreTransactionSubscriptionParams](types_subscription.CoreTransactionSubscriptionParams.md).[maxRoundsToSync](types_subscription.CoreTransactionSubscriptionParams.md#maxroundstosync)

#### Defined in

[types/subscription.ts:244](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L244)

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

#### Inherited from

[CoreTransactionSubscriptionParams](types_subscription.CoreTransactionSubscriptionParams.md).[syncBehaviour](types_subscription.CoreTransactionSubscriptionParams.md#syncbehaviour)

#### Defined in

[types/subscription.ts:273](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L273)

___

### waitForBlockWhenAtTip

• `Optional` **waitForBlockWhenAtTip**: `boolean`

Whether to wait via algod `/status/wait-for-block-after` endpoint when at the tip of the chain; reduces latency of subscription

#### Defined in

[types/subscription.ts:367](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L367)

___

### watermarkPersistence

• **watermarkPersistence**: `Object`

Methods to retrieve and persist the current watermark so syncing is resilient and maintains
its position in the chain

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `get` | () => `Promise`\<`number`\> | - |
| `set` | (`newWatermark`: `number`) => `Promise`\<`void`\> | - |

#### Defined in

[types/subscription.ts:370](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L370)
