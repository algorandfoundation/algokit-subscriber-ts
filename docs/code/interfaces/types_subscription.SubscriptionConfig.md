[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / SubscriptionConfig

# Interface: SubscriptionConfig

[types/subscription](../modules/types_subscription.md).SubscriptionConfig

Configuration for a subscription

## Table of contents

### Properties

- [events](types_subscription.SubscriptionConfig.md#events)
- [frequencyInSeconds](types_subscription.SubscriptionConfig.md#frequencyinseconds)
- [maxRoundsToSync](types_subscription.SubscriptionConfig.md#maxroundstosync)
- [syncBehaviour](types_subscription.SubscriptionConfig.md#syncbehaviour)
- [waitForBlockWhenAtTip](types_subscription.SubscriptionConfig.md#waitforblockwhenattip)
- [watermarkPersistence](types_subscription.SubscriptionConfig.md#watermarkpersistence)

## Properties

### events

• **events**: [`SubscriptionConfigEvent`](types_subscription.SubscriptionConfigEvent.md)\<`unknown`\>[]

The set of events to subscribe to / emit

#### Defined in

[types/subscription.ts:108](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L108)

___

### frequencyInSeconds

• `Optional` **frequencyInSeconds**: `number`

The frequency to poll for new blocks in seconds; defaults to 1s

#### Defined in

[types/subscription.ts:102](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L102)

___

### maxRoundsToSync

• `Optional` **maxRoundsToSync**: `number`

The maximum number of rounds to sync at a time; defaults to 500

#### Defined in

[types/subscription.ts:106](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L106)

___

### syncBehaviour

• **syncBehaviour**: ``"skip-sync-newest"`` \| ``"sync-oldest"`` \| ``"sync-oldest-start-now"`` \| ``"catchup-with-indexer"``

The behaviour when the number of rounds to sync is greater than `maxRoundsToSync`:
 * `skip-sync-newest`: Discard old rounds.
 * `sync-oldest`: Sync from the oldest records up to `maxRoundsToSync` rounds.

   **Note:** will be slow to catch up if sync is significantly behind the tip of the chain
 * `sync-oldest-start-now`: Sync from the oldest records up to `maxRoundsToSync` rounds, unless
   current watermark is `0` in which case it will start `maxRoundsToSync` back from the tip of the chain.
 * `catchup-with-indexer`: Will catch up to `tipOfTheChain - maxRoundsToSync` using indexer (fast) and then
   continue with algod.

#### Defined in

[types/subscription.ts:119](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L119)

___

### waitForBlockWhenAtTip

• `Optional` **waitForBlockWhenAtTip**: `boolean`

Whether to wait via algod `/status/wait-for-block-after` endpoint when at the tip of the chain; reduces latency of subscription

#### Defined in

[types/subscription.ts:104](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L104)

___

### watermarkPersistence

• **watermarkPersistence**: `Object`

Methods to retrieve and persist the current watermark so syncing is resilient and maintains
its position in the chain

#### Type declaration

| Name | Type |
| :------ | :------ |
| `get` | () => `Promise`\<`number`\> |
| `set` | (`newWatermark`: `number`) => `Promise`\<`void`\> |

#### Defined in

[types/subscription.ts:122](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L122)
