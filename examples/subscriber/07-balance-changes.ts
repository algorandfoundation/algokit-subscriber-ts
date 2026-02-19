/**
 * Example: Balance Change Tracking
 *
 * This example demonstrates balance change filtering for ALGO and ASA transfers.
 * - Filter by assetId, role, and minAbsoluteAmount
 * - Inspect balanceChanges array on matched transactions
 * - Explore BalanceChangeRole enum values
 *
 * Prerequisites:
 * - LocalNet running (via `algokit localnet start`)
 */
import { algo, AlgorandClient, microAlgo } from '@algorandfoundation/algokit-utils'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { BalanceChangeRole } from '@algorandfoundation/algokit-subscriber/types/subscription'
import { printHeader, printStep, printInfo, printSuccess, printError, shortenAddress, formatMicroAlgo } from './shared/utils.js'
import { ALGOD_CONFIG, KMD_CONFIG } from './shared/constants.js'

async function main() {
  printHeader('07 — Balance Change Tracking')

  // Step 1: Connect to LocalNet
  printStep(1, 'Connect to LocalNet')
  const algorand = AlgorandClient.fromConfig({
    algodConfig: ALGOD_CONFIG,
    kmdConfig: KMD_CONFIG,
  })
  const status = await algorand.client.algod.status()
  printInfo(`Current round: ${status.lastRound.toString()}`)
  printSuccess('Connected to LocalNet')

  // Step 2: Create accounts
  printStep(2, 'Create and fund accounts')
  const sender = await algorand.account.fromEnvironment('BAL_SENDER', algo(100))
  const receiver = await algorand.account.fromEnvironment('BAL_RECEIVER', algo(10))
  const senderAddr = sender.addr.toString()
  const receiverAddr = receiver.addr.toString()
  printInfo(`Sender: ${shortenAddress(senderAddr)}`)
  printInfo(`Receiver: ${shortenAddress(receiverAddr)}`)
  printSuccess('Accounts created and funded')

  // Step 3: Create an ASA for asset transfer testing
  printStep(3, 'Create ASA and opt in receiver')
  const asaResult = await algorand.send.assetCreate({
    sender: sender.addr,
    total: 1_000_000n,
    decimals: 0,
    assetName: 'BalTestToken',
    unitName: 'BTT',
  })
  const assetId = asaResult.assetId
  printInfo(`Asset ID: ${assetId.toString()}`)

  await algorand.send.assetOptIn({ sender: receiver.addr, assetId })
  printSuccess('Receiver opted in to ASA')

  // Step 4: Send Algo payments and ASA transfers
  printStep(4, 'Send Algo payments and ASA transfers')

  // Payment 1: Sender -> Receiver, 5 ALGO
  const pay1 = await algorand.send.payment({
    sender: sender.addr,
    receiver: receiver.addr,
    amount: algo(5),
    note: 'bal-pay-1',
  })
  printInfo(`Txn 1: Sender -> Receiver, 5 ALGO`)

  // Payment 2: Sender -> Receiver, 2 ALGO
  const pay2 = await algorand.send.payment({
    sender: sender.addr,
    receiver: receiver.addr,
    amount: algo(2),
    note: 'bal-pay-2',
  })
  printInfo(`Txn 2: Sender -> Receiver, 2 ALGO`)

  // ASA Transfer: Sender -> Receiver, 500 tokens
  const axfer1 = await algorand.send.assetTransfer({
    sender: sender.addr,
    receiver: receiver.addr,
    assetId,
    amount: 500n,
    note: 'bal-axfer-1',
  })
  printInfo(`Txn 3: Sender -> Receiver, 500 BTT (ASA)`)
  printSuccess('All transactions sent')

  // Step 5: Subscribe with balanceChanges filter — Algo Sender with minAbsoluteAmount
  printStep(5, 'Filter: Algo balance changes for Sender role with minAbsoluteAmount')
  const watermarkBefore = pay1.confirmation!.confirmedRound! - 1n
  let watermark1 = watermarkBefore

  const algoSenderSub = new AlgorandSubscriber(
    {
      filters: [
        {
          name: 'algo-sender-changes',
          filter: {
            balanceChanges: [
              {
                assetId: 0n,
                role: BalanceChangeRole.Sender,
                minAbsoluteAmount: 2_000_000,
              },
            ],
          },
        },
      ],
      syncBehaviour: 'sync-oldest',
      maxRoundsToSync: 100,
      watermarkPersistence: {
        get: async () => watermark1,
        set: async (w: bigint) => { watermark1 = w },
      },
    },
    algorand.client.algod,
  )

  const algoSenderResult = await algoSenderSub.pollOnce()
  const algoSenderTxns = algoSenderResult.subscribedTransactions
  printInfo(`Matched transactions: ${algoSenderTxns.length.toString()}`)

  // Both pay1 (5 ALGO) and pay2 (2 ALGO) should match — sender loses >= 2 ALGO (amount + fee)
  // The ASA transfer only moves tokens, but the sender also pays a fee in Algo
  for (const txn of algoSenderTxns) {
    const note = txn.note ? Buffer.from(txn.note).toString('utf-8') : ''
    printInfo(`  ${note}: id=${txn.id.slice(0, 12)}...`)
  }
  if (algoSenderTxns.length < 2) {
    throw new Error(`Expected at least 2 Algo Sender transactions (>= 2M microAlgo), got ${algoSenderTxns.length}`)
  }
  printSuccess('Algo Sender filter matched expected transactions')

  // Step 6: Subscribe with balanceChanges filter — ASA Receiver
  printStep(6, 'Filter: ASA balance changes for Receiver role')
  let watermark2 = watermarkBefore

  const asaReceiverSub = new AlgorandSubscriber(
    {
      filters: [
        {
          name: 'asa-receiver-changes',
          filter: {
            balanceChanges: [
              {
                assetId: assetId,
                role: BalanceChangeRole.Receiver,
              },
            ],
          },
        },
      ],
      syncBehaviour: 'sync-oldest',
      maxRoundsToSync: 100,
      watermarkPersistence: {
        get: async () => watermark2,
        set: async (w: bigint) => { watermark2 = w },
      },
    },
    algorand.client.algod,
  )

  const asaReceiverResult = await asaReceiverSub.pollOnce()
  const asaReceiverTxns = asaReceiverResult.subscribedTransactions
  printInfo(`Matched transactions: ${asaReceiverTxns.length.toString()}`)

  for (const txn of asaReceiverTxns) {
    const note = txn.note ? Buffer.from(txn.note).toString('utf-8') : ''
    printInfo(`  ${note}: id=${txn.id.slice(0, 12)}...`)
  }
  if (asaReceiverTxns.length < 1) {
    throw new Error(`Expected at least 1 ASA Receiver transaction, got ${asaReceiverTxns.length}`)
  }
  printSuccess('ASA Receiver filter matched expected transactions')

  // Step 7: Inspect balanceChanges array on matched transactions
  printStep(7, 'Inspect balanceChanges array on matched transactions')

  // Collect all unique transactions from both polls
  const allTxns = [...algoSenderTxns, ...asaReceiverTxns]
  const seen = new Set<string>()

  for (const txn of allTxns) {
    if (seen.has(txn.id)) continue
    seen.add(txn.id)

    const note = txn.note ? Buffer.from(txn.note).toString('utf-8') : ''
    console.log()
    printInfo(`Transaction: ${note} (${txn.id.slice(0, 12)}...)`)

    if (txn.balanceChanges && txn.balanceChanges.length > 0) {
      for (const bc of txn.balanceChanges) {
        const assetLabel = bc.assetId === 0n ? 'ALGO' : `ASA #${bc.assetId}`
        const roles = bc.roles.join(', ')
        printInfo(
          `  ${shortenAddress(bc.address)}: asset=${assetLabel}, amount=${bc.amount.toString()}, roles=[${roles}]`,
        )
      }
    } else {
      printInfo('  (no balance changes)')
    }
  }

  // Step 8: Demonstrate BalanceChangeRole enum values
  printStep(8, 'BalanceChangeRole enum values')
  printInfo(`Sender: ${BalanceChangeRole.Sender}`)
  printInfo(`Receiver: ${BalanceChangeRole.Receiver}`)
  printInfo(`CloseTo: ${BalanceChangeRole.CloseTo}`)
  printInfo(`AssetCreator: ${BalanceChangeRole.AssetCreator}`)
  printInfo(`AssetDestroyer: ${BalanceChangeRole.AssetDestroyer}`)
  printSuccess('All BalanceChangeRole values demonstrated')

  // Step 9: Summary
  printStep(9, 'Summary')
  console.log()
  console.log('  ┌──────────────────┬──────────────────────────────────────────────────┐')
  console.log('  │ Filter           │ Description                                      │')
  console.log('  ├──────────────────┼──────────────────────────────────────────────────┤')
  console.log('  │ algo-sender      │ assetId=0, role=Sender, minAbsoluteAmount=2M     │')
  console.log('  │ asa-receiver     │ assetId=ASA, role=Receiver                        │')
  console.log('  └──────────────────┴──────────────────────────────────────────────────┘')
  console.log()

  printHeader('Example complete')
}

main().catch((err) => {
  printError(err.message)
  process.exit(1)
})
