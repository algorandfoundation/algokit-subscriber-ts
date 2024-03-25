import * as algokit from '@algorandfoundation/algokit-utils'
import { TransactionType } from 'algosdk'
import { describe, expect, it } from 'vitest'
import { GetSubscribedTransactions, clearUndefineds } from '../transactions'

describe('Complex transaction with many nested inner transactions', () => {
  const txnId = 'LSTIW7IBLO4SFPLFAI45WAV3NPXYPX6RWPTZ5KYDL3NX2LTJFXNA'
  const roundNumber = 34418662
  const algod = algokit.getAlgoClient(algokit.getAlgoNodeConfig('mainnet', 'algod'))
  const indexer = algokit.getAlgoIndexerClient(algokit.getAlgoNodeConfig('mainnet', 'indexer'))

  it('Can have a keyreg transaction subscribed correctly from indexer', async () => {
    const indexerTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.keyreg,
          sender: 'HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY',
        },
        roundsToSync: 1,
        currentRound: roundNumber + 1,
        syncBehaviour: 'catchup-with-indexer',
        watermark: roundNumber - 1,
      },
      algod,
      indexer,
    )

    expect(indexerTxns.subscribedTransactions.length).toBe(1)
    const txn = indexerTxns.subscribedTransactions[0]
    // https://allo.info/tx/LSTIW7IBLO4SFPLFAI45WAV3NPXYPX6RWPTZ5KYDL3NX2LTJFXNA
    expect(txn.id).toBe(txnId)
    expect(txn).toMatchInlineSnapshot(`
      {
        "arc28Events": undefined,
        "balanceChanges": [
          {
            "address": "HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY",
            "amount": -1000n,
            "assetId": 0,
            "roles": [
              "Sender",
            ],
          },
        ],
        "close-rewards": 0,
        "closing-amount": 0,
        "confirmed-round": 34418662,
        "fee": 1000,
        "filtersMatched": [
          "default",
        ],
        "first-valid": 34418595,
        "genesis-hash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
        "genesis-id": "mainnet-v1.0",
        "id": "LSTIW7IBLO4SFPLFAI45WAV3NPXYPX6RWPTZ5KYDL3NX2LTJFXNA",
        "inner-txns": undefined,
        "intra-round-offset": 54,
        "keyreg-transaction": {
          "non-participation": false,
          "selection-participation-key": "Fsp1QLE/fXpmq5fsk/bWP8P1+H8n30bMD3X7hPdk/GU=",
          "state-proof-key": "Qld9eu3U/OhHohBMF4atWbKbDQB5NGO2vPl5sZ9q9yHssmrbnQIOlhujP3vaSdFXqstnzD77Z85yrlfxJFfu+g==",
          "vote-first-valid": 34300000,
          "vote-key-dilution": 2450,
          "vote-last-valid": 40300000,
          "vote-participation-key": "yUR+nfHtSb2twOaprEXrnYjkhbFMBtmXW9D8x+/ROBg=",
        },
        "last-valid": 34419595,
        "receiver-rewards": 0,
        "round-time": 1702579204,
        "sender": "HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY",
        "sender-rewards": 0,
        "signature": {
          "sig": "zs+8H5J4hXmmKk36uEupgupE5Filw/xMae0ox5c7yuHM4jYVPLPBYHLOdPapguScPzuz0Lney/+V9MFrKLj9Dw==",
        },
        "tx-type": "keyreg",
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
        currentRound: roundNumber + 1,
        syncBehaviour: 'sync-oldest',
        watermark: roundNumber - 1,
      },
      algod,
    )

    expect(algodTxns.subscribedTransactions.length).toBe(1)
    const txn = algodTxns.subscribedTransactions[0]
    // https://allo.info/tx/LSTIW7IBLO4SFPLFAI45WAV3NPXYPX6RWPTZ5KYDL3NX2LTJFXNA
    expect(txn.id).toBe(txnId)
    expect(clearUndefineds(txn)).toMatchInlineSnapshot(`
      {
        "balanceChanges": [
          {
            "address": "HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY",
            "amount": -1000n,
            "assetId": 0,
            "roles": [
              "Sender",
            ],
          },
        ],
        "confirmed-round": 34418662,
        "fee": 1000,
        "filtersMatched": [
          "default",
        ],
        "first-valid": 34418595,
        "genesis-hash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
        "genesis-id": "mainnet-v1.0",
        "id": "LSTIW7IBLO4SFPLFAI45WAV3NPXYPX6RWPTZ5KYDL3NX2LTJFXNA",
        "intra-round-offset": 54,
        "keyreg-transaction": {
          "non-participation": false,
          "selection-participation-key": "Fsp1QLE/fXpmq5fsk/bWP8P1+H8n30bMD3X7hPdk/GU=",
          "state-proof-key": "Qld9eu3U/OhHohBMF4atWbKbDQB5NGO2vPl5sZ9q9yHssmrbnQIOlhujP3vaSdFXqstnzD77Z85yrlfxJFfu+g==",
          "vote-first-valid": 34300000,
          "vote-key-dilution": 2450,
          "vote-last-valid": 40300000,
          "vote-participation-key": "yUR+nfHtSb2twOaprEXrnYjkhbFMBtmXW9D8x+/ROBg=",
        },
        "last-valid": 34419595,
        "lease": "",
        "note": "",
        "round-time": 1702579204,
        "sender": "HQQRVWPYAHABKCXNMZRG242Z5GWFTJMRO63HDCLF23ZWCT3IPQXIGQ2KGY",
        "signature": {
          "sig": "zs+8H5J4hXmmKk36uEupgupE5Filw/xMae0ox5c7yuHM4jYVPLPBYHLOdPapguScPzuz0Lney/+V9MFrKLj9Dw==",
        },
        "tx-type": "keyreg",
      }
    `)
  })
})
