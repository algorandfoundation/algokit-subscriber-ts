# AlgoKit Subscriber Examples

Hands-on examples demonstrating the full capabilities of `@algorandfoundation/algokit-subscriber` — from basic polling to ARC-28 events, inner transactions, and lifecycle hooks.

## Prerequisites

- **Node.js** >= 22
- **AlgoKit CLI** ([install guide](https://github.com/algorandfoundation/algokit-cli#install))
- **LocalNet** running via `algokit localnet start`

## Setup

1. Build the library from the repository root:

   ```bash
   npm run build
   ```

2. Install example dependencies:

   ```bash
   cd examples/subscriber
   npm ci
   ```

## Running an Example

```bash
npm run example 01-basic-poll-once.ts
```

## Examples

| # | File | Description |
|---|------|-------------|
| 01 | `01-basic-poll-once.ts` | Basic single-poll subscription with sender filter |
| 02 | `02-continuous-subscriber.ts` | Continuous polling with start/stop and event handlers |
| 03 | `03-payment-filters.ts` | Payment filters: sender, receiver, amount range, note prefix |
| 04 | `04-asset-transfer.ts` | ASA lifecycle: creation, opt-in, transfer subscription |
| 05 | `05-app-call.ts` | App call subscription: creation, ABI methods, on-complete filters |
| 06 | `06-multiple-filters.ts` | Multiple named filters with deduplication and filtersMatched |
| 07 | `07-balance-changes.ts` | Balance change filtering for ALGO and ASA transfers |
| 08 | `08-arc28-events.ts` | ARC-28 event parsing, filtering, and inspection |
| 09 | `09-inner-transactions.ts` | Inner transaction subscription and parent-child relationships |
| 10 | `10-batch-and-mappers.ts` | Mapper transforms with onBatch and on handler patterns |
| 11 | `11-watermark-persistence.ts` | File-backed watermark persistence across polls |
| 12 | `12-sync-behaviours.ts` | All 4 sync behaviours and maxRoundsToSync comparison |
| 13 | `13-custom-filters.ts` | Custom filter predicates with multi-condition logic |
| 14 | `14-stateless-subscriptions.ts` | Stateless getSubscribedTransactions for serverless patterns |
| 15 | `15-lifecycle-hooks.ts` | Lifecycle hooks (onBeforePoll, onPoll, onError) and retry patterns |

## Verification

Run all 15 examples and verify they pass:

```bash
./verify-all.sh
```

The script runs each example sequentially, tracks pass/fail with colored output, and prints a summary at the end. It exits non-zero if any example fails.

## Troubleshooting

- **LocalNet not running**: Start it with `algokit localnet start`
- **Build errors or stale dist**: Re-run `npm run build` from the repository root
- **Example failures or unexpected state**: Reset LocalNet to a clean state:

  ```bash
  algokit localnet reset
  ```

  Then re-run the failing example or the full verification script.
- **Type errors**: Run `npm run typecheck` to check for TypeScript issues

## Development

### Adding New Examples

1. Create a new file following the naming convention: `NN-descriptive-name.ts`
2. Add a JSDoc header at the top of the file (before imports)
3. Add the example to the table in this README
4. Run `./verify-all.sh` to ensure all examples still pass

### Example Header Format

Every example file should start with a JSDoc block before imports:

```typescript
/**
 * Example: [Title]
 *
 * This example demonstrates [description].
 * - Key capability 1
 * - Key capability 2
 *
 * Prerequisites:
 * - LocalNet running (via `algokit localnet start`)
 */
```
