/**
 * Example: Basic Poll Once
 *
 * This example demonstrates single-poll subscription with a sender filter.
 * - Create an AlgorandSubscriber with an in-memory watermark
 * - Poll once and inspect the result
 * - Verify matched transactions
 *
 * Prerequisites:
 * - LocalNet running (via `algokit localnet start`)
 */
import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { printHeader, printStep, printInfo, printSuccess, printError, shortenAddress } from './shared/utils.js'
import { ALGOD_CONFIG, KMD_CONFIG } from './shared/constants.js'

async function main() {
  printHeader('01 — Basic Poll Once')

  // Step 1: Set up AlgorandClient for LocalNet
  printStep(1, 'Connect to LocalNet')
  const algorand = AlgorandClient.fromConfig({
    algodConfig: ALGOD_CONFIG,
    kmdConfig: KMD_CONFIG,
  })
  const status = await algorand.client.algod.status()
  printInfo(`Current round: ${status.lastRound.toString()}`)
  printSuccess('Connected to LocalNet')

  // Step 2: Fund a sender account via KMD
  printStep(2, 'Create and fund sender account')
  const sender = await algorand.account.fromEnvironment('POLL_ONCE_SENDER', algo(10))
  const senderAddr = sender.addr.toString()
  printInfo(`Sender: ${shortenAddress(senderAddr)}`)

  // Step 3: Send 2 payment transactions
  printStep(3, 'Send 2 payment transactions')
  const txn1 = await algorand.send.payment({
    sender: sender.addr,
    receiver: sender.addr,
    amount: algo(1),
    note: 'poll-once txn 1',
  })
  printInfo(`Txn 1 ID: ${txn1.transaction.txId()}`)
  printInfo(`Txn 1 round: ${txn1.confirmation!.confirmedRound!.toString()}`)

  const txn2 = await algorand.send.payment({
    sender: sender.addr,
    receiver: sender.addr,
    amount: algo(1),
    note: 'poll-once txn 2',
  })
  printInfo(`Txn 2 ID: ${txn2.transaction.txId()}`)
  printInfo(`Txn 2 round: ${txn2.confirmation!.confirmedRound!.toString()}`)
  printSuccess('Sent 2 payment transactions')

  // Step 4: Create subscriber with in-memory watermark
  printStep(4, 'Create AlgorandSubscriber')
  const watermarkBefore = txn1.confirmation!.confirmedRound! - 1n
  let watermark = watermarkBefore

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
      syncBehaviour: 'sync-oldest',
      maxRoundsToSync: 100,
      watermarkPersistence: {
        get: async () => watermark,
        set: async (w: bigint) => {
          watermark = w
        },
      },
    },
    algorand.client.algod,
  )
  printInfo(`Sync behaviour: sync-oldest`)
  printInfo(`Initial watermark: ${watermarkBefore.toString()}`)
  printSuccess('Subscriber created')

  // Step 5: Poll once and inspect result
  printStep(5, 'Poll once and inspect result')
  const result = await subscriber.pollOnce()

  printInfo(`syncedRoundRange: [${result.syncedRoundRange[0]}, ${result.syncedRoundRange[1]}]`)
  printInfo(`currentRound: ${result.currentRound.toString()}`)
  printInfo(`startingWatermark: ${result.startingWatermark.toString()}`)
  printInfo(`newWatermark: ${result.newWatermark.toString()}`)
  printInfo(`subscribedTransactions count: ${result.subscribedTransactions.length.toString()}`)

  // Step 6: Log block metadata
  printStep(6, 'Block metadata')
  if (result.blockMetadata && result.blockMetadata.length > 0) {
    for (const block of result.blockMetadata) {
      printInfo(`Block round: ${block.round.toString()}`)
      printInfo(`Block timestamp: ${new Date(block.timestamp * 1000).toISOString()}`)
      if (block.proposer) {
        printInfo(`Block proposer: ${shortenAddress(block.proposer)}`)
      }
    }
  } else {
    printInfo(`Block metadata: none returned`)
  }

  // Step 7: Verify exactly 2 transactions matched
  printStep(7, 'Verify matched transactions')
  if (result.subscribedTransactions.length !== 2) {
    printError(`Expected 2 transactions, got ${result.subscribedTransactions.length}`)
    throw new Error(`Expected 2 matched transactions, got ${result.subscribedTransactions.length}`)
  }
  printSuccess('Exactly 2 transactions matched')

  // Step 8: Print matched transaction IDs
  printStep(8, 'Matched transaction IDs')
  for (const txn of result.subscribedTransactions) {
    printInfo(`Matched txn: ${txn.id}`)
  }

  printHeader('Example complete')
}

main().catch((err) => {
  printError(err.message)
  process.exit(1)
})
