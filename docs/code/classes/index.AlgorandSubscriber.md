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
- [config](index.AlgorandSubscriber.md#config)
- [eventEmitter](index.AlgorandSubscriber.md#eventemitter)
- [filterNames](index.AlgorandSubscriber.md#filternames)
- [indexer](index.AlgorandSubscriber.md#indexer)
- [startPromise](index.AlgorandSubscriber.md#startpromise)
- [started](index.AlgorandSubscriber.md#started)

### Methods

- [on](index.AlgorandSubscriber.md#on)
- [onBatch](index.AlgorandSubscriber.md#onbatch)
- [onBeforePoll](index.AlgorandSubscriber.md#onbeforepoll)
- [onPoll](index.AlgorandSubscriber.md#onpoll)
- [pollOnce](index.AlgorandSubscriber.md#pollonce)
- [start](index.AlgorandSubscriber.md#start)
- [stop](index.AlgorandSubscriber.md#stop)

## Constructors

### constructor

• **new AlgorandSubscriber**(`config`, `algod`, `indexer?`): [`AlgorandSubscriber`](index.AlgorandSubscriber.md)

Create a new `AlgorandSubscriber`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`AlgorandSubscriberConfig`](../interfaces/types_subscription.AlgorandSubscriberConfig.md) | The subscriber configuration |
| `algod` | `default` | An algod client |
| `indexer?` | `default` | An (optional) indexer client; only needed if `subscription.syncBehaviour` is `catchup-with-indexer` |

#### Returns

[`AlgorandSubscriber`](index.AlgorandSubscriber.md)

#### Defined in

[subscriber.ts:35](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L35)

## Properties

### abortController

• `Private` **abortController**: `AbortController`

#### Defined in

[subscriber.ts:23](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L23)

___

### algod

• `Private` **algod**: `default`

#### Defined in

[subscriber.ts:20](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L20)

___

### config

• `Private` **config**: [`AlgorandSubscriberConfig`](../interfaces/types_subscription.AlgorandSubscriberConfig.md)

#### Defined in

[subscriber.ts:22](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L22)

___

### eventEmitter

• `Private` **eventEmitter**: [`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

#### Defined in

[subscriber.ts:24](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L24)

___

### filterNames

• `Private` **filterNames**: `string`[]

#### Defined in

[subscriber.ts:27](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L27)

___

### indexer

• `Private` **indexer**: `undefined` \| `default`

#### Defined in

[subscriber.ts:21](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L21)

___

### startPromise

• `Private` **startPromise**: `undefined` \| `Promise`\<`void`\>

#### Defined in

[subscriber.ts:26](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L26)

___

### started

• `Private` **started**: `boolean` = `false`

#### Defined in

[subscriber.ts:25](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L25)

## Methods

### on

▸ **on**\<`T`\>(`filterName`, `listener`): [`AlgorandSubscriber`](index.AlgorandSubscriber.md)

Register an event handler to run on every subscribed transaction matching the given filter name.

The listener can be async and it will be awaited if so.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | [`SubscribedTransaction`](../modules/types_subscription.md#subscribedtransaction) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filterName` | `string` | The name of the filter to subscribe to |
| `listener` | [`TypedAsyncEventListener`](../modules/types_subscription.md#typedasynceventlistener)\<`T`\> | The listener function to invoke with the subscribed event |

#### Returns

[`AlgorandSubscriber`](index.AlgorandSubscriber.md)

The subscriber so `on*` calls can be chained

**`Example`**

```typescript
subscriber.on('my-filter', async (transaction) => { console.log(transaction.id) })
```

**`Example`**

```typescript
new AlgorandSubscriber({filters: [{name: 'my-filter', filter: {...}, mapper: (t) => t.id}], ...}, algod)
 .on<string>('my-filter', async (transactionId) => { console.log(transactionId) })
```

#### Defined in

[subscriber.ts:176](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L176)

___

### onBatch

▸ **onBatch**\<`T`\>(`filterName`, `listener`): [`AlgorandSubscriber`](index.AlgorandSubscriber.md)

Register an event handler to run on all subscribed transactions matching the given filter name
for each subscription poll.

This is useful when you want to efficiently process / persist events
in bulk rather than one-by-one.

The listener can be async and it will be awaited if so.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | [`SubscribedTransaction`](../modules/types_subscription.md#subscribedtransaction) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filterName` | `string` | The name of the filter to subscribe to |
| `listener` | [`TypedAsyncEventListener`](../modules/types_subscription.md#typedasynceventlistener)\<`T`[]\> | The listener function to invoke with the subscribed events |

#### Returns

[`AlgorandSubscriber`](index.AlgorandSubscriber.md)

The subscriber so `on*` calls can be chained

**`Example`**

```typescript
subscriber.onBatch('my-filter', async (transactions) => { console.log(transactions.length) })
```

**`Example`**

```typescript
new AlgorandSubscriber({filters: [{name: 'my-filter', filter: {...}, mapper: (t) => t.id}], ...}, algod)
 .onBatch<string>('my-filter', async (transactionIds) => { console.log(transactionIds) })
```

#### Defined in

[subscriber.ts:202](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L202)

___

### onBeforePoll

▸ **onBeforePoll**(`listener`): [`AlgorandSubscriber`](index.AlgorandSubscriber.md)

Register an event handler to run before every subscription poll.

This is useful when you want to do pre-poll logging or start a transaction etc.

The listener can be async and it will be awaited if so.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `listener` | [`TypedAsyncEventListener`](../modules/types_subscription.md#typedasynceventlistener)\<[`BeforePollMetadata`](../interfaces/types_subscription.BeforePollMetadata.md)\> | The listener function to invoke with the pre-poll metadata |

#### Returns

[`AlgorandSubscriber`](index.AlgorandSubscriber.md)

The subscriber so `on*` calls can be chained

**`Example`**

```typescript
subscriber.onBeforePoll(async (metadata) => { console.log(metadata.watermark) })
```

#### Defined in

[subscriber.ts:220](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L220)

___

### onPoll

▸ **onPoll**(`listener`): [`AlgorandSubscriber`](index.AlgorandSubscriber.md)

Register an event handler to run after every subscription poll.

This is useful when you want to process all subscribed transactions
in a transactionally consistent manner rather than piecemeal for each
filter, or to have a hook that occurs at the end of each poll to commit
transactions etc.

The listener can be async and it will be awaited if so.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `listener` | [`TypedAsyncEventListener`](../modules/types_subscription.md#typedasynceventlistener)\<[`TransactionSubscriptionResult`](../interfaces/types_subscription.TransactionSubscriptionResult.md)\> | The listener function to invoke with the poll result |

#### Returns

[`AlgorandSubscriber`](index.AlgorandSubscriber.md)

The subscriber so `on*` calls can be chained

**`Example`**

```typescript
subscriber.onPoll(async (pollResult) => { console.log(pollResult.subscribedTransactions.length, pollResult.syncedRoundRange) })
```

#### Defined in

[subscriber.ts:241](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L241)

___

### pollOnce

▸ **pollOnce**(): `Promise`\<[`TransactionSubscriptionResult`](../interfaces/types_subscription.TransactionSubscriptionResult.md)\>

Execute a single subscription poll.

This is useful when executing in the context of a process
triggered by a recurring schedule / cron.

#### Returns

`Promise`\<[`TransactionSubscriptionResult`](../interfaces/types_subscription.TransactionSubscriptionResult.md)\>

The poll result

#### Defined in

[subscriber.ts:61](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L61)

___

### start

▸ **start**(`inspect?`, `suppressLog?`): `void`

Start the subscriber in a loop until `stop` is called.

This is useful when running in the context of a long-running process / container.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `inspect?` | (`pollResult`: [`TransactionSubscriptionResult`](../interfaces/types_subscription.TransactionSubscriptionResult.md)) => `void` | A function that is called for each poll so the inner workings can be inspected / logged / etc. |
| `suppressLog?` | `boolean` | - |

#### Returns

`void`

An object that contains a promise you can wait for after calling stop

#### Defined in

[subscriber.ts:105](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L105)

___

### stop

▸ **stop**(`reason`): `Promise`\<`void`\>

Stops the subscriber if previously started via `start`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reason` | `unknown` | The reason the subscriber is being stopped |

#### Returns

`Promise`\<`void`\>

A promise that can be awaited to ensure the subscriber has finished stopping

#### Defined in

[subscriber.ts:149](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/subscriber.ts#L149)
