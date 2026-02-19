/**
 * Example: Custom Filters
 *
 * This example demonstrates custom filter predicates with multi-condition logic.
 * - Use customFilter for complex matching (amount + note + sender allowlist)
 * - Compose customFilter with standard filter fields
 * - Inspect full SubscribedTransaction fields available in customFilter
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
  printHeader('13 — Custom Filters')

  // Step 1: Connect to LocalNet
  printStep(1, 'Connect to LocalNet')
  const algorand = AlgorandClient.fromConfig({
    algodConfig: ALGOD_CONFIG,
    kmdConfig: KMD_CONFIG,
  })
  const status = await algorand.client.algod.status()
  printInfo(`Current round: ${status.lastRound.toString()}`)
  printSuccess('Connected to LocalNet')

  // Step 2: Create 3 accounts (Alice, Bob, Charlie)
  printStep(2, 'Create and fund 3 accounts')
  const alice = await algorand.account.fromEnvironment('CUSTOM_ALICE', algo(100))
  const bob = await algorand.account.fromEnvironment('CUSTOM_BOB', algo(100))
  const charlie = await algorand.account.fromEnvironment('CUSTOM_CHARLIE', algo(100))
  const aliceAddr = alice.addr.toString()
  const bobAddr = bob.addr.toString()
  const charlieAddr = charlie.addr.toString()
  printInfo(`Alice: ${shortenAddress(aliceAddr)}`)
  printInfo(`Bob: ${shortenAddress(bobAddr)}`)
  printInfo(`Charlie: ${shortenAddress(charlieAddr)}`)
  printSuccess('3 accounts created and funded')

  // Step 3: Send 6 payments with varying amounts, notes, and senders
  printStep(3, 'Send 6 payments with varying senders, amounts, and notes')

  const allowlist = new Set([aliceAddr, bobAddr])

  const payments = [
    // Txn 1: Alice->Bob, 5 ALGO, "transfer-urgent"   => PASS (allowlisted, >=2 ALGO, "transfer" keyword)
    { sender: alice.addr, receiver: bob.addr, amount: microAlgo(5_000_000), note: 'transfer-urgent' },
    // Txn 2: Alice->Charlie, 1 ALGO, "transfer-low"   => FAIL (amount < 2 ALGO)
    { sender: alice.addr, receiver: charlie.addr, amount: microAlgo(1_000_000), note: 'transfer-low' },
    // Txn 3: Bob->Alice, 3 ALGO, "transfer-normal"    => PASS (allowlisted, >=2 ALGO, "transfer" keyword)
    { sender: bob.addr, receiver: alice.addr, amount: microAlgo(3_000_000), note: 'transfer-normal' },
    // Txn 4: Charlie->Bob, 4 ALGO, "transfer-big"     => FAIL (Charlie not in allowlist)
    { sender: charlie.addr, receiver: bob.addr, amount: microAlgo(4_000_000), note: 'transfer-big' },
    // Txn 5: Alice->Bob, 2 ALGO, "payment-misc"       => FAIL (note doesn't contain "transfer")
    { sender: alice.addr, receiver: bob.addr, amount: microAlgo(2_000_000), note: 'payment-misc' },
    // Txn 6: Bob->Charlie, 10 ALGO, "transfer-final"  => PASS (allowlisted, >=2 ALGO, "transfer" keyword)
    { sender: bob.addr, receiver: charlie.addr, amount: microAlgo(10_000_000), note: 'transfer-final' },
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

  // Step 4: customFilter only — multi-condition logic
  printStep(4, 'Custom filter: amount >= 2 ALGO AND note contains "transfer" AND sender in allowlist')

  const THRESHOLD = 2_000_000n // 2 ALGO in microAlgos

  const customOnlyTxns = await testFilter(
    'custom-only', {
      customFilter: (txn: SubscribedTransaction) => {
        const amount = txn.paymentTransaction?.amount ?? 0n
        const note = txn.note ? Buffer.from(txn.note).toString('utf-8') : ''
        const sender = txn.sender

        const amountOk = amount >= THRESHOLD
        const noteOk = note.includes('transfer')
        const senderOk = allowlist.has(sender)

        return amountOk && noteOk && senderOk
      },
    }, 3, 'Custom filter matched exactly 3 transactions (txns 1, 3, 6)',
  )

  console.log()

  // Print pass/fail for all 6 transactions
  printInfo(`Pass/Fail analysis: all 6 transactions`)
  for (const [i, p] of payments.entries()) {
    const amount = BigInt(p.amount.microAlgo)
    const note = p.note
    const sender = p.sender.toString()

    const amountOk = amount >= THRESHOLD
    const noteOk = note.includes('transfer')
    const senderOk = allowlist.has(sender)
    const passed = amountOk && noteOk && senderOk

    const reasons = []
    if (!amountOk) reasons.push(`amount ${formatMicroAlgo(amount)} < ${formatMicroAlgo(THRESHOLD)}`)
    if (!noteOk) reasons.push(`note "${note}" missing "transfer"`)
    if (!senderOk) reasons.push(`sender ${shortenAddress(sender)} not in allowlist`)

    const status = passed ? 'PASS' : 'FAIL'
    const detail = passed ? 'all conditions met' : reasons.join(', ')
    printInfo(`  Txn ${i + 1} [${status}]: ${detail}`)
  }

  // Step 5: Combine customFilter with standard filter fields
  printStep(5, 'Composition: sender=Alice (standard) + customFilter (amount >= 2 ALGO AND note contains "transfer")')

  // Alice sent txns 1, 2, 5. Of those, only txn 1 has amount >= 2 ALGO AND "transfer" in note
  const composedTxns = await testFilter(
    'composed', {
      sender: aliceAddr,
      customFilter: (txn: SubscribedTransaction) => {
        const amount = txn.paymentTransaction?.amount ?? 0n
        const note = txn.note ? Buffer.from(txn.note).toString('utf-8') : ''
        return amount >= THRESHOLD && note.includes('transfer')
      },
    }, 1, 'Composed filter matched 1 transaction (txn 1: Alice, 5 ALGO, "transfer-urgent")',
    (txn) => {
      const amount = txn.paymentTransaction?.amount ?? 0n
      const note = txn.note ? Buffer.from(txn.note).toString('utf-8') : ''
      printInfo(`  Matched: ${txn.id} | ${formatMicroAlgo(amount)} | note: "${note}"`)
    },
  )

  // Step 6: Show customFilter receives full SubscribedTransaction fields
  printStep(6, 'Inspect full SubscribedTransaction fields available in customFilter')

  const inspectedFields: string[] = []
  await testFilter('inspect', {
    customFilter: (txn: SubscribedTransaction) => {
      // Collect field names from the first transaction to show what's available
      if (inspectedFields.length === 0) {
        const fields = Object.keys(txn).filter((k) => txn[k as keyof SubscribedTransaction] !== undefined)
        inspectedFields.push(...fields)
      }
      return true // match all
    },
  })

  printInfo(`Available fields on SubscribedTransaction: ${inspectedFields.length.toString()}`)
  printInfo(`Fields: ${inspectedFields.join(', ')}`)
  printSuccess('customFilter receives fully decoded SubscribedTransaction with all fields')

  // Step 7: Summary
  printStep(7, 'Summary')
  printInfo(`Custom filter only: ${customOnlyTxns.length} matched (multi-condition: amount + note + sender allowlist)`)
  printInfo(`Composed filter: ${composedTxns.length} matched (standard sender + custom amount/note)`)
  printInfo(`Key takeaway: customFilter is AND-composed with standard filter fields`)
  printInfo(`Key takeaway: customFilter receives the full SubscribedTransaction with all decoded fields`)

  printHeader('Example complete')
}

main().catch((err) => {
  printError(err.message)
  process.exit(1)
})
