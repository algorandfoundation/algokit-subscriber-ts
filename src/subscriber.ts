import * as algokit from '@algorandfoundation/algokit-utils'
import { Algodv2, Indexer } from 'algosdk'
import { getSubscribedTransactions } from './subscriptions'
import { AsyncEventEmitter, AsyncEventListener } from './types/async-event-emitter'
import type {
  SubscribedTransaction,
  SubscriptionConfig,
  TransactionSubscriptionResult,
  TypedAsyncEventListener,
} from './types/subscription'
import { race, sleep } from './utils'

/**
 * Handles the logic for subscribing to the Algorand blockchain and emitting events.
 */
export class AlgorandSubscriber {
  private algod: Algodv2
  private indexer: Indexer | undefined
  private subscription: SubscriptionConfig
  private abortController: AbortController
  private eventEmitter: AsyncEventEmitter
  private started: boolean = false
  private startPromise: Promise<void> | undefined

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
   * @returns The poll result
   */
  async pollOnce(): Promise<TransactionSubscriptionResult> {
    const watermark = await this.subscription.watermarkPersistence.get()

    const pollResult = await getSubscribedTransactions(
      {
        filter: this.subscription.events[0].filter,
        arc28Events: this.subscription.arc28Events,
        watermark,
        maxRoundsToSync: this.subscription.maxRoundsToSync ?? 500,
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
      algokit.Config.logger.error(`Error processing event emittance`, e)
      throw e
    }
    await this.subscription.watermarkPersistence.set(pollResult.newWatermark)
    return pollResult
  }

  /**
   * Start the subscriber in a loop until `stop` is called.
   *
   * This is useful when running in the context of a long-running process / container.
   * @param inspect A function that is called for each poll so the inner workings can be inspected / logged / etc.
   * @returns An object that contains a promise you can wait for after calling stop
   */
  start(inspect?: (pollResult: TransactionSubscriptionResult) => void, suppressLog?: boolean): void {
    if (this.started) return
    this.started = true
    this.startPromise = (async () => {
      while (!this.abortController.signal.aborted) {
        // eslint-disable-next-line no-console
        const start = +new Date()
        const result = await this.pollOnce()
        inspect?.(result)
        const durationInSeconds = (+new Date() - start) / 1000
        algokit.Config.getLogger(suppressLog).debug('Subscription poll', {
          currentRound: result.currentRound,
          newWatermark: result.newWatermark,
          syncedRoundRange: result.syncedRoundRange,
          subscribedTransactionsLength: result.subscribedTransactions.length,
        })
        // eslint-disable-next-line no-console
        if (result.currentRound > result.newWatermark || !this.subscription.waitForBlockWhenAtTip) {
          algokit.Config.getLogger(suppressLog).info(
            `Subscription poll completed in ${durationInSeconds}s; sleeping for ${this.subscription.frequencyInSeconds ?? 1}s`,
          )
          await sleep((this.subscription.frequencyInSeconds ?? 1) * 1000, this.abortController.signal)
        } else {
          // Wait until the next block is published
          algokit.Config.getLogger(suppressLog).info(
            `Subscription poll completed in ${durationInSeconds}s; waiting for round ${result.currentRound + 1}`,
          )
          const waitStart = +new Date()
          // Despite what the `statusAfterBlock` method description suggests, you need to wait for the round before
          //  the round you are waiting for per the API description:
          //  https://developer.algorand.org/docs/rest-apis/algod/#get-v2statuswait-for-block-afterround
          await race(this.algod.statusAfterBlock(result.currentRound).do(), this.abortController.signal)
          algokit.Config.getLogger(suppressLog).info(`Waited for ${(+new Date() - waitStart) / 1000}s until next block`)
        }
      }
      this.started = false
    })()
  }

  /** Stops the subscriber if previously started via `start`.
   * @param reason The reason the subscriber is being stopped
   * @returns A promise that can be awaited to ensure the subscriber has finished stopping
   */
  stop(reason: unknown): Promise<void> {
    if (!this.started) return Promise.resolve()
    this.abortController.abort(reason)
    return this.startPromise!
  }

  /**
   * Register an event handler to run on every instance the given event name.
   *
   * The listener can be async and it will be awaited if so.
   * @param eventName The name of the event to subscribe to
   * @param listener The listener function to invoke with the subscribed event
   * @returns The subscriber so `on`/`onBatch` calls can be chained
   */
  on<T = SubscribedTransaction>(eventName: string, listener: TypedAsyncEventListener<T>) {
    this.eventEmitter.on(eventName, listener as AsyncEventListener)
    return this
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
   * @returns The subscriber so `on`/`onBatch` calls can be chained
   */
  onBatch<T = SubscribedTransaction>(eventName: string, listener: TypedAsyncEventListener<T[]>) {
    this.eventEmitter.on(`batch:${eventName}`, listener as AsyncEventListener)
    return this
  }
}
