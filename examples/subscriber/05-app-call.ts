/**
 * Example: App Call Subscription
 *
 * This example demonstrates application call subscription.
 * - Subscribe to app creation with appCreate filter
 * - Filter by methodSignature for specific ABI methods
 * - Filter by appOnComplete for opt-in calls
 * - Use appCallArgumentsMatch for custom argument inspection
 *
 * Prerequisites:
 * - LocalNet running (via `algokit localnet start`)
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { algo, AlgorandClient, AppFactory } from '@algorandfoundation/algokit-utils'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { printHeader, printStep, printInfo, printSuccess, printError, shortenAddress } from './shared/utils.js'
import { ALGOD_CONFIG, KMD_CONFIG } from './shared/constants.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  printHeader('05 — App Call Subscription')

  // Step 1: Connect to LocalNet
  printStep(1, 'Connect to LocalNet')
  const algorand = AlgorandClient.fromConfig({
    algodConfig: ALGOD_CONFIG,
    kmdConfig: KMD_CONFIG,
  })
  const status = await algorand.client.algod.status()
  printInfo(`Current round: ${status.lastRound.toString()}`)
  printSuccess('Connected to LocalNet')

  // Step 2: Create and fund an account
  printStep(2, 'Create and fund account')
  const creator = await algorand.account.fromEnvironment('APP_CREATOR', algo(100))
  const creatorAddr = creator.addr.toString()
  printInfo(`Creator: ${shortenAddress(creatorAddr)}`)
  printSuccess('Account created and funded')

  // Step 3: Deploy TestingApp using AppFactory with embedded ARC-56 spec
  printStep(3, 'Deploy TestingApp via AppFactory')
  const appSpec = JSON.parse(
    readFileSync(join(__dirname, 'shared/artifacts/testing-app.arc56.json'), 'utf-8'),
  )
  const factory = new AppFactory({
    appSpec,
    algorand,
    defaultSender: creator.addr,
  })
  const { result: createResult, appClient } = await factory.send.bare.create({
    sender: creator.addr,
  })
  const appId = createResult.appId
  const createRound = createResult.confirmation.confirmedRound!
  printInfo(`App ID: ${appId.toString()}`)
  printInfo(`Create round: ${createRound.toString()}`)
  printSuccess('TestingApp deployed')

  // Step 4: Make ABI method calls (non-readonly methods produce on-chain transactions)
  printStep(4, 'Make ABI method calls')

  // set_global(uint64,uint64,string,byte[4])void — NoOp
  const setGlobalResult = await appClient.send.call({
    method: 'set_global',
    args: [1n, 2n, 'test', new Uint8Array([0, 1, 2, 3])],
    sender: creator.addr,
  })
  printInfo(`set_global txn: ${setGlobalResult.txIds[0]}`)

  // emitSwapped(uint64,uint64)void — NoOp (emits ARC-28 event)
  const emitResult = await appClient.send.call({
    method: 'emitSwapped',
    args: [42n, 99n],
    sender: creator.addr,
  })
  printInfo(`emitSwapped txn: ${emitResult.txIds[0]}`)

  // opt_in()void — OptIn on-complete
  const optInResult = await appClient.send.optIn({
    method: 'opt_in',
    args: [],
    sender: creator.addr,
  })
  printInfo(`opt_in txn: ${optInResult.txIds[0]}`)
  printSuccess('3 ABI method calls sent')

  // Watermark: just before the app creation round
  const watermarkBefore = createRound - 1n

  // Helper: create a subscriber, poll once, return matched transactions
  async function pollWithFilter(name: string, filter: Record<string, unknown>) {
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
      algorand.client.algod as any,
    )
    const result = await subscriber.pollOnce()
    return result.subscribedTransactions
  }

  // Step 5: Subscribe with appCreate: true — matches app creation
  printStep(5, 'Filter: appCreate = true')
  const createTxns = await pollWithFilter('app-create', { appCreate: true })
  printInfo(`Matched count: ${createTxns.length.toString()}`)
  for (const txn of createTxns) {
    const appTxn = txn.applicationTransaction
    printInfo(`  Created app: ${txn.createdAppId} | onComplete: ${appTxn?.onCompletion} | txn: ${txn.id}`)
  }
  if (createTxns.length !== 1) {
    throw new Error(`appCreate filter: expected 1 match, got ${createTxns.length}`)
  }
  printSuccess('appCreate filter matched 1 app creation transaction')

  // Step 6: Subscribe with appId + methodSignature — matches specific ABI method calls
  printStep(6, 'Filter: appId + methodSignature = set_global')
  const methodTxns = await pollWithFilter('set-global-method', {
    appId: appId,
    methodSignature: 'set_global(uint64,uint64,string,byte[4])void',
  })
  printInfo(`Matched count: ${methodTxns.length.toString()}`)
  for (const txn of methodTxns) {
    const appArgs = txn.applicationTransaction?.applicationArgs
    const selectorHex = appArgs && appArgs.length > 0 ? Buffer.from(appArgs[0].slice(0, 4)).toString('hex') : 'N/A'
    printInfo(
      `  Method call: selector: 0x${selectorHex} | filters: [${txn.filtersMatched?.join(', ')}] | txn: ${txn.id}`,
    )
  }
  if (methodTxns.length !== 1) {
    throw new Error(`methodSignature filter: expected 1 match, got ${methodTxns.length}`)
  }
  printSuccess('methodSignature filter matched 1 set_global call')

  // Step 7: Subscribe with appOnComplete filter — matches by on-complete type
  printStep(7, 'Filter: appOnComplete = optin')
  const optInTxns = await pollWithFilter('optin-calls', {
    appOnComplete: 'optin',
  })
  printInfo(`Matched count: ${optInTxns.length.toString()}`)
  for (const txn of optInTxns) {
    const appTxn = txn.applicationTransaction
    printInfo(
      `  OptIn call: app: ${appTxn?.applicationId} | onComplete: ${appTxn?.onCompletion} | filters: [${txn.filtersMatched?.join(', ')}] | txn: ${txn.id}`,
    )
  }
  if (optInTxns.length !== 1) {
    throw new Error(`appOnComplete filter: expected 1 match, got ${optInTxns.length}`)
  }
  printSuccess('appOnComplete filter matched 1 opt-in transaction')

  // Step 8: Demonstrate appCallArgumentsMatch predicate — custom arg inspection
  // Match emitSwapped calls by checking the method selector in the first app arg
  printStep(8, 'Filter: appCallArgumentsMatch predicate')
  const emitSwappedSelector = 'd43cee5d' // method selector for emitSwapped(uint64,uint64)void
  const argMatchTxns = await pollWithFilter('arg-match', {
    appId: appId,
    appCallArgumentsMatch: (args?: readonly Uint8Array[]) => {
      if (!args || args.length === 0) return false
      const selectorHex = Buffer.from(args[0].slice(0, 4)).toString('hex')
      return selectorHex === emitSwappedSelector
    },
  })
  printInfo(`Matched count: ${argMatchTxns.length.toString()}`)
  for (const txn of argMatchTxns) {
    const appArgs = txn.applicationTransaction?.applicationArgs
    if (appArgs && appArgs.length > 0) {
      const selectorHex = Buffer.from(appArgs[0].slice(0, 4)).toString('hex')
      printInfo(
        `  Arg match: selector: 0x${selectorHex} | filters: [${txn.filtersMatched?.join(', ')}] | txn: ${txn.id}`,
      )
    }
  }
  if (argMatchTxns.length !== 1) {
    throw new Error(`appCallArgumentsMatch filter: expected 1 match, got ${argMatchTxns.length}`)
  }
  printSuccess('appCallArgumentsMatch predicate matched 1 emitSwapped call')

  // Step 9: Summary
  printStep(9, 'Summary')
  printInfo(`App ID: ${appId.toString()}`)
  printInfo(`appCreate filter: ${createTxns.length} matched (creation)`)
  printInfo(`methodSignature filter: ${methodTxns.length} matched (set_global)`)
  printInfo(`appOnComplete filter: ${optInTxns.length} matched (opt-in)`)
  printInfo(`appCallArgumentsMatch filter: ${argMatchTxns.length} matched (emitSwapped by selector)`)

  printHeader('Example complete')
}

main().catch((err) => {
  printError(err.message)
  process.exit(1)
})
