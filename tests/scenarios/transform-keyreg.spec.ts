import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { TransactionType } from 'algosdk'
import { describe, expect, it } from 'vitest'
import { getSubscribedTransactionForDiff } from '../subscribed-transactions'
import { GetSubscribedTransactions } from '../transactions'

describe('Complex transaction with many nested inner transactions', () => {
  const txnId = 'LSTIW7IBLO4SFPLFAI45WAV3NPXYPX6RWPTZ5KYDL3NX2LTJFXNA'
  const roundNumber = 34418662n
  const algorand = AlgorandClient.mainNet()

  it('Can have a keyreg transaction subscribed correctly from indexer', async () => {
    const indexerTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.keyreg,
          sender: 'HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY',
        },
        roundsToSync: 1,
        currentRound: roundNumber + 1n,
        syncBehaviour: 'catchup-with-indexer',
        watermark: roundNumber - 1n,
      },
      algorand,
    )

    expect(indexerTxns.subscribedTransactions.length).toBe(1)
    const txn = getSubscribedTransactionForDiff(indexerTxns.subscribedTransactions[0])
    // https://allo.info/tx/LSTIW7IBLO4SFPLFAI45WAV3NPXYPX6RWPTZ5KYDL3NX2LTJFXNA
    expect(txn.id).toBe(txnId)
    expect(txn).toMatchInlineSnapshot(`
     {
      "balanceChanges": [
        {
          "address": "HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY",
          "amount": -1000n,
          "assetId": 0n,
          "roles": [
            "Sender",
          ],
        },
      ],
      "closeRewards": 0n,
      "closingAmount": 0n,
      "confirmedRound": 34418662n,
      "fee": 1000n,
      "filtersMatched": [
        "default",
      ],
      "firstValid": 34418595n,
      "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
      "genesisId": "mainnet-v1.0",
      "id": "LSTIW7IBLO4SFPLFAI45WAV3NPXYPX6RWPTZ5KYDL3NX2LTJFXNA",
      "innerTxns": [],
      "intraRoundOffset": 54,
      "keyregTransaction": {
        "nonParticipation": false,
        "selectionParticipationKey": "Fsp1QLE/fXpmq5fsk/bWP8P1+H8n30bMD3X7hPdk/GU=",
        "stateProofKey": "Qld9eu3U/OhHohBMF4atWbKbDQB5NGO2vPl5sZ9q9yHssmrbnQIOlhujP3vaSdFXqstnzD77Z85yrlfxJFfu+g==",
        "voteFirstValid": 34300000n,
        "voteKeyDilution": 2450n,
        "voteLastValid": 40300000n,
        "voteParticipationKey": "yUR+nfHtSb2twOaprEXrnYjkhbFMBtmXW9D8x+/ROBg=",
      },
      "lastValid": 34419595n,
      "receiverRewards": 0n,
      "roundTime": 1702579204,
      "sender": "HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY",
      "senderRewards": 0n,
      "signature": {
        "sig": "zs+8H5J4hXmmKk36uEupgupE5Filw/xMae0ox5c7yuHM4jYVPLPBYHLOdPapguScPzuz0Lney/+V9MFrKLj9Dw==",
      },
      "txType": "keyreg",
    }
    `)
  })

  it('Can have an inner transaction subscribed correctly from algod', async () => {
    const algodTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.keyreg,
          sender: 'HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY',
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
    // https://allo.info/tx/LSTIW7IBLO4SFPLFAI45WAV3NPXYPX6RWPTZ5KYDL3NX2LTJFXNA
    expect(txn.id).toBe(txnId)
    expect(getSubscribedTransactionForDiff(txn)).toMatchInlineSnapshot(`
      {
        "balanceChanges": [
          {
            "address": "HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY",
            "amount": -1000n,
            "assetId": 0n,
            "roles": [
              "Sender",
            ],
          },
        ],
        "confirmedRound": 34418662n,
        "fee": 1000n,
        "filtersMatched": [
          "default",
        ],
        "firstValid": 34418595n,
        "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
        "genesisId": "mainnet-v1.0",
        "id": "LSTIW7IBLO4SFPLFAI45WAV3NPXYPX6RWPTZ5KYDL3NX2LTJFXNA",
        "intraRoundOffset": 54,
        "keyregTransaction": {
          "nonParticipation": false,
          "selectionParticipationKey": "Fsp1QLE/fXpmq5fsk/bWP8P1+H8n30bMD3X7hPdk/GU=",
          "stateProofKey": "Qld9eu3U/OhHohBMF4atWbKbDQB5NGO2vPl5sZ9q9yHssmrbnQIOlhujP3vaSdFXqstnzD77Z85yrlfxJFfu+g==",
          "voteFirstValid": 34300000n,
          "voteKeyDilution": 2450n,
          "voteLastValid": 40300000n,
          "voteParticipationKey": "yUR+nfHtSb2twOaprEXrnYjkhbFMBtmXW9D8x+/ROBg=",
        },
        "lastValid": 34419595n,
        "note": "",
        "roundTime": 1702579204,
        "sender": "HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY",
        "signature": {
          "sig": "zs+8H5J4hXmmKk36uEupgupE5Filw/xMae0ox5c7yuHM4jYVPLPBYHLOdPapguScPzuz0Lney/+V9MFrKLj9Dw==",
        },
        "txType": "keyreg",
      }
    `)
  })
})
