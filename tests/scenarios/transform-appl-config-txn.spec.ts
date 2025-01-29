import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { TransactionType } from 'algosdk'
import { describe, expect, it } from 'vitest'
import { GetSubscribedTransactions } from '../transactions'

describe('Application config transaction', () => {
  const txnId = 'ZCQ5OCGWV253DIN5XVJTFNWVVTOQ6PYOUI3KH7ORQISLN4PEXIGQ'
  const roundNumber = 31171197n
  const algorand = AlgorandClient.mainNet()

  it('Can have an app create transaction subscribed correctly from indexer', async () => {
    const indexerTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.appl,
        },
        roundsToSync: 1,
        currentRound: roundNumber + 1n,
        syncBehaviour: 'catchup-with-indexer',
        watermark: roundNumber - 1n,
      },
      algorand,
    )

    const txn = indexerTxns.subscribedTransactions.find((txn) => txn.id === txnId)
    expect(txn).toBeDefined()
    expect(txn!.createdApplicationIndex).toBe(1167143153n)
  })

  it('Can have an app create transaction subscribed correctly from algod', async () => {
    const algodTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.appl,
        },
        roundsToSync: 1,
        currentRound: roundNumber + 1n,
        syncBehaviour: 'sync-oldest',
        watermark: roundNumber - 1n,
      },
      algorand,
    )

    const txn = algodTxns.subscribedTransactions.find((txn) => txn.id === txnId)
    expect(txn).toBeDefined()
    expect(txn!.createdApplicationIndex).toBe(1167143153n)
  })
})
