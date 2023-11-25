# Algorand transaction subscription / indexing

This is a proof-of-concept for a simple, but flexible / configurable Algorand transaction subscription / indexing solution.

- `npm install`
- Copy `.env.sample` to `.env` and edit to point to the Algorand node you want to point to
- Edit the filter in `index.ts` to change the syncing characteristics
- `npm run dev` or F5 in Visual Studio Code to get breakpoint debugging

If you want to keep running the sync continuously, you can run `npm run watch`.

[Documentation](./docs/README.md)

## Examples

### Data History Museum index

The following code, when algod is pointed to TestNet, will find all transactions emitted by the [Data History Museum](https://datahistory.org) since the beginning of time in _seconds_ and then find them in real-time as they emerge on the chain.

The watermark is stored in-memory so this particular example is not resilient to restarts. To change that you can implement proper persistence of the watermark. There is [an example that uses the file system](./examples/data-history-museum/) to demonstrate this.

```typescript
const algod = await algokit.getAlgoClient()
const indexer = await algokit.getAlgoIndexerClient()
let watermark = 0
const subscriber = new AlgorandSubscriber(
  {
    events: [
      {
        eventName: 'dhm-asset',
        filter: {
          type: TransactionType.acfg,
          // Data History Museum creator account on TestNet
          sender: 'ER7AMZRPD5KDVFWTUUVOADSOWM4RQKEEV2EDYRVSA757UHXOIEKGMBQIVU',
        },
      },
    ],
    frequencyInSeconds: 5,
    maxRoundsToSync: 100,
    syncBehaviour: 'catchup-with-indexer',
    watermarkPersistence: {
      get: async () => watermark,
      set: async (newWatermark) => {
        watermark = newWatermark
      },
    },
  },
  algod,
  indexer,
)
subscriber.onBatch('dhm-asset', async (events) => {
  console.log(`Received ${events.length} asset changes`)
  // ... do stuff with the events
})

subscriber.start()
```

### USDC real-time monitoring

The following code, when algod is pointed to MainNet, will find all transfers of [USDC](https://www.circle.com/en/usdc-multichain/algorand) that are greater than $1 and it will poll every 1s for new transfers.

```typescript
const algod = await algokit.getAlgoClient()
const indexer = await algokit.getAlgoIndexerClient()
let watermark = 0

const subscriber = new AlgorandSubscriber(
  {
    events: [
      {
        eventName: 'usdc',
        filter: {
          type: TransactionType.axfer,
          assetId: 31566704, // MainNet: USDC
          minAmount: 1_000_000, // $1
        },
      },
    ],
    frequencyInSeconds: 1,
    maxRoundsToSync: 100,
    syncBehaviour: 'skip-to-newest',
    watermarkPersistence: {
      get: async () => watermark,
      set: async (newWatermark) => {
        watermark = newWatermark
      },
    },
  },
  algod,
  indexer,
)
subscriber.on('usdc', (transfer) => {
  // eslint-disable-next-line no-console
  console.log(
    `${transfer.sender} sent ${transfer['asset-transfer-transaction']?.receiver} USDC$${(
      (transfer['asset-transfer-transaction']?.amount ?? 0) / 1_000_000
    ).toFixed(2)} in transaction ${transfer.id}`,
  )
})

subscriber.start()
```

# Roadmap

- Contract events via logs
- Multiple (named?) filters
- Pub sub style? web3.js
- Dynamic filters
- GraphQL example ideally with subscriptions
- Inner transaction processing
