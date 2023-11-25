[@algorandfoundation/algokit-subscriber](../README.md) / [index](../modules/index.md) / AlgorandSubscriber

# Class: AlgorandSubscriber

[index](../modules/index.md).AlgorandSubscriber

Handles the logic for subscribing to the Algorand blockchain and emitting events.

## Table of contents

### Constructors

- [constructor](index.AlgorandSubscriber.md#constructor)

### Properties

- [abortController](index.AlgorandSubscriber.md#abortcontroller)
- [algod](index.AlgorandSubscriber.md#algod)
- [eventEmitter](index.AlgorandSubscriber.md#eventemitter)
- [indexer](index.AlgorandSubscriber.md#indexer)
- [subscription](index.AlgorandSubscriber.md#subscription)

### Methods

- [on](index.AlgorandSubscriber.md#on)
- [onBatch](index.AlgorandSubscriber.md#onbatch)
- [pollOnce](index.AlgorandSubscriber.md#pollonce)
- [start](index.AlgorandSubscriber.md#start)
- [stop](index.AlgorandSubscriber.md#stop)

## Constructors

### constructor

• **new AlgorandSubscriber**(`subscription`, `algod`, `indexer?`): [`AlgorandSubscriber`](index.AlgorandSubscriber.md)

Create a new `AlgorandSubscriber`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `subscription` | [`SubscriptionConfig`](../interfaces/types_subscription.SubscriptionConfig.md) | The subscription configuration |
| `algod` | `default` | An algod client |
| `indexer?` | `default` | An (optional) indexer client; only needed if `subscription.syncBehaviour` is `catchup-with-indexer` |

#### Returns

[`AlgorandSubscriber`](index.AlgorandSubscriber.md)

#### Defined in

[subscriber.ts:23](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L23)

## Properties

### abortController

• `Private` **abortController**: `AbortController`

#### Defined in

[subscriber.ts:14](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L14)

___

### algod

• `Private` **algod**: `default`

#### Defined in

[subscriber.ts:11](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L11)

___

### eventEmitter

• `Private` **eventEmitter**: [`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

#### Defined in

[subscriber.ts:15](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L15)

___

### indexer

• `Private` **indexer**: `undefined` \| `default`

#### Defined in

[subscriber.ts:12](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L12)

___

### subscription

• `Private` **subscription**: [`SubscriptionConfig`](../interfaces/types_subscription.SubscriptionConfig.md)

#### Defined in

[subscriber.ts:13](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L13)

## Methods

### on

▸ **on**\<`T`\>(`eventName`, `listener`): `void`

Register an event handler to run on every instance the given event name.

The listener can be async and it will be awaited if so.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `TransactionResult` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` | The name of the event to subscribe to |
| `listener` | [`TypedAsyncEventListener`](../modules/types_subscription.md#typedasynceventlistener)\<`T`\> | The listener function to invoke with the subscribed event |

#### Returns

`void`

#### Defined in

[subscriber.ts:106](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L106)

___

### onBatch

▸ **onBatch**\<`T`\>(`eventName`, `listener`): `void`

Register an event handler to run on all instances of the given event name
for each subscription poll.

This is useful when you want to efficiently process / persist events
in bulk rather than one-by-one.

The listener can be async and it will be awaited if so.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `TransactionResult` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` | The name of the event to subscribe to |
| `listener` | [`TypedAsyncEventListener`](../modules/types_subscription.md#typedasynceventlistener)\<`T`[]\> | The listener function to invoke with the subscribed events |

#### Returns

`void`

#### Defined in

[subscriber.ts:121](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L121)

___

### pollOnce

▸ **pollOnce**(): `Promise`\<`void`\>

Execute a single subscription poll.

This is useful when executing in the context of a process
triggered by a recurring schedule / cron.

#### Returns

`Promise`\<`void`\>

#### Defined in

[subscriber.ts:46](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L46)

___

### start

▸ **start**(): `void`

Start the subscriber in a loop until `stop` is called.

This is useful when running in the context of a long-running process / container.

#### Returns

`void`

#### Defined in

[subscriber.ts:81](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L81)

___

### stop

▸ **stop**(`reason`): `void`

Stops the subscriber if previously started via `start`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `reason` | `unknown` |

#### Returns

`void`

#### Defined in

[subscriber.ts:95](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/subscriber.ts#L95)
