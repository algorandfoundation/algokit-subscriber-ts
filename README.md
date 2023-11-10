# Algorand transaction subscription / indexing

This is a proof-of-concept for a simple, but flexible / configurable Algorand transaction subscription / indexing solution.

- `npm install`
- Copy `.env.sample` to `.env` and edit to point to the Algorand node you want to point to
- Edit the filter in `index.ts` to change the syncing characteristics
- `npm run dev` or F5 in Visual Studio Code to get breakpoint debugging

If you want to keep running the sync continuously, you can run `npm run watch`.

## `getSubscribedTransactions`

The key method that is exposed to meet the simple, but flexible property is `getSubscribedTransactions`, which has the following signature:

```typescript
/**
 * Executes a single pull/poll to subscribe to transactions on the configured Algorand
 * blockchain for the given subscription context.
 * @param subscription The subscription context.
 * @param algod An Algod client.
 * @param indexer An optional indexer client, only needed when `onMaxRounds` is `catchup-with-indexer`.
 * @returns The result of this subscription pull/poll.
 */
export async function getSubscribedTransactions(
  subscription: TransactionSubscriptionParams,
  algod: Algodv2,
  indexer?: Indexer,
): Promise<TransactionSubscriptionResult> {}
```

Specifying a subscription requires passing in a `TransactionSubscriptionParams` object:

```typescript
/** Parameters to control a single subscription pull/poll. */
export interface TransactionSubscriptionParams {
  /** The filter to apply to find transactions of interest. */
  filter: TransactionFilter
  /** The current round watermark that transactions have previously been synced to.
   *
   * Persist this value as you process transactions processed from this method
   * to allow for resilient and incremental syncing.
   *
   * Syncing will start from `watermark + 1`.
   *
   * Start from 0 if you want to start from the beginning of time, noting that
   * will be slow if `onMaxRounds` is `sync-oldest`.
   **/
  watermark: number
  /** The maximum number of rounds to sync for each subscription pull/poll.
   *
   * This gives you control over how many rounds you wait for at a time,
   * your staleness tolerance when using `skip-to-newest` or `fail`, and
   * your catchup speed when using `sync-oldest`.
   **/
  maxRoundsToSync: number
  /** If the current tip of the configured Algorand blockchain is more than `maxRoundsToSync`
   * past `watermark` then how should that be handled:
   *  * `skip-to-newest`: Discard old blocks/transactions and sync the newest; useful
   *    for real-time notification scenarios where you don't care about history and
   *    are happy to lose old transactions.
   *  * `sync-oldest`: Sync from the oldest rounds forward `maxRoundsToSync` rounds
   *    using algod; note: this will be slow if you.
   *  * `catchup-with-indexer`: Sync to round `currentRound - maxRoundsToSync + 1`
   *    using indexer (much faster than using algod for long time periods) and then
   *    use algod from there.
   *  * `fail`: Throw an error.
   **/
  onMaxRounds: 'skip-to-newest' | 'sync-oldest' | 'catchup-with-indexer' | 'fail'
}

/** Specify a filter to apply to find transactions of interest. */
interface TransactionFilter {
  /** Filter based on the given transaction type. */
  type?: TransactionType
  /** Filter to transactions sent from the specified address. */
  sender?: string
  /** Filter to transactions being received by the specified address. */
  receiver?: string
  /** Filter to transactions with a note having the given prefix. */
  notePrefix?: string
  /** Filter to transactions against the app with the given ID. */
  appId?: number
  /** Filter to transactions that are creating an app. */
  appCreate?: boolean
  /** Filter to transactions that have given on complete(s). */
  appOnComplete?: ApplicationOnComplete | ApplicationOnComplete[]
  /** Filter to transactions against the asset with the given ID. */
  assetId?: number
  /** Filter to transactions that are creating an asset. */
  assetCreate?: boolean
  /** Filter to transactions where the amount being transferred is greater
   * than or equal to the given minimum (microAlgos or decimal units of an ASA). */
  minAmount?: number
  /** Filter to transactions where the amount being transferred is less than
   * or equal to the given maximum (microAlgos or decimal units of an ASA). */
  maxAmount?: number
}
```

The result of calling `getSubscribedTransactions` is a `TransactionSubscriptionResult`:

```typescript
/** The result of a single subscription pull/poll. */
export interface TransactionSubscriptionResult {
  /** The round range that was synced from/to */
  syncedRoundRange: [startRound: number, endRound: number]
  /** The current detected tip of the configured Algorand blockchain. */
  currentRound: number
  /** The new watermark value to persist for the next call to
   * `getSubscribedTransactions` to continue the sync.
   * Will be equal to `syncedRoundRange[1]`. */
  newWatermark: number
  /** Any transactions that matched the given filter within
   * the synced round range. This uses the [indexer transaction
   * format](https://developer.algorand.org/docs/rest-apis/indexer/#transaction)
   * to represent the data.
   */
  subscribedTransactions: TransactionResult[]
}
```

## Example

Here are some examples of how to use this method:

### Real-time notification of transactions of interest at the tip of the chain

If you ran the following code on a cron schedule of (say) every 5 seconds it would notify you every time the account (in this case the Data History Museum TestNet account `ER7AMZRPD5KDVFWTUUVOADSOWM4RQKEEV2EDYRVSA757UHXOIEKGMBQIVU`) sent a transaction.

```typescript
const algod = await algokit.getAlgoClient()
// You would need to implement getLastWatermark() to retrieve from a persistence store
const watermark = await getLastWatermark()
const subscription = await getSubscribedTransactions(
  {
    filter: {
      sender: 'ER7AMZRPD5KDVFWTUUVOADSOWM4RQKEEV2EDYRVSA757UHXOIEKGMBQIVU',
    },
    watermark,
    maxRoundsToSync: 100,
    onMaxRounds: 'skip-to-newest',
  },
  algod,
)
if (transactions.subscribedTransactions.length > 0) {
  // You would need to implement notifyTransactions to action the transactions
  await notifyTransactions(transactions.subscribedTransactions)
}
// You would need to implement saveWatermark to persist the watermark to the persistence store
await saveWatermark(transactions.newWatermark)
```

### Quickly building a reliable, up-to-date cache index of transactions of interest from the beginning of the chain

If you ran the following code on a cron schedule of (say) every 30 - 60 seconds it would create a cached index of all assets created by the account (in this case the Data History Museum TestNet account `ER7AMZRPD5KDVFWTUUVOADSOWM4RQKEEV2EDYRVSA757UHXOIEKGMBQIVU`). Given it uses indexer to catch up you can deploy this into a fresh environment with an empty database and it will catch up in seconds rather than days.

```typescript
const algod = await algokit.getAlgoClient()
const indexer = await algokit.getAlgoIndexerClient()
// You would need to implement getLastWatermark() to retrieve from a persistence store
const watermark = await getLastWatermark()
const subscription = await getSubscribedTransactions(
  {
    filter: {
      type: TransactionType.acfg,
      sender: 'ER7AMZRPD5KDVFWTUUVOADSOWM4RQKEEV2EDYRVSA757UHXOIEKGMBQIVU',
      assetCreate: true,
    },
    watermark,
    maxRoundsToSync: 1000,
    onMaxRounds: 'catchup-with-indexer',
  },
  algod,
  indexer,
)

if (transactions.subscribedTransactions.length > 0) {
  // You would need to implement saveTransactions to persist the transactions
  await saveTransactions(transactions.subscribedTransactions)
}
// You would need to implement saveWatermark to persist the watermark to the persistence store
await saveWatermark(transactions.newWatermark)
```
