import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { TransactionType } from 'algosdk'
import { describe, expect, it } from 'vitest'
import { clearUndefineds, GetSubscribedTransactions } from '../transactions'

describe('Heartbeat transaction', () => {
  // TODO: At some point FNet will likely be torn down, once we have hb transactions on mainnet or testnet we should update this test
  const txnId = 'S257NEWKKXQPBRZ4KDZMTL2PBKP6QTBNXUADHB2UZELXIHBYUVAA'
  const roundNumber = 3811103
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
    'heartbeat-transaction': {
      'hb-address': 'OOEPDEGVG3YL2FUHUEV2LKLPQRP35AJPQL3LV3TS6UFFRLJ552PVDZJGLM',
      'hb-key-dilution': 1001,
      'hb-proof': {
        'hb-pk': 'SMvycKufLfsZY8Z+keR+wrpCyshVM2a7MUvgh6ufs4g=',
        'hb-pk1sig': '9csOZzjc8pgVggeK5bT0UCgQ0+f0KYwK+wTqlFFkDimyv6Iqa49ziMoorjSkOsVnsSNCJHQY8EJs9PMc2X31Dw==',
        'hb-pk2': 'Rcxu2WJtT8bu6KUdbDsiYSmA+q/HILqtQF4hImNA5N8=',
        'hb-pk2sig': 'n54z0JW489m0YzCLKsdeoSPL5JRBedbgCdj+MNQTvIT1diLCuyV6BnFXax7wEQy0Q+Q3MWNskmqncCOK6AMFCA==',
        'hb-sig': 'cq2BGIbl2d5w5Qo1ziMYZ9hasVORGwD8NsYQqnrUreD9pyqmY6HOfgdnUf7TtryNef+/RqKRJFcNPrfD7xv5CA==',
      },
    },
  }

  it('Can have a hb transaction subscribed correctly from indexer', async () => {
    const indexerTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.hb,
        },
        roundsToSync: 1,
        currentRound: roundNumber + 1,
        syncBehaviour: 'catchup-with-indexer',
        watermark: roundNumber - 1,
      },
      algorand,
    )

    expect(indexerTxns.subscribedTransactions.length).toBe(1)
    const txn = indexerTxns.subscribedTransactions[0]
    expect(txn.id).toBe(txnId)

    expect(clearUndefineds(txn)).toMatchObject(expectedHeartbeatData)
  })

  it('Can have a hb transaction subscribed correctly from algod', async () => {
    const algodTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.hb,
        },
        roundsToSync: 1,
        currentRound: roundNumber + 1,
        syncBehaviour: 'sync-oldest',
        watermark: roundNumber - 1,
      },
      algorand,
    )

    expect(algodTxns.subscribedTransactions.length).toBe(1)
    const txn = algodTxns.subscribedTransactions[0]
    expect(txn.id).toBe(txnId)
    expect(clearUndefineds(txn)).toMatchObject(expectedHeartbeatData)
  })
})
