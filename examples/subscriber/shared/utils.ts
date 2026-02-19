import { AlgoAmount } from '@algorandfoundation/algokit-utils'
import type { AlgodClient } from '@algorandfoundation/algokit-utils/algod-client'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import type { SubscribedTransaction } from '@algorandfoundation/algokit-subscriber/types/subscription'

export type { SubscribedTransaction }

// ============================================================
// Console Output Helpers
// ============================================================

/** Print a section header with a decorative border */
export function printHeader(title: string): void {
  const line = '='.repeat(60)
  console.log(`\n${line}`)
  console.log(`  🚀 ${title}`)
  console.log(`${line}\n`)
}

/** Print a numbered step description */
export function printStep(step: number, description: string): void {
  console.log(`\n📋 Step ${step}: ${description}`)
}

/** Print an informational message */
export function printInfo(message: string): void {
  console.log(`  ℹ️  ${message}`)
}

/** Print a success message */
export function printSuccess(message: string): void {
  console.log(`  ✅ ${message}`)
}

/** Print an error message */
export function printError(message: string): void {
  console.log(`  ❌ ${message}`)
}

// ============================================================
// Formatting Helpers
// ============================================================

/** Format a microAlgo amount as ALGO with configurable decimal places */
export function formatAlgo(amount: AlgoAmount | bigint | number, decimals = 6): string {
  const microAlgos = amount instanceof AlgoAmount ? amount.microAlgo : Number(amount)
  const value = Number(microAlgos) / 1e6
  return `${value.toFixed(decimals)} ALGO`
}

/** Format a microAlgo amount with locale-formatted number */
export function formatMicroAlgo(microAlgos: number | bigint): string {
  return `${Number(microAlgos).toLocaleString('en-US')} microALGO`
}

/** Shorten an Algorand address for display */
export function shortenAddress(address: string, prefixLength = 6, suffixLength = 4): string {
  if (address.length <= prefixLength + suffixLength) return address
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
}

// ============================================================
// Filter Testing Helper
// ============================================================

/** Create a filter-testing function bound to an algod client and watermark */
export function createFilterTester(algod: AlgodClient, watermarkBefore: bigint) {
  return async function testFilter(
    name: string,
    filter: Record<string, unknown>,
    expected?: number,
    successMsg?: string,
    formatTxn?: (txn: SubscribedTransaction) => void,
  ): Promise<SubscribedTransaction[]> {
    let watermark = watermarkBefore
    const subscriber = new AlgorandSubscriber(
      {
        filters: [{ name, filter }],
        syncBehaviour: 'sync-oldest',
        maxRoundsToSync: 100,
        watermarkPersistence: {
          get: async () => watermark,
          set: async (w: bigint) => {
            watermark = w
          },
        },
      },
      algod,
    )
    const result = await subscriber.pollOnce()
    const txns = result.subscribedTransactions

    printInfo(`Matched count: ${txns.length.toString()}`)
    if (formatTxn) {
      for (const txn of txns) {
        formatTxn(txn)
      }
    }
    if (expected !== undefined && txns.length !== expected) {
      throw new Error(`${name} filter: expected ${expected} matches, got ${txns.length}`)
    }
    if (successMsg) {
      printSuccess(successMsg)
    }
    return txns
  }
}
