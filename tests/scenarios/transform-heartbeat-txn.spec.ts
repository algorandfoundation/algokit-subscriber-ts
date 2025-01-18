import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { TransactionType } from 'algosdk'
import { describe, expect, it } from 'vitest'
import { getSubscribedTransactionForDiff } from '../subscribed-transactions'
import { GetSubscribedTransactions } from '../transactions'

describe('Heartbeat transaction', () => {
  // TODO: At some point FNet will likely be torn down, once we have hb transactions on mainnet or testnet we should update this test
  const txnId = 'S257NEWKKXQPBRZ4KDZMTL2PBKP6QTBNXUADHB2UZELXIHBYUVAA'
  const roundNumber = 3811103n
  const algorand = AlgorandClient.fromConfig({
    algodConfig: {
      server: 'https://fnet-api.4160.nodely.io/',
      port: 443,
    },
    indexerConfig: {
      server: 'https://fnet-idx.4160.nodely.io/',
      port: 443,
    },
  })
  const expectedHeartbeatData = {
    hbAddress: 'OOEPDEGVG3YL2FUHUEV2LKLPQRP35AJPQL3LV3TS6UFFRLJ552PVDZJGLM',
    hbKeyDilution: 1001n,
    hbProof: {
      hbPk: 'SMvycKufLfsZY8Z+keR+wrpCyshVM2a7MUvgh6ufs4g=',
      hbPk1sig: '9csOZzjc8pgVggeK5bT0UCgQ0+f0KYwK+wTqlFFkDimyv6Iqa49ziMoorjSkOsVnsSNCJHQY8EJs9PMc2X31Dw==',
      hbPk2: 'Rcxu2WJtT8bu6KUdbDsiYSmA+q/HILqtQF4hImNA5N8=',
      hbPk2sig: 'n54z0JW489m0YzCLKsdeoSPL5JRBedbgCdj+MNQTvIT1diLCuyV6BnFXax7wEQy0Q+Q3MWNskmqncCOK6AMFCA==',
      hbSig: 'cq2BGIbl2d5w5Qo1ziMYZ9hasVORGwD8NsYQqnrUreD9pyqmY6HOfgdnUf7TtryNef+/RqKRJFcNPrfD7xv5CA==',
    },
    hbSeed: 'uC0B02o31PDWHup9KzE/4lSFsOgoKq1+is6IYMK3Ptc=',
    hbVoteId: 'S+MIkXmZHCYzcje+tyYh3XOO1XTO7ZX/uH5rhITpKHk=',
  }

  it('Can have a hb transaction subscribed correctly from indexer', async () => {
    const indexerTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.hb,
        },
        roundsToSync: 1,
        currentRound: roundNumber + 1n,
        syncBehaviour: 'catchup-with-indexer',
        watermark: roundNumber - 1n,
      },
      algorand,
    )

    expect(indexerTxns.subscribedTransactions.length).toBe(1)
    const txn = indexerTxns.subscribedTransactions[0]
    expect(txn.id).toBe(txnId)
    expect(getSubscribedTransactionForDiff(txn).heartbeatTransaction).toMatchObject(expectedHeartbeatData)
  })

  it('Can have a hb transaction subscribed correctly from algod', async () => {
    const algodTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.hb,
        },
        roundsToSync: 1,
        currentRound: roundNumber + 1n,
        syncBehaviour: 'sync-oldest',
        watermark: roundNumber - 1n,
      },
      algorand,
    )

    expect(algodTxns.subscribedTransactions.length).toBe(1)
    const txn = algodTxns.subscribedTransactions[0]
    expect(txn.id).toBe(txnId)
    expect(getSubscribedTransactionForDiff(txn).heartbeatTransaction).toMatchObject(expectedHeartbeatData)
  })
})
