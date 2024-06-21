import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'
import { getSubscribedTransactions } from './subscriptions'
import { AsyncEventEmitter, AsyncEventListener } from './types/async-event-emitter'
import type {
  AlgorandSubscriberConfig,
  BeforePollMetadata,
  ErrorListener,
  SubscribedTransaction,
  TransactionSubscriptionResult,
  TypedAsyncEventListener,
} from './types/subscription'
import { race, sleep } from './utils'
import Algodv2 = algosdk.Algodv2
import Indexer = algosdk.Indexer

/**
 * Handles the logic for subscribing to the Algorand blockchain and emitting events.
 */
export class AlgorandSubscriber {
  private algod: Algodv2
  private indexer: Indexer | undefined
  private config: AlgorandSubscriberConfig
  private abortController: AbortController
  private eventEmitter: AsyncEventEmitter
  private started: boolean = false
  private startPromise: Promise<void> | undefined
  private filterNames: string[]

  private readonly errorEventName = 'error'
  private readonly defaultErrorHandler = (error: unknown) => {
    throw error
  }

  /**
   * Create a new `AlgorandSubscriber`.
   * @param config The subscriber configuration
   * @param algod An algod client
   * @param indexer An (optional) indexer client; only needed if `subscription.syncBehaviour` is `catchup-with-indexer`
   */
  constructor(config: AlgorandSubscriberConfig, algod: Algodv2, indexer?: Indexer) {
    this.algod = algod
    this.indexer = indexer
    this.config = config
    this.abortController = new AbortController()
    this.eventEmitter = new AsyncEventEmitter().on(this.errorEventName, this.defaultErrorHandler)

    this.filterNames = this.config.filters
      .map((f) => f.name)
      .filter((value, index, self) => {
        // Remove duplicates
        return self.findIndex((x) => x === value) === index
      })

    if (config.syncBehaviour === 'catchup-with-indexer' && !indexer) {
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
    const watermark = await this.config.watermarkPersistence.get()

    const currentRound = (await this.algod.status().do())['last-round'] as number
    await this.eventEmitter.emitAsync('before:poll', {
      watermark,
      currentRound,
    } satisfies BeforePollMetadata)

    const pollResult = await getSubscribedTransactions(
      {
        watermark,
        currentRound,
        ...this.config,
      },
      this.algod,
      this.indexer,
    )

    try {
      for (const filterName of this.filterNames) {
        const mapper = this.config.filters.find((f) => f.name === filterName)?.mapper
        const matchedTransactions = pollResult.subscribedTransactions.filter((t) => t.filtersMatched?.includes(filterName))
        const mappedTransactions = mapper ? await mapper(matchedTransactions) : matchedTransactions

        await this.eventEmitter.emitAsync(`batch:${filterName}`, mappedTransactions)
        for (const transaction of mappedTransactions) {
          await this.eventEmitter.emitAsync(filterName, transaction)
        }
      }
      await this.eventEmitter.emitAsync('poll', pollResult)
    } catch (e) {
      algokit.Config.logger.error(`Error processing event emittance`, e)
      throw e
    }
    await this.config.watermarkPersistence.set(pollResult.newWatermark)
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
    if (this.abortController.signal.aborted) {
      this.abortController = new AbortController()
    }
    this.startPromise = (async () => {
      while (!this.abortController.signal.aborted) {
        // eslint-disable-next-line no-console
        const start = +new Date()
        const result = await this.pollOnce()
        const durationInSeconds = (+new Date() - start) / 1000
        algokit.Config.getLogger(suppressLog).debug('Subscription poll', {
          currentRound: result.currentRound,
          startingWatermark: result.startingWatermark,
          newWatermark: result.newWatermark,
          syncedRoundRange: result.syncedRoundRange,
          subscribedTransactionsLength: result.subscribedTransactions.length,
        })
        inspect?.(result)
        // eslint-disable-next-line no-console
        if (result.currentRound > result.newWatermark || !this.config.waitForBlockWhenAtTip) {
          algokit.Config.getLogger(suppressLog).info(
            `Subscription poll completed in ${durationInSeconds}s; sleeping for ${this.config.frequencyInSeconds ?? 1}s`,
          )
          await sleep((this.config.frequencyInSeconds ?? 1) * 1000, this.abortController.signal)
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
    this.startPromise.catch(async (e) => {
      this.started = false
      await this.eventEmitter.emitAsync(this.errorEventName, e)
    })
  }

  /** Stops the subscriber if previously started via `start`.
   * @param reason The reason the subscriber is being stopped
   * @returns A promise that can be awaited to ensure the subscriber has finished stopping
   */
  stop(reason: unknown): Promise<void> {
    if (!this.started) return Promise.resolve()
    this.abortController.abort(reason)
    return this.startPromise!.catch((e) => {
      // Abort signal throws a DOMException when aborted, which is expected
      //  and should be ignoredIf we get a different exception then we should re-throw it
      if (!(e instanceof DOMException)) throw e
    })
  }

  /**
   * Register an event handler to run on every subscribed transaction matching the given filter name.
   *
   * The listener can be async and it will be awaited if so.
   * @example **Non-mapped**
   * ```typescript
   * subscriber.on('my-filter', async (transaction) => { console.log(transaction.id) })
   * ```
   * @example **Mapped**
   * ```typescript
   * new AlgorandSubscriber({filters: [{name: 'my-filter', filter: {...}, mapper: (t) => t.id}], ...}, algod)
   *  .on<string>('my-filter', async (transactionId) => { console.log(transactionId) })
   * ```
   * @param filterName The name of the filter to subscribe to
   * @param listener The listener function to invoke with the subscribed event
   * @returns The subscriber so `on*` calls can be chained
   */
  on<T = SubscribedTransaction>(filterName: string, listener: TypedAsyncEventListener<T>) {
    if (filterName === this.errorEventName) {
      throw new Error(`'${this.errorEventName}' is reserved, please supply a different filterName.`)
    }
    this.eventEmitter.on(filterName, listener as AsyncEventListener)
    return this
  }

  /**
   * Register an event handler to run on all subscribed transactions matching the given filter name
   * for each subscription poll.
   *
   * This is useful when you want to efficiently process / persist events
   * in bulk rather than one-by-one.
   *
   * The listener can be async and it will be awaited if so.
   * @example **Non-mapped**
   * ```typescript
   * subscriber.onBatch('my-filter', async (transactions) => { console.log(transactions.length) })
   * ```
   * @example **Mapped**
   * ```typescript
   * new AlgorandSubscriber({filters: [{name: 'my-filter', filter: {...}, mapper: (t) => t.id}], ...}, algod)
   *  .onBatch<string>('my-filter', async (transactionIds) => { console.log(transactionIds) })
   * ```
   * @param filterName The name of the filter to subscribe to
   * @param listener The listener function to invoke with the subscribed events
   * @returns The subscriber so `on*` calls can be chained
   */
  onBatch<T = SubscribedTransaction>(filterName: string, listener: TypedAsyncEventListener<T[]>) {
    this.eventEmitter.on(`batch:${filterName}`, listener as AsyncEventListener)
    return this
  }

  /**
   * Register an event handler to run before every subscription poll.
   *
   * This is useful when you want to do pre-poll logging or start a transaction etc.
   *
   * The listener can be async and it will be awaited if so.
   * @example
   * ```typescript
   * subscriber.onBeforePoll(async (metadata) => { console.log(metadata.watermark) })
   * ```
   * @param listener The listener function to invoke with the pre-poll metadata
   * @returns The subscriber so `on*` calls can be chained
   */
  onBeforePoll(listener: TypedAsyncEventListener<BeforePollMetadata>) {
    this.eventEmitter.on('before:poll', listener as AsyncEventListener)
    return this
  }

  /**
   * Register an event handler to run after every subscription poll.
   *
   * This is useful when you want to process all subscribed transactions
   * in a transactionally consistent manner rather than piecemeal for each
   * filter, or to have a hook that occurs at the end of each poll to commit
   * transactions etc.
   *
   * The listener can be async and it will be awaited if so.
   * @example
   * ```typescript
   * subscriber.onPoll(async (pollResult) => { console.log(pollResult.subscribedTransactions.length, pollResult.syncedRoundRange) })
   * ```
   * @param listener The listener function to invoke with the poll result
   * @returns The subscriber so `on*` calls can be chained
   */
  onPoll(listener: TypedAsyncEventListener<TransactionSubscriptionResult>) {
    this.eventEmitter.on('poll', listener as AsyncEventListener)
    return this
  }

  /**
   * Register an error handler to run if an error is thrown during processing or event handling.
   *
   * This is useful to handle any errors that occur and can be used to perform retries, logging or cleanup activities.
   *
   * The listener can be async and it will be awaited if so.
   * @example
   * ```typescript
   * subscriber.onError((error) => { console.error(error) })
   * ```
   * @example
   * ```typescript
   * const maxRetries = 3
   * let retryCount = 0
   * subscriber.onError(async (error) => {
   *   retryCount++
   *   if (retryCount > maxRetries) {
   *     console.error(error)
   *     return
   *   }
   *   console.log(`Error occurred, retrying in 2 seconds (${retryCount}/${maxRetries})`)
   *   await new Promise((r) => setTimeout(r, 2_000))
   *   subscriber.start()
   *})
   * ```
   * @param listener The listener function to invoke with the error that was thrown
   * @returns The subscriber so `on*` calls can be chained
   */
  onError(listener: ErrorListener) {
    // Remove the default error handling, as errors are being handled.
    this.eventEmitter.off(this.errorEventName, this.defaultErrorHandler).on(this.errorEventName, listener as AsyncEventListener)
    return this
  }
}
