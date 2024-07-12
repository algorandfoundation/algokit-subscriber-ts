[@algorandfoundation/algokit-subscriber](../README.md) / types/async-event-emitter

# Module: types/async-event-emitter

## Table of contents

### Classes

- [AsyncEventEmitter](../classes/types_async_event_emitter.AsyncEventEmitter.md)

### Type Aliases

- [AsyncEventListener](types_async_event_emitter.md#asynceventlistener)

## Type Aliases

### AsyncEventListener

Ƭ **AsyncEventListener**: (`event`: `unknown`, `eventName`: `string` \| `symbol`) => `Promise`\<`void`\> \| `void`

An asynchronous event listener

#### Type declaration

▸ (`event`, `eventName`): `Promise`\<`void`\> \| `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `unknown` |
| `eventName` | `string` \| `symbol` |

##### Returns

`Promise`\<`void`\> \| `void`

#### Defined in

[types/async-event-emitter.ts:4](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/async-event-emitter.ts#L4)
