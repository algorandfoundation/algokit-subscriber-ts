import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { TransactionType } from '@algorandfoundation/algokit-utils/transact'
import { describe, expect, it } from 'vitest'
import { getSubscribedTransactionForDiff } from '../subscribed-transactions'
import { GetSubscribedTransactions } from '../transactions'

describe('Asset config transaction', () => {
  const txnId = 'QHMYTRW27O7KYP6W3SMC3HP55DN5IL2H7Z27T2YDCNFCLXOVFOJQ'
  const roundNumber = 44322184n
  const algorand = AlgorandClient.mainNet()

  const expectedAssetCreateData = {
    assetId: 0n,
    params: {
      creator: 'ATPVJYGEGP5H6GCZ4T6CG4PK7LH5OMWXHLXZHDPGO7RO6T3EHWTF6UUY6E',
      decimals: 6,
      total: 2000000000000000n,
      clawback: 'ATPVJYGEGP5H6GCZ4T6CG4PK7LH5OMWXHLXZHDPGO7RO6T3EHWTF6UUY6E',
      freeze: 'ATPVJYGEGP5H6GCZ4T6CG4PK7LH5OMWXHLXZHDPGO7RO6T3EHWTF6UUY6E',
      manager: 'ATPVJYGEGP5H6GCZ4T6CG4PK7LH5OMWXHLXZHDPGO7RO6T3EHWTF6UUY6E',
      name: 'Fry Node',
      nameB64: 'RnJ5IE5vZGU=',
      reserve: 'ATPVJYGEGP5H6GCZ4T6CG4PK7LH5OMWXHLXZHDPGO7RO6T3EHWTF6UUY6E',
      unitName: 'fNODE',
      unitNameB64: 'Zk5PREU=',
      url: 'https://frynetworks.com/',
      urlB64: 'aHR0cHM6Ly9mcnluZXR3b3Jrcy5jb20v',
    },
  }

  it('Can have an asset create with uint name transaction subscribed correctly from indexer', async () => {
    const indexerTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.AssetConfig,
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
    expect(getSubscribedTransactionForDiff(txn!).assetConfigTransaction).toMatchObject(expectedAssetCreateData)
  })

  it('Can have an asset create with uint name transaction subscribed correctly from algod', async () => {
    const algodTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.AssetConfig,
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
    expect(getSubscribedTransactionForDiff(txn!).assetConfigTransaction).toMatchObject(expectedAssetCreateData)
  })
})
