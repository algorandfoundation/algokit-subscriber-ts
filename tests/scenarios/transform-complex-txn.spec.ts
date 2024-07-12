import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'
import { describe, expect, it } from 'vitest'
import { getBlocksBulk } from '../../src/block'
import { ALGORAND_ZERO_ADDRESS, getBlockTransactions, getIndexerTransactionFromAlgodTransaction } from '../../src/transform'
import { GetSubscribedTransactions, clearUndefineds, getTransactionInBlockForDiff } from '../transactions'

describe('Complex transaction with many nested inner transactions', () => {
  const txnId = 'QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q'
  const roundNumber = 35214367
  const algod = algokit.getAlgoClient(algokit.getAlgoNodeConfig('mainnet', 'algod'))
  const indexer = algokit.getAlgoIndexerClient(algokit.getAlgoNodeConfig('mainnet', 'indexer'))

  it('Can have an inner transaction subscribed correctly from indexer', async () => {
    const indexerTxns = await GetSubscribedTransactions(
      {
        filters: {
          appId: 1390675395,
          sender: 'AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A',
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
    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5
    expect(txn.id).toBe(`${txnId}/inner/5`)
    expect(txn).toMatchInlineSnapshot(`
      {
        "application-transaction": {
          "accounts": [],
          "application-args": [
            "AA==",
            "Aw==",
            "AAAAAAAAAAA=",
            "BAAAAAAABgTFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          ],
          "application-id": 1390675395,
          "foreign-apps": [],
          "foreign-assets": [
            1390638935,
          ],
          "global-state-schema": {
            "num-byte-slice": 0,
            "num-uint": 0,
          },
          "local-state-schema": {
            "num-byte-slice": 0,
            "num-uint": 0,
          },
          "on-completion": "noop",
        },
        "arc28Events": undefined,
        "balanceChanges": [
          {
            "address": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
            "amount": -2000n,
            "assetId": 0,
            "roles": [
              "Sender",
            ],
          },
        ],
        "close-rewards": 0,
        "closing-amount": 0,
        "confirmed-round": 35214367,
        "fee": 2000,
        "first-valid": 35214365,
        "global-state-delta": [
          {
            "key": "",
            "value": {
              "action": 1,
              "bytes": "AAAAAAAAAAQAAAAAAhlUHw==",
              "uint": 0,
            },
          },
          {
            "key": "AA==",
            "value": {
              "action": 1,
              "bytes": "YC4Bj8ZCXdiWg6+eYEL5yV0gvi3ucnEckrGx2BQXDDIAAAAAUuN3VwAAAAAOsZeDAQAAAABS43dXAAAAAFLkB4YAAAAAAAAAAAAAAAAAAAAA/////5S/nq4AAAAAa0BhUQAAAA91+xl0AAAAAALtZZ8AAAAAAwsGTgAAAAAAAA==",
              "uint": 0,
            },
          },
          {
            "key": "AQ==",
            "value": {
              "action": 1,
              "bytes": "h2MAAAAAAAAABQAAAAAAAAAZAAAAAAAAAB6KqC3yOXMVr2XD4nTi43RC3Rv0AGIvri+ssClC+HVNQgAAAAAAAAAAAA==",
              "uint": 0,
            },
          },
        ],
        "group": "6ZssGapPFZ+DyccRludq0YjZigi05/FSeUAOFNDGGlo=",
        "id": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5",
        "inner-txns": [
          {
            "arc28Events": undefined,
            "asset-transfer-transaction": {
              "amount": 536012365,
              "asset-id": 1390638935,
              "close-amount": 0,
              "receiver": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
            },
            "balanceChanges": [
              {
                "address": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
                "amount": -536012365n,
                "assetId": 1390638935,
                "roles": [
                  "Sender",
                ],
              },
              {
                "address": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
                "amount": 536012365n,
                "assetId": 1390638935,
                "roles": [
                  "Receiver",
                ],
              },
            ],
            "close-rewards": 0,
            "closing-amount": 0,
            "confirmed-round": 35214367,
            "fee": 0,
            "first-valid": 35214365,
            "inner-txns": undefined,
            "intra-round-offset": 142,
            "last-valid": 35214369,
            "receiver-rewards": 0,
            "round-time": 1705252440,
            "sender": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
            "sender-rewards": 0,
            "tx-type": "axfer",
          },
        ],
        "intra-round-offset": 147,
        "last-valid": 35214369,
        "logs": [
          "R2hHHwQAAAAAAAYExQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
          "AAAAAAAAYaAAAAAAH/LmTQAAAAAAAAAA",
          "PNZU+gAEIaZlfCPaQTne/tLHvhC5yf/+JYJqpN1uNQLOFg2mAAAAAAAAAAAAAAAAAAYExQAAAAAf8uZNAAAAAAAAAAAAAAAPdfsZdAAAAAAC7WWf",
        ],
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "receiver-rewards": 0,
        "round-time": 1705252440,
        "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
        "sender-rewards": 0,
        "tx-type": "appl",
      }
    `)
  })

  it('Can have an inner transaction subscribed correctly from algod', async () => {
    const algodTxns = await GetSubscribedTransactions(
      {
        filters: {
          appId: 1390675395,
          sender: 'AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A',
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
    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5
    expect(txn.id).toBe(`${txnId}/inner/5`)
    expect(clearUndefineds(txn)).toMatchInlineSnapshot(`
      {
        "application-transaction": {
          "application-args": [
            "AA==",
            "Aw==",
            "AAAAAAAAAAA=",
            "BAAAAAAABgTFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          ],
          "application-id": 1390675395,
          "approval-program": "",
          "clear-state-program": "",
          "foreign-assets": [
            1390638935,
          ],
          "on-completion": "noop",
        },
        "balanceChanges": [
          {
            "address": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
            "amount": -2000n,
            "assetId": 0,
            "roles": [
              "Sender",
            ],
          },
        ],
        "confirmed-round": 35214367,
        "fee": 2000,
        "filtersMatched": [
          "default",
        ],
        "first-valid": 35214365,
        "genesis-hash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
        "global-state-delta": [
          {
            "key": "",
            "value": {
              "action": 1,
              "bytes": "AAAAAAAAAAQAAAAAAhlUHw==",
            },
          },
          {
            "key": "AA==",
            "value": {
              "action": 1,
              "bytes": "YC4Bj8ZCXdiWg6+eYEL5yV0gvi3ucnEckrGx2BQXDDIAAAAAUuN3VwAAAAAOsZeDAQAAAABS43dXAAAAAFLkB4YAAAAAAAAAAAAAAAAAAAAA/////5S/nq4AAAAAa0BhUQAAAA91+xl0AAAAAALtZZ8AAAAAAwsGTgAAAAAAAA==",
            },
          },
          {
            "key": "AQ==",
            "value": {
              "action": 1,
              "bytes": "h2MAAAAAAAAABQAAAAAAAAAZAAAAAAAAAB6KqC3yOXMVr2XD4nTi43RC3Rv0AGIvri+ssClC+HVNQgAAAAAAAAAAAA==",
            },
          },
        ],
        "group": "6ZssGapPFZ+DyccRludq0YjZigi05/FSeUAOFNDGGlo=",
        "id": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5",
        "inner-txns": [
          {
            "asset-transfer-transaction": {
              "amount": 536012365,
              "asset-id": 1390638935,
              "receiver": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
            },
            "balanceChanges": [
              {
                "address": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
                "amount": -536012365n,
                "assetId": 1390638935,
                "roles": [
                  "Sender",
                ],
              },
              {
                "address": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
                "amount": 536012365n,
                "assetId": 1390638935,
                "roles": [
                  "Receiver",
                ],
              },
            ],
            "confirmed-round": 35214367,
            "fee": 0,
            "first-valid": 35214365,
            "genesis-hash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
            "id": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5",
            "intra-round-offset": 148,
            "last-valid": 35214369,
            "lease": "",
            "note": "",
            "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
            "round-time": 1705252440,
            "sender": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
            "tx-type": "axfer",
          },
        ],
        "intra-round-offset": 147,
        "last-valid": 35214369,
        "lease": "",
        "logs": [
          "R2hHHwQAAAAAAAYExQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
          "AAAAAAAAYaAAAAAAH/LmTQAAAAAAAAAA",
          "PNZU+gAEIaZlfCPaQTne/tLHvhC5yf/+JYJqpN1uNQLOFg2mAAAAAAAAAAAAAAAAAAYExQAAAAAf8uZNAAAAAAAAAAAAAAAPdfsZdAAAAAAC7WWf",
        ],
        "note": "",
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "round-time": 1705252440,
        "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
        "tx-type": "appl",
      }
    `)

    expect(algodTxns.blockMetadata).toMatchInlineSnapshot(`
      [
        {
          "fullTransactionCount": 171,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "genesisId": "mainnet-v1.0",
          "hash": "EOq+HX242/G/ADonU6q5lfimxX7twuFKEwtG4rDt+kI=",
          "parentTransactionCount": 55,
          "previousBlockHash": "8ReLxqOPxmuKuBfACtllRRr13n2E2r01f8wXt3vFYW0=",
          "rewards": {
            "feeSink": "Y76M3MSY6DKBRHBL7C3NNDXGS5IIMQVQVUAB6MP4XEMMGVF2QWNPL226CA",
            "rewardsCalculationRound": 35500000,
            "rewardsLevel": 218288,
            "rewardsPool": "737777777777777777777777777777777777777777777777777UFEJ2CI",
            "rewardsRate": 0,
            "rewardsResidue": 6886250026n,
          },
          "round": 35214367,
          "seed": "Tp6NntUaw17I8GGscaawpAuI0vQDMgp1TBSMAcpohtY=",
          "stateProofTracking": [
            {
              "nextRound": 35214336,
              "onlineTotalWeight": 0,
              "type": 0,
              "votersCommitment": undefined,
            },
          ],
          "timestamp": 1705252440,
          "transactionsRoot": "xrzxjhAycO5dLAJ622EAMV4ffb2T1sagFWYQPR1S0IQ=",
          "transactionsRootSha256": "JfFssH1FIyVOuor0PEX9ZAwiCcMH2FcZbcRTsmqYpa0=",
          "txnCounter": 1401537349,
          "upgradeState": {
            "currentProtocol": "https://github.com/algorandfoundation/specs/tree/abd3d4823c6f77349fc04c3af7b1e99fe4df699f",
            "nextProtocol": "https://github.com/algorandfoundation/specs/tree/925a46433742afb0b51bb939354bd907fa88bf95",
            "nextProtocolApprovals": 9967,
            "nextProtocolSwitchOn": 35275315,
            "nextProtocolVoteBefore": 35125315,
          },
        },
      ]
    `)
  })

  it('Can be processed correctly from algod raw block', async () => {
    const txn = await algokit.lookupTransactionById(txnId, indexer)
    const b = (await getBlocksBulk({ startRound: roundNumber, maxRound: roundNumber }, algod))[0]
    const intraRoundOffset = txn.transaction['intra-round-offset']!

    const transformed = await getBlockTransactions(b.block)

    const receivedTxn = transformed[intraRoundOffset]
    expect(receivedTxn.transaction.txID()).toBe(txnId)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/
    expect(getTransactionInBlockForDiff(receivedTxn)).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": undefined,
        "parentTransactionId": undefined,
        "roundIndex": 46,
        "roundOffset": 142,
        "transaction": {
          "appAccounts": [
            "GJQLSF3KJZFRN7PMUYLDAOUVNHQVFMFXUNO6UPXVQH3GJXM5T53PF4TXEE",
            "QDNLKZLNM6ZUD4ZI24RSY6O4QHWF3RHDQIYDV7S5AAHKFZSV2MSSULCE4U",
          ],
          "appArgs": [
            "AAAAAAAXe90=",
            "AAAAAAAAAAA=",
            "//8=",
            "AAAAAAEAAg==",
            "BAABAAI=",
            "AP//AAEAAQ==",
          ],
          "appForeignApps": [
            1002541853,
            1390675395,
          ],
          "appForeignAssets": [
            246519683,
            1390638935,
          ],
          "appIndex": 1201559522,
          "fee": 1000,
          "firstRound": 35214365,
          "from": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "genesisID": "mainnet-v1.0",
          "group": "cHiEEvBCRGnUhz9409gHl/vn00lYDZnJoppC3YexRr0=",
          "lastRound": 35214369,
          "lease": "G/BcDWMoEGKAU7T9/w0NETqkoDB/xtSwSSUQIxVFKIM=",
          "note": "ABIRHgWWCypehpzUwrbxXIKwEdZxJIiyB+SyTfGUvgXhtJbAjwjsm0eEIHe5p3nB",
          "reKeyTo": "GEAW6VVQY2QPYKEI6HAHAH3MNQNMXYOVKYVVI3B7X72CPW74HRVYXWGITU",
          "tag": "VFg=",
          "type": "appl",
        },
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/1/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 1])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": 0,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundIndex": 46,
        "roundOffset": 143,
        "transaction": {
          "amount": 1539037,
          "fee": 1000,
          "firstRound": 35214365,
          "from": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "bLXdzryB627WoBOJ446eOJsiCi1Kfe/CKPTHRYKDsp0=",
          "lastRound": 35214369,
          "tag": "VFg=",
          "to": "QDNLKZLNM6ZUD4ZI24RSY6O4QHWF3RHDQIYDV7S5AAHKFZSV2MSSULCE4U",
          "type": "pay",
        },
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/2/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 2])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": 1,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundIndex": 46,
        "roundOffset": 144,
        "transaction": {
          "appAccounts": [
            "QDNLKZLNM6ZUD4ZI24RSY6O4QHWF3RHDQIYDV7S5AAHKFZSV2MSSULCE4U",
          ],
          "appArgs": [
            "c3dhcA==",
            "Zml4ZWQtaW5wdXQ=",
            "AAAAAAAAAAA=",
          ],
          "appForeignAssets": [
            246519683,
          ],
          "appIndex": 1002541853,
          "fee": 2000,
          "firstRound": 35214365,
          "from": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "bLXdzryB627WoBOJ446eOJsiCi1Kfe/CKPTHRYKDsp0=",
          "lastRound": 35214369,
          "tag": "VFg=",
          "type": "appl",
        },
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/3/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 3])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": 2,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundIndex": 46,
        "roundOffset": 145,
        "transaction": {
          "amount": 394437,
          "assetIndex": 246519683,
          "firstRound": 35214365,
          "from": "QDNLKZLNM6ZUD4ZI24RSY6O4QHWF3RHDQIYDV7S5AAHKFZSV2MSSULCE4U",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "lastRound": 35214369,
          "tag": "VFg=",
          "to": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "axfer",
        },
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/4/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 4])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": 3,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundIndex": 46,
        "roundOffset": 146,
        "transaction": {
          "amount": 394437,
          "assetIndex": 246519683,
          "fee": 1000,
          "firstRound": 35214365,
          "from": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "6ZssGapPFZ+DyccRludq0YjZigi05/FSeUAOFNDGGlo=",
          "lastRound": 35214369,
          "tag": "VFg=",
          "to": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
          "type": "axfer",
        },
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 5])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": 4,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundIndex": 46,
        "roundOffset": 147,
        "transaction": {
          "appArgs": [
            "AA==",
            "Aw==",
            "AAAAAAAAAAA=",
            "BAAAAAAABgTFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          ],
          "appForeignAssets": [
            1390638935,
          ],
          "appIndex": 1390675395,
          "fee": 2000,
          "firstRound": 35214365,
          "from": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "6ZssGapPFZ+DyccRludq0YjZigi05/FSeUAOFNDGGlo=",
          "lastRound": 35214369,
          "tag": "VFg=",
          "type": "appl",
        },
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/6/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 6])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": 5,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundIndex": 46,
        "roundOffset": 148,
        "transaction": {
          "amount": 536012365,
          "assetIndex": 1390638935,
          "firstRound": 35214365,
          "from": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "lastRound": 35214369,
          "tag": "VFg=",
          "to": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "axfer",
        },
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/7/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 7])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": 6,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundIndex": 46,
        "roundOffset": 149,
        "transaction": {
          "amount": 536012365,
          "assetIndex": 1390638935,
          "fee": 1000,
          "firstRound": 35214365,
          "from": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "dsT4D4kYR3KthS3jbi4rJee2ej8gQChwzsQD8auclWw=",
          "lastRound": 35214369,
          "tag": "VFg=",
          "to": "GJQLSF3KJZFRN7PMUYLDAOUVNHQVFMFXUNO6UPXVQH3GJXM5T53PF4TXEE",
          "type": "axfer",
        },
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/8/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 8])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": 7,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundIndex": 46,
        "roundOffset": 150,
        "transaction": {
          "appAccounts": [
            "GJQLSF3KJZFRN7PMUYLDAOUVNHQVFMFXUNO6UPXVQH3GJXM5T53PF4TXEE",
          ],
          "appArgs": [
            "c3dhcA==",
            "Zml4ZWQtaW5wdXQ=",
            "AAAAAAAAAAA=",
          ],
          "appForeignAssets": [
            1390638935,
          ],
          "appIndex": 1002541853,
          "fee": 2000,
          "firstRound": 35214365,
          "from": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "dsT4D4kYR3KthS3jbi4rJee2ej8gQChwzsQD8auclWw=",
          "lastRound": 35214369,
          "tag": "VFg=",
          "type": "appl",
        },
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/9/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 9])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": 8,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundIndex": 46,
        "roundOffset": 151,
        "transaction": {
          "amount": 1556942,
          "firstRound": 35214365,
          "from": "GJQLSF3KJZFRN7PMUYLDAOUVNHQVFMFXUNO6UPXVQH3GJXM5T53PF4TXEE",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "lastRound": 35214369,
          "tag": "VFg=",
          "to": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "pay",
        },
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/10/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 10])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "parentOffset": 9,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundIndex": 46,
        "roundOffset": 152,
        "transaction": {
          "fee": 1000,
          "firstRound": 35214365,
          "from": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "lastRound": 35214369,
          "reKeyTo": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "tag": "VFg=",
          "to": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "pay",
        },
      }
    `)
  })

  it('Transforms axfer without an arcv address', async () => {
    const blocks = await getBlocksBulk({ startRound: 39373576, maxRound: 39373576 }, algod) // Contains an axfer opt out inner transaction without an arcv address
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b.block))

    expect(blockTransactions.length).toBe(30)
    expect(algosdk.encodeAddress(blockTransactions[5].transaction.to.publicKey)).toBe(ALGORAND_ZERO_ADDRESS)
  })

  it('Transforms pay without a rcv address', async () => {
    const blocks = await getBlocksBulk({ startRound: 39723800, maxRound: 39723800 }, algod) // Contains a pay close account inner transaction without a rcv address
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b.block))

    expect(blockTransactions.length).toBe(486)
    expect(algosdk.encodeAddress(blockTransactions[371].transaction.to.publicKey)).toBe(ALGORAND_ZERO_ADDRESS)
  })

  it('Produces the correct txID for a non hgi transaction', async () => {
    const blocks = await getBlocksBulk({ startRound: 39430981, maxRound: 39430981 }, algod)
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b.block))

    const transaction = getIndexerTransactionFromAlgodTransaction(blockTransactions[0])
    expect(transaction.id).toBe('HHQHASIF2YLCSUYIPE6LIMLSNLCVMQBQHF3X46SKTX6F7ZSFKFCQ')
    expect(transaction.id).toBe(blockTransactions[0].transaction.txID())
  })
  it('Produces the correct state deltas in an app call transaction', async () => {
    const blocks = await getBlocksBulk({ startRound: 39430981, maxRound: 39430981 }, algod)
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b.block))

    const transaction = getIndexerTransactionFromAlgodTransaction(blockTransactions[9])
    const localStateDelta = transaction['local-state-delta']
    const globalStateDelta = transaction['global-state-delta']
    expect(globalStateDelta).toMatchInlineSnapshot(`[
  {
    "key": "Y3VycmVudF9taW5lcl9lZmZvcnQ=",
    "value": {
      "action": 2,
      "bytes": undefined,
      "uint": 412000,
    },
  },
  {
    "key": "dG90YWxfZWZmb3J0",
    "value": {
      "action": 2,
      "bytes": undefined,
      "uint": 2129702852933,
    },
  },
  {
    "key": "dG90YWxfdHJhbnNhY3Rpb25z",
    "value": {
      "action": 2,
      "bytes": undefined,
      "uint": 324424783,
    },
  },
]
      `)
    expect(localStateDelta).toMatchInlineSnapshot(`[
  {
    "address": "R4Q3KN5RBXUQIJWSVMQUJ7FTL7YURP6DY6W724HTD4Z43IRGUCZ2ORANGE",
    "delta": [
      {
        "key": "ZWZmb3J0",
        "value": {
          "action": 2,
          "bytes": undefined,
          "uint": 412000,
        },
      },
    ],
  },
]`)
  })
})
