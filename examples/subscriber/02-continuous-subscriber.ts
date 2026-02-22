/**
 * Example: Continuous Subscriber
 *
 * This example demonstrates continuous polling with start/stop and event handlers.
 * - Create a subscriber with frequencyInSeconds and waitForBlockWhenAtTip
 * - Register event handlers with subscriber.on()
 * - Start continuous polling with subscriber.start()
 * - Graceful shutdown with signal handlers
 *
 * Prerequisites:
 * - LocalNet running (via `algokit localnet start`)
 */
import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { printHeader, printStep, printInfo, printSuccess, printError, shortenAddress } from './shared/utils.js'

async function main() {
  printHeader('02 — Continuous Subscriber')

  // Step 1: Set up AlgorandClient for LocalNet
  printStep(1, 'Connect to LocalNet')
  const algorand = AlgorandClient.defaultLocalNet()
  const status = await algorand.client.algod.status()
  printInfo(`Current round: ${status.lastRound.toString()}`)
  printSuccess('Connected to LocalNet')

  // Step 2: Fund a sender account via KMD
  printStep(2, 'Create and fund sender account')
  const sender = await algorand.account.fromEnvironment('CONTINUOUS_SENDER', algo(10))
  const senderAddr = sender.addr.toString()
  printInfo(`Sender: ${shortenAddress(senderAddr)}`)

  // Step 3: Create subscriber with continuous polling config
  printStep(3, 'Create AlgorandSubscriber')
  let watermark = 0n

  const subscriber = new AlgorandSubscriber(
    {
      filters: [
        {
          name: 'payments',
          filter: {
            sender: senderAddr,
          },
        },
      ],
      frequencyInSeconds: 1,
      waitForBlockWhenAtTip: true,
      syncBehaviour: 'sync-oldest-start-now',
      watermarkPersistence: {
        get: async () => watermark,
        set: async (w: bigint) => {
          watermark = w
        },
      },
    },
    algorand.client.algod,
  )
  printInfo(`frequencyInSeconds: 1`)
  printInfo(`waitForBlockWhenAtTip: true`)
  printInfo(`syncBehaviour: sync-oldest-start-now`)
  printSuccess('Subscriber created')

  // Step 4: Register event handler for matched payments
  printStep(4, 'Register event handlers')
  const matchedTxns: string[] = []

  subscriber.on('payments', (txn) => {
    matchedTxns.push(txn.id)
    printInfo(`Matched payment: ${txn.id}`)
  })
  printSuccess('Registered on("payments") listener')

  // Step 5: Register SIGINT/SIGTERM handlers for graceful shutdown
  printStep(5, 'Register signal handlers')
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
  for (const signal of signals) {
    process.on(signal, async () => {
      printInfo(`Signal received: ${signal}`)
      await subscriber.stop(signal)
      process.exit(0)
    })
  }
  printSuccess('Registered SIGINT and SIGTERM handlers')

  // Step 6: Start continuous polling with inspect callback
  printStep(6, 'Start continuous subscriber')

  subscriber.start((pollResult) => {
    printInfo(
      `Poll: round range [${pollResult.syncedRoundRange[0]}, ${pollResult.syncedRoundRange[1]}] — ` +
        `${pollResult.subscribedTransactions.length} matched, watermark ${pollResult.newWatermark}`,
    )
  })
  printSuccess('Subscriber started')

  // Step 7: Send 3 payment transactions with short delays
  printStep(7, 'Send 3 payment transactions')

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  for (let i = 1; i <= 3; i++) {
    const result = await algorand.send.payment({
      sender: sender.addr,
      receiver: sender.addr,
      amount: algo(1),
      note: `continuous txn ${i}`,
    })
    printInfo(`Txn ${i} ID: ${result.txIds.at(-1)}`)
    printInfo(`Txn ${i} round: ${result.confirmation!.confirmedRound!.toString()}`)
    await delay(500)
  }
  printSuccess('Sent 3 payment transactions')

  // Step 8: Auto-stop after ~4 seconds
  printStep(8, 'Wait for subscriber to catch up, then stop')

  await new Promise<void>((resolve) => {
    setTimeout(async () => {
      printInfo(`Auto-stop: stopping after ~4 seconds`)
      await subscriber.stop('example-done')
      resolve()
    }, 4000)
  })

  // Step 9: Verify at least 3 matched transactions
  printStep(9, 'Verify matched transactions')
  printInfo(`Total matched: ${matchedTxns.length.toString()}`)

  if (matchedTxns.length < 3) {
    printError(`Expected at least 3 matched transactions, got ${matchedTxns.length}`)
    throw new Error(`Expected at least 3 matched transactions, got ${matchedTxns.length}`)
  }
  printSuccess(`${matchedTxns.length} transactions matched (>= 3)`)

  for (const id of matchedTxns) {
    printInfo(`Matched txn: ${id}`)
  }

  printHeader('Example complete')
  process.exit(0)
}

main().catch((err) => {
  printError(err.message)
  process.exit(1)
})
