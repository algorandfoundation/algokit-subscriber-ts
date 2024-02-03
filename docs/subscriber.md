# `AlgorandSubscriber`

`AlgorandSubscriber` is a class that allows you to easily subscribe to the Algorand Blockchain, define a series of events that you are interested in, and react to those events. It has a similar programming model to [EventEmitter](https://nodejs.org/docs/latest/api/events.html), but also supports async/await.

## Creating a subscriber

To create an `AlgorandSubscriber` you can use the constructor:

```typescript
  /**
   * Create a new `AlgorandSubscriber`.
   * @param subscription The subscription configuration
   * @param algod An algod client
   * @param indexer An (optional) indexer client; only needed if `subscription.syncBehaviour` is `catchup-with-indexer`
   */
  constructor(subscription: SubscriptionConfig, algod: Algodv2, indexer?: Indexer)
```

The key configuration is the `SubscriptionConfig` interface:

```typescript
/** Configuration for a subscription */
export interface SubscriptionConfig {
  /** The frequency to poll for new blocks in seconds; defaults to 1s */
  frequencyInSeconds?: number
  /** Whether to wait via algod `/status/wait-for-block-after` endpoint when at the tip of the chain; reduces latency of subscription */
  waitForBlockWhenAtTip?: boolean
  /** The maximum number of rounds to sync at a time; defaults to 500 */
  maxRoundsToSync?: number
  /** The set of events to subscribe to / emit */
  events: SubscriptionConfigEvent<unknown>[]
  /** The behaviour when the number of rounds to sync is greater than `maxRoundsToSync`:
   *  * `skip-sync-newest`: Discard old rounds.
   *  * `sync-oldest`: Sync from the oldest records up to `maxRoundsToSync` rounds.
   *
   *    **Note:** will be slow to catch up if sync is significantly behind the tip of the chain
   *  * `sync-oldest-start-now`: Sync from the oldest records up to `maxRoundsToSync` rounds, unless
   *    current watermark is `0` in which case it will start `maxRoundsToSync` back from the tip of the chain.
   *  * `catchup-with-indexer`: Will catch up to `tipOfTheChain - maxRoundsToSync` using indexer (fast) and then
   *    continue with algod.
   */
  syncBehaviour: 'skip-sync-newest' | 'sync-oldest' | 'sync-oldest-start-now' | 'catchup-with-indexer'
  /** Methods to retrieve and persist the current watermark so syncing is resilient and maintains
   * its position in the chain */
  watermarkPersistence: {
    /** Returns the current watermark that syncing has previously been processed to */
    get: () => Promise<number>
    /** Persist the new watermark that has been processed */
    set: (newWatermark: number) => Promise<void>
  }
}
```

`watermarkPersistence` allows you to ensure reliability against your code having outages since you can persist the last block your code processed up to and then provide it again the next time your code runs.

`maxRoundsToSync` and `syncBehaviour` allow you to control the subscription semantics as your code falls behind the tip of the chain (either on first run or after an outage).

`frequencyInSeconds` allows you to control the polling frequency and by association your latency tolerance for new events once you've caught up to the tip of the chain. Alternatively, you can set `waitForBlockWhenAtTip` to get the subscriber to ask algod to tell it when there is a new block ready to reduce latency when it's caught up to the tip of the chain.

Events defines the different subscription(s) you want to make, and is defined by the following interface:

```typescript
/** A single event to subscribe to / emit. */
export interface SubscriptionConfigEvent<T> {
  /** Name / identifier to uniquely describe the event */
  eventName: string
  /** The transaction filter that determines if the event has occurred */
  filter: TransactionFilter
  /** An optional data mapper if you want the event data to take a certain shape.
   *
   * If not specified, then the event will receive a `TransactionResult`.
   */
  mapper?: (transaction: SubscribedTransaction[]) => Promise<T[]>
}
```

The event name is a unique name that describes the event you are subscribing to. The filter defines how to interpret transactions on the chain as being "collected" by that event and the mapper is an optional ability to map from the raw transaction to a more targeted type for your event subscribers.

## Subscribing to events

Once you have created the `AlgorandSubscriber`, you can register handlers/listeners for the events you have defined.

You can do this via the `on` and `onBatch` methods:

```typescript
  /**
   * Register an event handler to run on every instance the given event name.
   *
   * The listener can be async and it will be awaited if so.
   * @param eventName The name of the event to subscribe to
   * @param listener The listener function to invoke with the subscribed event
   */
  on<T = SubscribedTransaction>(eventName: string, listener: TypedAsyncEventListener<T>){}

  /**
   * Register an event handler to run on all instances of the given event name
   * for each subscription poll.
   *
   * This is useful when you want to efficiently process / persist events
   * in bulk rather than one-by-one.
   *
   * The listener can be async and it will be awaited if so.
   * @param eventName The name of the event to subscribe to
   * @param listener The listener function to invoke with the subscribed events
   */
  onBatch<T = SubscribedTransaction>(eventName: string, listener: TypedAsyncEventListener<T[]>){}
```

The `TypedAsyncEventListener` type is defined as:

```typescript
type TypedAsyncEventListener<T> = (event: T, eventName: string | symbol) => Promise<void> | void
```

This allows you to use async or sync event listeners.

When you define an event listener it will be called, one-by-one (and awaited) in the order the registrations occur.

If you call `onBatch` it will be called first, with the full set of transactions that were found in the current poll (0 or more). Following that, each transaction in turn will then be passed to the listener(s) that subscribed with `on` for that event.

The default type that will be received is a `SubscribedTransaction`, which can be imported like so:

```typescript
import type { SubscribedTransaction } from '@algorandfoundation/algokit-subscriber/types/subscription'
```

It's a superset of the [indexer `TransactionResult` type](https://developer.algorand.org/docs/rest-apis/indexer/#transaction). Even if you aren't using indexer, this is the type that will be returned because it's a convenient and comprehensive type that has all the data you would want about a transaction including the transaction ID.

## Poll the chain

There are two methods to poll the chain for events: `pollOnce` and `start`:

```typescript
/**
 * Execute a single subscription poll.
 *
 * This is useful when executing in the context of a process
 * triggered by a recurring schedule / cron.
 * @returns The poll result
 */
async pollOnce(): Promise<>

/**
 * Start the subscriber in a loop until `stop` is called.
 *
 * This is useful when running in the context of a long-running process / container.
 * @param inspect A function that is called for each poll so the inner workings can be inspected / logged / etc.
 * @returns An object that contains a promise you can wait for after calling stop
 */
start(inspect?: (pollResult: TransactionSubscriptionResult) => void, suppressLog?: boolean): void
```

`pollOnce` is useful when you want to take control of scheduling the different polls, such as when running a Lambda on a schedule or a process via cron, etc. - it will do a single poll of the chain and return the result of that poll.

`start` is useful when you have a long-running process or container and you want it to loop infinitely at the specified polling frequency from the constructor config. If you want to inspect or log what happens under the covers you can pass in an inspect lambda that will be called for each poll.

If you use `start` then you can stop the polling by calling `stop`, which can be awaited to wait until everything is cleaned up. You may want to subscribe to NodeJS kill signals to exit cleanly:

```typescript
;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
  process.on(signal, () => {
    // eslint-disable-next-line no-console
    console.log(`Received ${signal}; stopping subscriber...`)
    subscriber.stop(signal).then(() => console.log('Subscriber stopped'))
  }),
)
```

## Examples

See the [main README](../README.md#examples).
