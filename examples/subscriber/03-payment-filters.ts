/**
 * Example: Payment Filters
 *
 * This example demonstrates payment transaction filters.
 * - Filter by sender, receiver, amount range, and note prefix
 * - Verify each filter matches the expected transactions
 *
 * Prerequisites:
 * - LocalNet running (via `algokit localnet start`)
 */
import { algo, AlgorandClient, microAlgo } from '@algorandfoundation/algokit-utils'
import {
  printHeader, printStep, printInfo, printSuccess, printError, shortenAddress, formatMicroAlgo,
  createFilterTester, type SubscribedTransaction,
} from './shared/utils.js'
import { ALGOD_CONFIG, KMD_CONFIG } from './shared/constants.js'

async function main() {
  printHeader('03 — Payment Filters')

  // Step 1: Connect to LocalNet
  printStep(1, 'Connect to LocalNet')
  const algorand = AlgorandClient.fromConfig({
    algodConfig: ALGOD_CONFIG,
    kmdConfig: KMD_CONFIG,
  })
  const status = await algorand.client.algod.status()
  printInfo(`Current round: ${status.lastRound.toString()}`)
  printSuccess('Connected to LocalNet')

  // Step 2: Create 3 accounts (A, B, C)
  printStep(2, 'Create and fund 3 accounts (A, B, C)')
  const accountA = await algorand.account.fromEnvironment('FILTER_A', algo(100))
  const accountB = await algorand.account.fromEnvironment('FILTER_B', algo(100))
  const accountC = await algorand.account.fromEnvironment('FILTER_C', algo(100))
  const addrA = accountA.addr.toString()
  const addrB = accountB.addr.toString()
  const addrC = accountC.addr.toString()
  printInfo(`Account A: ${shortenAddress(addrA)}`)
  printInfo(`Account B: ${shortenAddress(addrB)}`)
  printInfo(`Account C: ${shortenAddress(addrC)}`)
  printSuccess('3 accounts created and funded')

  // Step 3: Send 5 payments with varying senders, receivers, amounts, and notes
  printStep(3, 'Send 5 payments with varying parameters')

  const payments = [
    { sender: accountA.addr, receiver: accountB.addr, amount: microAlgo(1_000_000), note: 'invoice-001' },
    { sender: accountA.addr, receiver: accountC.addr, amount: microAlgo(5_000_000), note: 'invoice-002' },
    { sender: accountB.addr, receiver: accountA.addr, amount: microAlgo(2_000_000), note: 'receipt-001' },
    { sender: accountC.addr, receiver: accountB.addr, amount: microAlgo(3_000_000), note: 'invoice-003' },
    { sender: accountA.addr, receiver: accountB.addr, amount: microAlgo(500_000), note: 'receipt-002' },
  ]

  const txnResults = []
  for (const [i, p] of payments.entries()) {
    const result = await algorand.send.payment({
      sender: p.sender,
      receiver: p.receiver,
      amount: p.amount,
      note: p.note,
    })
    txnResults.push(result)
    printInfo(
      `Txn ${i + 1}: ${shortenAddress(p.sender.toString())} -> ${shortenAddress(p.receiver.toString())} | ${formatMicroAlgo(p.amount.microAlgo)} | note: "${p.note}"`,
    )
  }
  printSuccess(`Sent ${payments.length} payments`)

  // Record watermark before first txn
  const watermarkBefore = txnResults[0].confirmation!.confirmedRound! - 1n

  const testFilter = createFilterTester(algorand.client.algod, watermarkBefore)
  const formatPayment = (txn: SubscribedTransaction) => {
    const amount = txn.paymentTransaction?.amount ?? 0
    const note = txn.note ? Buffer.from(txn.note).toString('utf-8') : ''
    printInfo(`  Matched: ${txn.id} | amount: ${formatMicroAlgo(amount)} | note: "${note}"`)
  }

  // Step 4: Filter by sender (A only)
  printStep(4, 'Filter: sender = A')
  const senderATxns = await testFilter(
    'sender-a', { sender: addrA }, 3,
    'Sender filter matched 3 payments from A', formatPayment,
  )

  // Step 5: Filter by receiver (B only)
  printStep(5, 'Filter: receiver = B')
  const receiverBTxns = await testFilter(
    'receiver-b', { receiver: addrB }, 3,
    'Receiver filter matched 3 payments to B', formatPayment,
  )

  // Step 6: Filter by minAmount/maxAmount range (1_000_000 to 3_000_000 microAlgo)
  printStep(6, 'Filter: minAmount=1000000, maxAmount=3000000')
  // Payments in range [1M, 3M]: txn1 (1M), txn3 (2M), txn4 (3M) = 3
  const rangeTxns = await testFilter(
    'amount-range', { minAmount: 1_000_000, maxAmount: 3_000_000 }, 3,
    'Amount range filter matched 3 payments in [1M, 3M] microAlgo', formatPayment,
  )

  // Step 7: Filter by notePrefix ("invoice")
  printStep(7, 'Filter: notePrefix = "invoice"')
  // Txns with "invoice" prefix: txn1, txn2, txn4 = 3
  const invoiceTxns = await testFilter(
    'note-prefix', { notePrefix: 'invoice' }, 3,
    'Note prefix filter matched 3 payments with "invoice" prefix', formatPayment,
  )

  // Step 8: Summary
  printStep(8, 'Summary')
  printInfo(`Sender=A filter: ${senderATxns.length} matched`)
  printInfo(`Receiver=B filter: ${receiverBTxns.length} matched`)
  printInfo(`Amount [1M,3M] filter: ${rangeTxns.length} matched`)
  printInfo(`notePrefix="invoice" filter: ${invoiceTxns.length} matched`)

  printHeader('Example complete')
}

main().catch((err) => {
  printError(err.message)
  process.exit(1)
})
