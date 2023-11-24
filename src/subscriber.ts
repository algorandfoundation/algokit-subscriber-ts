import { Algodv2, Indexer } from 'algosdk'
import { AsyncEventEmitter } from './async-event-emitter'
import { getSubscribedTransactions } from './subscriptions'
import type { SubscriptionConfig } from './types/subscription'

/**
 * Handles the logic for subscribing to the Algorand blockchain and emitting events.
 */
export class AlgorandSubscriber {
  private algod: Algodv2
  private indexer: Indexer | undefined
  private subscription: SubscriptionConfig
  private abortController: AbortController
  private eventEmitter: AsyncEventEmitter

  /**
   * Create a new `AlgorandSubscriber`.
   * @param subscription The subscription configuration
   * @param algod An algod client
   * @param indexer An (optional) indexer client; only needed if `subscription.syncBehaviour` is `catchup-with-indexer`
   */
  constructor(subscription: SubscriptionConfig, algod: Algodv2, indexer?: Indexer) {
    this.algod = algod
    this.indexer = indexer
    this.subscription = subscription
    this.abortController = new AbortController()
    this.eventEmitter = new AsyncEventEmitter()

    if (subscription.events.length > 1) {
      // todo: Support multiple events
      throw new Error('Current only a single event is supported')
    }

    if (subscription.syncBehaviour === 'catchup-with-indexer' && !indexer) {
      throw new Error("Received sync behaviour of catchup-with-indexer, but didn't receive an indexer instance.")
    }
  }

  /**
   * Execute a single subscription poll.
   *
   * This is useful when executing in the context of a process
   * triggered by a recurring schedule / cron.
   */
  async pollOnce() {
    const watermark = await this.subscription.watermarkPersistence.get()

    const pollResult = await getSubscribedTransactions(
      {
        filter: this.subscription.events[0].filter,
        watermark,
        maxRoundsToSync: this.subscription.maxRoundsToSync,
        syncBehaviour: this.subscription.syncBehaviour,
      },
      this.algod,
      this.indexer,
    )

    const mappedTransactions = this.subscription.events[0].mapper
      ? await this.subscription.events[0].mapper(pollResult.subscribedTransactions)
      : pollResult.subscribedTransactions
    try {
      await this.eventEmitter.emitAsync(`batch:${this.subscription.events[0].eventName}`, mappedTransactions)
      for (const transaction of mappedTransactions) {
        await this.eventEmitter.emitAsync(this.subscription.events[0].eventName, transaction)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Error processing event emittance`, e)
      throw e
    }

    await this.subscription.watermarkPersistence.set(pollResult.newWatermark)
  }

  /**
   * Start the subscriber in a loop until `stop` is called.
   *
   * This is useful when running in the context of a long-running process / container.
   */
  start() {
    ;(async () => {
      while (!this.abortController.signal.aborted) {
        await this.pollOnce()
        await new Promise((resolve) => setTimeout(resolve, this.subscription.frequencyInSeconds * 1000))
      }
    })()
  }

  /** Stops the subscriber if previously started via `start`. */
  stop(reason: unknown) {
    this.abortController.abort(reason)
  }

  /**
   * Register an event handler to run on every instance the given event name.
   *
   * The listener can be async and it will be awaited if so.
   * @param eventName The name of the event to subscribe to
   * @param listener The listener function to invoke with the subscribed event
   */
  on<T>(eventName: string, listener: (event: T) => unknown) {
    this.eventEmitter.on(eventName, listener)
  }

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
  onBatch<T>(eventName: string, listener: (events: T[]) => unknown) {
    this.eventEmitter.on(`batch:${eventName}`, listener)
  }
}
