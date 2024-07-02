[@algorandfoundation/algokit-subscriber](../README.md) / [types/async-event-emitter](../modules/types_async_event_emitter.md) / AsyncEventEmitter

# Class: AsyncEventEmitter

[types/async-event-emitter](../modules/types_async_event_emitter.md).AsyncEventEmitter

Simple asynchronous event emitter class.

**Note:** This class is not thread-safe.

## Table of contents

### Constructors

- [constructor](types_async_event_emitter.AsyncEventEmitter.md#constructor)

### Properties

- [listenerMap](types_async_event_emitter.AsyncEventEmitter.md#listenermap)
- [listenerWrapperMap](types_async_event_emitter.AsyncEventEmitter.md#listenerwrappermap)
- [off](types_async_event_emitter.AsyncEventEmitter.md#off)

### Methods

- [emitAsync](types_async_event_emitter.AsyncEventEmitter.md#emitasync)
- [on](types_async_event_emitter.AsyncEventEmitter.md#on)
- [once](types_async_event_emitter.AsyncEventEmitter.md#once)
- [removeListener](types_async_event_emitter.AsyncEventEmitter.md#removelistener)

## Constructors

### constructor

• **new AsyncEventEmitter**(): [`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

#### Returns

[`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

## Properties

### listenerMap

• `Private` **listenerMap**: `Record`\<`string` \| `symbol`, [`AsyncEventListener`](../modules/types_async_event_emitter.md#asynceventlistener)[]\> = `{}`

#### Defined in

[types/async-event-emitter.ts:12](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/async-event-emitter.ts#L12)

___

### listenerWrapperMap

• `Private` **listenerWrapperMap**: `WeakMap`\<[`AsyncEventListener`](../modules/types_async_event_emitter.md#asynceventlistener), [`AsyncEventListener`](../modules/types_async_event_emitter.md#asynceventlistener)\>

#### Defined in

[types/async-event-emitter.ts:11](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/async-event-emitter.ts#L11)

___

### off

• **off**: (`eventName`: `string` \| `symbol`, `listener`: [`AsyncEventListener`](../modules/types_async_event_emitter.md#asynceventlistener)) => [`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

Alias for `removeListener`.

#### Type declaration

▸ (`eventName`, `listener`): [`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

##### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `string` \| `symbol` |
| `listener` | [`AsyncEventListener`](../modules/types_async_event_emitter.md#asynceventlistener) |

##### Returns

[`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

#### Defined in

[types/async-event-emitter.ts:82](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/async-event-emitter.ts#L82)

## Methods

### emitAsync

▸ **emitAsync**(`eventName`, `event`): `Promise`\<`void`\>

Emit an event and wait for all registered listeners to be run one-by-one
in the order they were registered.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event |
| `event` | `unknown` | The event payload |

#### Returns

`Promise`\<`void`\>

#### Defined in

[types/async-event-emitter.ts:21](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/async-event-emitter.ts#L21)

___

### on

▸ **on**(`eventName`, `listener`): [`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

Register an event listener for the given event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event |
| `listener` | [`AsyncEventListener`](../modules/types_async_event_emitter.md#asynceventlistener) | The listener to trigger |

#### Returns

[`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

The `AsyncEventEmitter` so you can chain registrations

#### Defined in

[types/async-event-emitter.ts:33](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/async-event-emitter.ts#L33)

___

### once

▸ **once**(`eventName`, `listener`): [`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

Register an event listener for the given event that is only fired once.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event |
| `listener` | [`AsyncEventListener`](../modules/types_async_event_emitter.md#asynceventlistener) | The listener to trigger |

#### Returns

[`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

The `AsyncEventEmitter` so you can chain registrations

#### Defined in

[types/async-event-emitter.ts:45](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/async-event-emitter.ts#L45)

___

### removeListener

▸ **removeListener**(`eventName`, `listener`): [`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

Removes an event listener from the given event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventName` | `string` \| `symbol` | The name of the event |
| `listener` | [`AsyncEventListener`](../modules/types_async_event_emitter.md#asynceventlistener) | The listener to remove |

#### Returns

[`AsyncEventEmitter`](types_async_event_emitter.AsyncEventEmitter.md)

The `AsyncEventEmitter` so you can chain registrations

#### Defined in

[types/async-event-emitter.ts:63](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/async-event-emitter.ts#L63)
