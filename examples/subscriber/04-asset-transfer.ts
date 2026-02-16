/**
 * Example: Asset Transfer Subscription
 *
 * This example demonstrates ASA lifecycle subscription.
 * - Subscribe to asset creation with assetCreate filter
 * - Subscribe to asset transfers with type and assetId filters
 * - Track opt-in and transfer transactions
 *
 * Prerequisites:
 * - LocalNet running (via `algokit localnet start`)
 */
import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { AlgorandSubscriber } from '@algorandfoundation/algokit-subscriber'
import { printHeader, printStep, printInfo, printSuccess, printError, shortenAddress } from './shared/utils.js'
import { ALGOD_CONFIG, KMD_CONFIG } from './shared/constants.js'

async function main() {
  printHeader('04 — Asset Transfer Subscription')

  // Step 1: Connect to LocalNet
  printStep(1, 'Connect to LocalNet')
  const algorand = AlgorandClient.fromConfig({
    algodConfig: ALGOD_CONFIG,
    kmdConfig: KMD_CONFIG,
  })
  const status = await algorand.client.algod.status()
  printInfo(`Current round: ${status.lastRound.toString()}`)
  printSuccess('Connected to LocalNet')

  // Step 2: Create 2 accounts (A = creator, B = receiver)
  printStep(2, 'Create and fund 2 accounts (A, B)')
  const accountA = await algorand.account.fromEnvironment('ASSET_A', algo(100))
  const accountB = await algorand.account.fromEnvironment('ASSET_B', algo(100))
  const addrA = accountA.addr.toString()
  const addrB = accountB.addr.toString()
  printInfo(`Account A (creator): ${shortenAddress(addrA)}`)
  printInfo(`Account B (receiver): ${shortenAddress(addrB)}`)
  printSuccess('2 accounts created and funded')

  // Step 3: Create an ASA (fungible token) from account A
  printStep(3, 'Create ASA from account A')
  const createResult = await algorand.send.assetCreate({
    sender: accountA.addr,
    total: 1_000_000n,
    decimals: 0,
    assetName: 'TestToken',
    unitName: 'TT',
  })
  const assetId = createResult.assetId
  const createRound = createResult.confirmation.confirmedRound!
  printInfo(`Created asset ID: ${assetId.toString()}`)
  printInfo(`Confirmed round: ${createRound.toString()}`)
  printSuccess('ASA created')

  // Step 4: Account B opts in to the asset
  printStep(4, 'Account B opts in to asset')
  const optInResult = await algorand.send.assetOptIn({
    sender: accountB.addr,
    assetId,
  })
  printInfo(`Opt-in txn ID: ${optInResult.txIds[0]}`)
  printSuccess('Account B opted in')

  // Step 5: A transfers tokens to B
  printStep(5, 'Transfer 500 tokens from A to B')
  const transferResult = await algorand.send.assetTransfer({
    sender: accountA.addr,
    receiver: accountB.addr,
    assetId,
    amount: 500n,
  })
  printInfo(`Transfer txn ID: ${transferResult.txIds[0]}`)
  printSuccess('Transferred 500 tokens')

  // Watermark: just before the asset creation round
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

  // Step 6: Subscribe with assetCreate filter — matches the creation transaction
  printStep(6, 'Filter: assetCreate = true')
  const createTxns = await pollWithFilter('asset-create', { assetCreate: true })
  printInfo(`Matched count: ${createTxns.length.toString()}`)
  for (const txn of createTxns) {
    printInfo(`  Created asset: ${txn.createdAssetId} | txn: ${txn.id}`)
  }
  if (createTxns.length !== 1) {
    throw new Error(`assetCreate filter: expected 1 match, got ${createTxns.length}`)
  }
  printSuccess('assetCreate filter matched 1 creation transaction')

  // Step 7: Subscribe with type=axfer + assetId filter — matches opt-in and transfer
  printStep(7, 'Filter: type = axfer, assetId = created asset')
  const axferTxns = await pollWithFilter('asset-transfers', {
    type: 'axfer',
    assetId: assetId,
  })
  printInfo(`Matched count: ${axferTxns.length.toString()}`)
  for (const txn of axferTxns) {
    const axfer = txn.assetTransferTransaction!
    printInfo(
      `  Transfer: ${shortenAddress(txn.sender)} -> ${shortenAddress(axfer.receiver)} | amount: ${axfer.amount} | txn: ${txn.id}`,
    )
  }
  if (axferTxns.length !== 2) {
    throw new Error(`axfer filter: expected 2 matches (opt-in + transfer), got ${axferTxns.length}`)
  }
  printSuccess('axfer filter matched 2 transactions (opt-in + transfer)')

  // Step 8: Summary
  printStep(8, 'Summary')
  printInfo(`Asset ID: ${assetId.toString()}`)
  printInfo(`assetCreate filter: ${createTxns.length} matched (creation)`)
  printInfo(`axfer + assetId filter: ${axferTxns.length} matched (opt-in + transfer)`)

  printHeader('Example complete')
}

main().catch((err) => {
  printError(err.message)
  process.exit(1)
})
