[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / SubscriptionConfig

# Interface: SubscriptionConfig

[types/subscription](../modules/types_subscription.md).SubscriptionConfig

Configuration for a subscription

## Table of contents

### Properties

- [arc28Events](types_subscription.SubscriptionConfig.md#arc28events)
- [filters](types_subscription.SubscriptionConfig.md#filters)
- [frequencyInSeconds](types_subscription.SubscriptionConfig.md#frequencyinseconds)
- [maxRoundsToSync](types_subscription.SubscriptionConfig.md#maxroundstosync)
- [syncBehaviour](types_subscription.SubscriptionConfig.md#syncbehaviour)
- [waitForBlockWhenAtTip](types_subscription.SubscriptionConfig.md#waitforblockwhenattip)
- [watermarkPersistence](types_subscription.SubscriptionConfig.md#watermarkpersistence)

## Properties

### arc28Events

• `Optional` **arc28Events**: [`Arc28EventGroup`](types_subscription.Arc28EventGroup.md)[]

Any ARC-28 event definitions to process from app call logs

#### Defined in

[types/subscription.ts:219](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L219)

___

### filters

• **filters**: [`SubscriberConfigFilter`](types_subscription.SubscriberConfigFilter.md)\<`unknown`\>[]

The set of filters to subscribe to / emit events for

#### Defined in

[types/subscription.ts:221](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L221)

___

### frequencyInSeconds

• `Optional` **frequencyInSeconds**: `number`

The frequency to poll for new blocks in seconds; defaults to 1s

#### Defined in

[types/subscription.ts:213](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L213)

___

### maxRoundsToSync

• `Optional` **maxRoundsToSync**: `number`

The maximum number of rounds to sync at a time; defaults to 500

#### Defined in

[types/subscription.ts:217](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L217)

___

### syncBehaviour

• **syncBehaviour**: ``"skip-sync-newest"`` \| ``"sync-oldest"`` \| ``"sync-oldest-start-now"`` \| ``"catchup-with-indexer"`` \| ``"fail"``

The behaviour when the number of rounds to sync is greater than `maxRoundsToSync`:
 * `skip-sync-newest`: Discard old rounds.
 * `sync-oldest`: Sync from the oldest records up to `maxRoundsToSync` rounds.

   **Note:** will be slow to catch up if sync is significantly behind the tip of the chain
 * `sync-oldest-start-now`: Sync from the oldest records up to `maxRoundsToSync` rounds, unless
   current watermark is `0` in which case it will start `maxRoundsToSync` back from the tip of the chain.
 * `catchup-with-indexer`: Will catch up to `tipOfTheChain - maxRoundsToSync` using indexer (fast) and then
   continue with algod.
 * `fail`: Throw an error.

#### Defined in

[types/subscription.ts:233](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L233)

___

### waitForBlockWhenAtTip

• `Optional` **waitForBlockWhenAtTip**: `boolean`

Whether to wait via algod `/status/wait-for-block-after` endpoint when at the tip of the chain; reduces latency of subscription

#### Defined in

[types/subscription.ts:215](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L215)

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

[types/subscription.ts:236](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L236)
