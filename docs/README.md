# Algorand transaction subscription / indexing

## Quick start

```typescript
// Create subscriber
const subscriber = new AlgorandSubscriber(
  {
    /* ... options (use intellisense to explore) */
  },
  algod,
  optionalIndexer,
)

// Set up subscription(s)
subscriber.on('eventNameFromOptions', async (transaction) => {
  // ...
})
//...

// Either: Start the subscriber (if in long-running process)
subscriber.start()

// OR: Poll the subscriber (if in cron job / periodic lambda)
subscriber.pollOnce()
```

## Capabilities

- [`AlgorandSubscriber`](./subscriber.md)
- [`getSubscribedTransactions`](./subscriptions.md)

## Reference docs

[See reference docs](./code/README.md).
