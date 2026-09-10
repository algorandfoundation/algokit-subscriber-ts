import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { TransactionType } from 'algosdk'
import { describe, expect, it } from 'vitest'
import { getSubscribedTransactionForDiff } from '../subscribed-transactions'
import { GetSubscribedTransactions } from '../transactions'

describe('Heartbeat transaction', () => {
  // A heartbeat sent by a challenged account, claiming the challenge fee discount
  const txnId = 'NOEVK43VAU7B3FIOLZXR3437K6WJYZBNNRTANG72VDQRE7AIF2QQ'
  const roundNumber = 64863104n
  const algorand = AlgorandClient.mainNet()
  const expectedHeartbeatData = {
    hbAddress: 'T5NPCKOB7BJFZBXK3VYUJIJ6VWUUDKV3ZUJCJZUAOL7RB2TSNH4XVQLHHA',
    hbChallengeDiscount: true,
    hbKeyDilution: 1688n,
    hbProof: {
      hbPk: 'L0uu9U/wdczXz2boG1Ez8fmlUExSdJIY8fj9qFRtiKg=',
      hbPk1sig: 'w5Y3YM5oHyh7/h3mzln/5Y8FQcJ03OILwFWdDguwD9lzd89szWAsD++PIgo8rMQAhXWlYVgIER4uXGaIfFdKBg==',
      hbPk2: 'NsfrcMpM2U4a20I4bzl15YqX6a5dea7WI/mMMuusURQ=',
      hbPk2sig: 'ngwdgkCyfZnJtxtk5TS8rhHXvZtsCdIelXMOPztTQyi3lw7Q8xwGOjQ23EdPpUwgXkF2JQVhhrxJHU/xbcDZCQ==',
      hbSig: 'nqKYBOKbXOk/ATSsTkmA/tVcnMjzR8oRiJmPJxHXL2SXgWGMsjh5KghZ4Xq/JY25+A9QGf8J2rSBuaGW4n4yDA==',
    },
    hbSeed: '+IuQbNsEOp8+HNcEUJQOR4atoRT14njEr0WzMCbK7Qs=',
    hbVoteId: 'yc+XgDi9XyQhHwly5JE2oxI9qHAlU4Ucu6k2amhmSRI=',
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
    // https://allo.info/tx/NOEVK43VAU7B3FIOLZXR3437K6WJYZBNNRTANG72VDQRE7AIF2QQ
    expect(txn.id).toBe(txnId)
    expect(txn.fee).toBe(0n)
    expect(getSubscribedTransactionForDiff(txn).heartbeatTransaction).toEqual(expectedHeartbeatData)
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
    expect(txn.fee).toBe(0n)
    expect(getSubscribedTransactionForDiff(txn).heartbeatTransaction).toEqual(expectedHeartbeatData)
  })
})
