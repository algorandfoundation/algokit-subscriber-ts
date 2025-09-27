import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { describe, expect, it } from 'vitest'
import { getBlocksBulk } from '../../src/block'
import { ALGORAND_ZERO_ADDRESS, getBlockTransactions, getIndexerTransactionFromAlgodTransaction } from '../../src/transform'
import { getSubscribedTransactionForDiff } from '../subscribed-transactions'
import { GetSubscribedTransactions, getTransactionInBlockForDiff } from '../transactions'

describe('Complex transaction with many nested inner transactions', () => {
  const txnId = 'QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q'
  const roundNumber = 35214367n
  const algorand = AlgorandClient.mainNet()

  it('Can have an inner transaction subscribed correctly from indexer', async () => {
    const indexerTxns = await GetSubscribedTransactions(
      {
        filters: {
          appId: 1390675395n,
          sender: 'AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A',
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
    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5
    expect(txn.id).toBe(`${txnId}/inner/5`)
    expect(getSubscribedTransactionForDiff(txn)).toMatchInlineSnapshot(`
      {
        "applicationTransaction": {
          "access": [],
          "accounts": [],
          "applicationArgs": [
            "AA==",
            "Aw==",
            "AAAAAAAAAAA=",
            "BAAAAAAABgTFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          ],
          "applicationId": 1390675395n,
          "boxReferences": [],
          "foreignApps": [],
          "foreignAssets": [
            1390638935n,
          ],
          "globalStateSchema": {
            "numByteSlice": 0,
            "numUint": 0,
          },
          "localStateSchema": {
            "numByteSlice": 0,
            "numUint": 0,
          },
          "onCompletion": "noop",
        },
        "balanceChanges": [
          {
            "address": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
            "amount": -2000n,
            "assetId": 0n,
            "roles": [
              "Sender",
            ],
          },
        ],
        "closeRewards": 0n,
        "closingAmount": 0n,
        "confirmedRound": 35214367n,
        "fee": 2000n,
        "firstValid": 35214365n,
        "globalStateDelta": [
          {
            "key": "",
            "value": {
              "action": 1,
              "bytes": "AAAAAAAAAAQAAAAAAhlUHw==",
              "uint": 0n,
            },
          },
          {
            "key": "AA==",
            "value": {
              "action": 1,
              "bytes": "YC4Bj8ZCXdiWg6+eYEL5yV0gvi3ucnEckrGx2BQXDDIAAAAAUuN3VwAAAAAOsZeDAQAAAABS43dXAAAAAFLkB4YAAAAAAAAAAAAAAAAAAAAA/////5S/nq4AAAAAa0BhUQAAAA91+xl0AAAAAALtZZ8AAAAAAwsGTgAAAAAAAA==",
              "uint": 0n,
            },
          },
          {
            "key": "AQ==",
            "value": {
              "action": 1,
              "bytes": "h2MAAAAAAAAABQAAAAAAAAAZAAAAAAAAAB6KqC3yOXMVr2XD4nTi43RC3Rv0AGIvri+ssClC+HVNQgAAAAAAAAAAAA==",
              "uint": 0n,
            },
          },
        ],
        "group": "6ZssGapPFZ+DyccRludq0YjZigi05/FSeUAOFNDGGlo=",
        "id": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5",
        "innerTxns": [
          {
            "assetTransferTransaction": {
              "amount": 536012365n,
              "assetId": 1390638935n,
              "closeAmount": 0n,
              "receiver": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
            },
            "balanceChanges": [
              {
                "address": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
                "amount": -536012365n,
                "assetId": 1390638935n,
                "roles": [
                  "Sender",
                ],
              },
              {
                "address": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
                "amount": 536012365n,
                "assetId": 1390638935n,
                "roles": [
                  "Receiver",
                ],
              },
            ],
            "closeRewards": 0n,
            "closingAmount": 0n,
            "confirmedRound": 35214367n,
            "fee": 0n,
            "firstValid": 35214365n,
            "id": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/6",
            "innerTxns": [],
            "intraRoundOffset": 148,
            "lastValid": 35214369n,
            "parentIntraRoundOffset": 142,
            "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
            "receiverRewards": 0n,
            "roundTime": 1705252440,
            "sender": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
            "senderRewards": 0n,
            "txType": "axfer",
          },
        ],
        "intraRoundOffset": 147,
        "lastValid": 35214369n,
        "logs": [
          "R2hHHwQAAAAAAAYExQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
          "AAAAAAAAYaAAAAAAH/LmTQAAAAAAAAAA",
          "PNZU+gAEIaZlfCPaQTne/tLHvhC5yf/+JYJqpN1uNQLOFg2mAAAAAAAAAAAAAAAAAAYExQAAAAAf8uZNAAAAAAAAAAAAAAAPdfsZdAAAAAAC7WWf",
        ],
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "receiverRewards": 0n,
        "roundTime": 1705252440,
        "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
        "senderRewards": 0n,
        "txType": "appl",
      }
    `)
  })

  it('Can have an inner transaction subscribed correctly from algod', async () => {
    const algodTxns = await GetSubscribedTransactions(
      {
        filters: {
          appId: 1390675395n,
          sender: 'AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A',
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
    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5
    expect(txn.id).toBe(`${txnId}/inner/5`)
    expect(getSubscribedTransactionForDiff(txn)).toMatchInlineSnapshot(`
      {
        "applicationTransaction": {
          "access": [],
          "accounts": [],
          "applicationArgs": [
            "AA==",
            "Aw==",
            "AAAAAAAAAAA=",
            "BAAAAAAABgTFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          ],
          "applicationId": 1390675395n,
          "approvalProgram": "",
          "boxReferences": [],
          "clearStateProgram": "",
          "extraProgramPages": 0,
          "foreignApps": [],
          "foreignAssets": [
            1390638935n,
          ],
          "globalStateSchema": {
            "numByteSlice": 0,
            "numUint": 0,
          },
          "localStateSchema": {
            "numByteSlice": 0,
            "numUint": 0,
          },
          "onCompletion": "noop",
          "rejectVersion": 0,
        },
        "balanceChanges": [
          {
            "address": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
            "amount": -2000n,
            "assetId": 0n,
            "roles": [
              "Sender",
            ],
          },
        ],
        "confirmedRound": 35214367n,
        "fee": 2000n,
        "filtersMatched": [
          "default",
        ],
        "firstValid": 35214365n,
        "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
        "globalStateDelta": [
          {
            "key": "",
            "value": {
              "action": 1,
              "bytes": "AAAAAAAAAAQAAAAAAhlUHw==",
              "uint": 0n,
            },
          },
          {
            "key": "AA==",
            "value": {
              "action": 1,
              "bytes": "YC4Bj8ZCXdiWg6+eYEL5yV0gvi3ucnEckrGx2BQXDDIAAAAAUuN3VwAAAAAOsZeDAQAAAABS43dXAAAAAFLkB4YAAAAAAAAAAAAAAAAAAAAA/////5S/nq4AAAAAa0BhUQAAAA91+xl0AAAAAALtZZ8AAAAAAwsGTgAAAAAAAA==",
              "uint": 0n,
            },
          },
          {
            "key": "AQ==",
            "value": {
              "action": 1,
              "bytes": "h2MAAAAAAAAABQAAAAAAAAAZAAAAAAAAAB6KqC3yOXMVr2XD4nTi43RC3Rv0AGIvri+ssClC+HVNQgAAAAAAAAAAAA==",
              "uint": 0n,
            },
          },
        ],
        "group": "6ZssGapPFZ+DyccRludq0YjZigi05/FSeUAOFNDGGlo=",
        "id": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5",
        "innerTxns": [
          {
            "assetTransferTransaction": {
              "amount": 536012365n,
              "assetId": 1390638935n,
              "receiver": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
            },
            "balanceChanges": [
              {
                "address": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
                "amount": -536012365n,
                "assetId": 1390638935n,
                "roles": [
                  "Sender",
                ],
              },
              {
                "address": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
                "amount": 536012365n,
                "assetId": 1390638935n,
                "roles": [
                  "Receiver",
                ],
              },
            ],
            "confirmedRound": 35214367n,
            "fee": 0n,
            "firstValid": 35214365n,
            "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
            "id": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/6",
            "intraRoundOffset": 148,
            "lastValid": 35214369n,
            "note": "",
            "parentIntraRoundOffset": 142,
            "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
            "roundTime": 1705252440,
            "sender": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
            "txType": "axfer",
          },
        ],
        "intraRoundOffset": 147,
        "lastValid": 35214369n,
        "localStateDelta": [],
        "logs": [
          "R2hHHwQAAAAAAAYExQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
          "AAAAAAAAYaAAAAAAH/LmTQAAAAAAAAAA",
          "PNZU+gAEIaZlfCPaQTne/tLHvhC5yf/+JYJqpN1uNQLOFg2mAAAAAAAAAAAAAAAAAAYExQAAAAAf8uZNAAAAAAAAAAAAAAAPdfsZdAAAAAAC7WWf",
        ],
        "note": "",
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "roundTime": 1705252440,
        "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
        "txType": "appl",
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
          "participationUpdates": {
            "absentParticipationAccounts": [],
            "expiredParticipationAccounts": [],
          },
          "previousBlockHash": "8ReLxqOPxmuKuBfACtllRRr13n2E2r01f8wXt3vFYW0=",
          "proposer": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
          "rewards": {
            "feeSink": "Y76M3MSY6DKBRHBL7C3NNDXGS5IIMQVQVUAB6MP4XEMMGVF2QWNPL226CA",
            "rewardsCalculationRound": 35500000n,
            "rewardsLevel": 218288n,
            "rewardsPool": "737777777777777777777777777777777777777777777777777UFEJ2CI",
            "rewardsRate": 0n,
            "rewardsResidue": 6886250026n,
          },
          "round": 35214367n,
          "seed": "Tp6NntUaw17I8GGscaawpAuI0vQDMgp1TBSMAcpohtY=",
          "stateProofTracking": [
            {
              "nextRound": 35214336n,
              "onlineTotalWeight": 0n,
              "type": 0,
              "votersCommitment": "",
            },
          ],
          "timestamp": 1705252440,
          "transactionsRoot": "xrzxjhAycO5dLAJ622EAMV4ffb2T1sagFWYQPR1S0IQ=",
          "transactionsRootSha256": "JfFssH1FIyVOuor0PEX9ZAwiCcMH2FcZbcRTsmqYpa0=",
          "txnCounter": 1401537349n,
          "upgradeState": {
            "currentProtocol": "https://github.com/algorandfoundation/specs/tree/abd3d4823c6f77349fc04c3af7b1e99fe4df699f",
            "nextProtocol": "https://github.com/algorandfoundation/specs/tree/925a46433742afb0b51bb939354bd907fa88bf95",
            "nextProtocolApprovals": 9967n,
            "nextProtocolSwitchOn": 35275315n,
            "nextProtocolVoteBefore": 35125315n,
          },
          "upgradeVote": {
            "upgradeApprove": false,
            "upgradeDelay": 0n,
            "upgradePropose": "",
          },
        },
      ]
    `)
  })

  it('Can be processed correctly from algod raw block', async () => {
    const txn = await algorand.client.indexer.lookupTransactionByID(txnId).do()
    const b = (await getBlocksBulk({ startRound: roundNumber, maxRound: roundNumber }, algorand.client.algod))[0]
    const intraRoundOffset = txn.transaction.intraRoundOffset!

    const transformed = getBlockTransactions(b)

    const receivedTxn = transformed[intraRoundOffset]
    expect(receivedTxn.transaction.txID()).toBe(txnId)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/
    expect(getTransactionInBlockForDiff(receivedTxn)).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 142,
        "parentIntraRoundOffset": undefined,
        "parentTransactionId": undefined,
        "transaction": {
          "applicationCall": {
            "access": [],
            "accounts": [
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
            "appIndex": 1201559522n,
            "approvalProgram": "",
            "boxes": [],
            "clearProgram": "",
            "extraPages": 0,
            "foreignApps": [
              1002541853n,
              1390675395n,
            ],
            "foreignAssets": [
              246519683n,
              1390638935n,
            ],
            "numGlobalByteSlices": 0,
            "numGlobalInts": 0,
            "numLocalByteSlices": 0,
            "numLocalInts": 0,
            "onComplete": 0,
            "rejectVersion": 0,
          },
          "fee": 1000n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "genesisID": "mainnet-v1.0",
          "group": "cHiEEvBCRGnUhz9409gHl/vn00lYDZnJoppC3YexRr0=",
          "lastValid": 35214369n,
          "lease": "G/BcDWMoEGKAU7T9/w0NETqkoDB/xtSwSSUQIxVFKIM=",
          "note": "ABIRHgWWCypehpzUwrbxXIKwEdZxJIiyB+SyTfGUvgXhtJbAjwjsm0eEIHe5p3nB",
          "rekeyTo": "GEAW6VVQY2QPYKEI6HAHAH3MNQNMXYOVKYVVI3B7X72CPW74HRVYXWGITU",
          "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "appl",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/1/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 1])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 143,
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "transaction": {
          "fee": 1000n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "bLXdzryB627WoBOJ446eOJsiCi1Kfe/CKPTHRYKDsp0=",
          "lastValid": 35214369n,
          "payment": {
            "amount": 1539037n,
            "receiver": "QDNLKZLNM6ZUD4ZI24RSY6O4QHWF3RHDQIYDV7S5AAHKFZSV2MSSULCE4U",
          },
          "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "pay",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/1",
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/2/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 2])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 144,
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "transaction": {
          "applicationCall": {
            "access": [],
            "accounts": [
              "QDNLKZLNM6ZUD4ZI24RSY6O4QHWF3RHDQIYDV7S5AAHKFZSV2MSSULCE4U",
            ],
            "appArgs": [
              "c3dhcA==",
              "Zml4ZWQtaW5wdXQ=",
              "AAAAAAAAAAA=",
            ],
            "appIndex": 1002541853n,
            "approvalProgram": "",
            "boxes": [],
            "clearProgram": "",
            "extraPages": 0,
            "foreignApps": [],
            "foreignAssets": [
              246519683n,
            ],
            "numGlobalByteSlices": 0,
            "numGlobalInts": 0,
            "numLocalByteSlices": 0,
            "numLocalInts": 0,
            "onComplete": 0,
            "rejectVersion": 0,
          },
          "fee": 2000n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "bLXdzryB627WoBOJ446eOJsiCi1Kfe/CKPTHRYKDsp0=",
          "lastValid": 35214369n,
          "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "appl",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/2",
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/3/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 3])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 145,
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "transaction": {
          "assetTransfer": {
            "amount": 394437n,
            "assetIndex": 246519683n,
            "receiver": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          },
          "fee": 0n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "lastValid": 35214369n,
          "sender": "QDNLKZLNM6ZUD4ZI24RSY6O4QHWF3RHDQIYDV7S5AAHKFZSV2MSSULCE4U",
          "type": "axfer",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/3",
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/4/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 4])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 146,
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "transaction": {
          "assetTransfer": {
            "amount": 394437n,
            "assetIndex": 246519683n,
            "receiver": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
          },
          "fee": 1000n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "6ZssGapPFZ+DyccRludq0YjZigi05/FSeUAOFNDGGlo=",
          "lastValid": 35214369n,
          "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "axfer",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/4",
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 5])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 147,
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "transaction": {
          "applicationCall": {
            "access": [],
            "accounts": [],
            "appArgs": [
              "AA==",
              "Aw==",
              "AAAAAAAAAAA=",
              "BAAAAAAABgTFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            ],
            "appIndex": 1390675395n,
            "approvalProgram": "",
            "boxes": [],
            "clearProgram": "",
            "extraPages": 0,
            "foreignApps": [],
            "foreignAssets": [
              1390638935n,
            ],
            "numGlobalByteSlices": 0,
            "numGlobalInts": 0,
            "numLocalByteSlices": 0,
            "numLocalInts": 0,
            "onComplete": 0,
            "rejectVersion": 0,
          },
          "fee": 2000n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "6ZssGapPFZ+DyccRludq0YjZigi05/FSeUAOFNDGGlo=",
          "lastValid": 35214369n,
          "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "appl",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/5",
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/6/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 6])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 148,
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "transaction": {
          "assetTransfer": {
            "amount": 536012365n,
            "assetIndex": 1390638935n,
            "receiver": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          },
          "fee": 0n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "lastValid": 35214369n,
          "sender": "RS7QNBEPRRIBGI5COVRWFCRUS5NC5NX7UABZSTSFXQ6F74EP3CNLT4CNAM",
          "type": "axfer",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/6",
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/7/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 7])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 149,
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "transaction": {
          "assetTransfer": {
            "amount": 536012365n,
            "assetIndex": 1390638935n,
            "receiver": "GJQLSF3KJZFRN7PMUYLDAOUVNHQVFMFXUNO6UPXVQH3GJXM5T53PF4TXEE",
          },
          "fee": 1000n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "dsT4D4kYR3KthS3jbi4rJee2ej8gQChwzsQD8auclWw=",
          "lastValid": 35214369n,
          "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "axfer",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/7",
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/8/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 8])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 150,
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "transaction": {
          "applicationCall": {
            "access": [],
            "accounts": [
              "GJQLSF3KJZFRN7PMUYLDAOUVNHQVFMFXUNO6UPXVQH3GJXM5T53PF4TXEE",
            ],
            "appArgs": [
              "c3dhcA==",
              "Zml4ZWQtaW5wdXQ=",
              "AAAAAAAAAAA=",
            ],
            "appIndex": 1002541853n,
            "approvalProgram": "",
            "boxes": [],
            "clearProgram": "",
            "extraPages": 0,
            "foreignApps": [],
            "foreignAssets": [
              1390638935n,
            ],
            "numGlobalByteSlices": 0,
            "numGlobalInts": 0,
            "numLocalByteSlices": 0,
            "numLocalInts": 0,
            "onComplete": 0,
            "rejectVersion": 0,
          },
          "fee": 2000n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "group": "dsT4D4kYR3KthS3jbi4rJee2ej8gQChwzsQD8auclWw=",
          "lastValid": 35214369n,
          "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "appl",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/8",
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/9/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 9])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 151,
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "transaction": {
          "fee": 0n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "lastValid": 35214369n,
          "payment": {
            "amount": 1556942n,
            "receiver": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          },
          "sender": "GJQLSF3KJZFRN7PMUYLDAOUVNHQVFMFXUNO6UPXVQH3GJXM5T53PF4TXEE",
          "type": "pay",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/9",
      }
    `)

    // https://allo.info/tx/QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/10/
    expect(getTransactionInBlockForDiff(transformed[intraRoundOffset + 10])).toMatchInlineSnapshot(`
      {
        "assetCloseAmount": undefined,
        "closeAmount": undefined,
        "createdAppId": undefined,
        "createdAssetId": undefined,
        "intraRoundOffset": 152,
        "parentIntraRoundOffset": 142,
        "parentTransactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q",
        "transaction": {
          "fee": 1000n,
          "firstValid": 35214365n,
          "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
          "lastValid": 35214369n,
          "payment": {
            "amount": 0n,
            "receiver": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          },
          "rekeyTo": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "sender": "AACCDJTFPQR5UQJZ337NFR56CC44T776EWBGVJG5NY2QFTQWBWTALTEN4A",
          "type": "pay",
        },
        "transactionId": "QLYC4KMQW5RZRA7W5GYCJ4CUVWWSZKMK2V4X3XFQYSGYCJH6LI4Q/inner/10",
      }
    `)
  })

  it('Transforms axfer without an arcv address', async () => {
    const blocks = await getBlocksBulk({ startRound: 39373576n, maxRound: 39373576n }, algorand.client.algod) // Contains an axfer opt out inner transaction without an arcv address
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b))

    expect(blockTransactions.length).toBe(30)
    expect(blockTransactions[5].transaction.assetTransfer?.receiver.toString()).toBe(ALGORAND_ZERO_ADDRESS)
  })

  it('Transforms pay without a rcv address', async () => {
    const blocks = await getBlocksBulk({ startRound: 39723800n, maxRound: 39723800n }, algorand.client.algod) // Contains a pay close account inner transaction without a rcv address
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b))

    expect(blockTransactions.length).toBe(486)
    expect(blockTransactions[371].transaction.payment?.receiver.toString()).toBe(ALGORAND_ZERO_ADDRESS)
  })

  it('Produces the correct txID for a non hgi transaction', async () => {
    const blocks = await getBlocksBulk({ startRound: 39430981n, maxRound: 39430981n }, algorand.client.algod)
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b))

    const transaction = getIndexerTransactionFromAlgodTransaction(blockTransactions[0])
    expect(transaction.id).toBe('HHQHASIF2YLCSUYIPE6LIMLSNLCVMQBQHF3X46SKTX6F7ZSFKFCQ')
    expect(transaction.id).toBe(blockTransactions[0].transaction.txID())
  })

  it('Produces the correct state deltas in an app call transaction', async () => {
    const blocks = await getBlocksBulk({ startRound: 39430981n, maxRound: 39430981n }, algorand.client.algod)
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b))

    const transaction = getIndexerTransactionFromAlgodTransaction(blockTransactions[9])
    const transactionForDiff = getSubscribedTransactionForDiff(transaction)
    const localStateDelta = transactionForDiff.localStateDelta
    const globalStateDelta = transactionForDiff.globalStateDelta
    expect(globalStateDelta).toMatchInlineSnapshot(`
      [
        {
          "key": "Y3VycmVudF9taW5lcl9lZmZvcnQ=",
          "value": {
            "action": 2,
            "uint": 412000n,
          },
        },
        {
          "key": "dG90YWxfZWZmb3J0",
          "value": {
            "action": 2,
            "uint": 2129702852933n,
          },
        },
        {
          "key": "dG90YWxfdHJhbnNhY3Rpb25z",
          "value": {
            "action": 2,
            "uint": 324424783n,
          },
        },
      ]
    `)
    expect(localStateDelta).toMatchInlineSnapshot(`
      [
        {
          "address": "R4Q3KN5RBXUQIJWSVMQUJ7FTL7YURP6DY6W724HTD4Z43IRGUCZ2ORANGE",
          "delta": [
            {
              "key": "ZWZmb3J0",
              "value": {
                "action": 2,
                "uint": 412000n,
              },
            },
          ],
        },
      ]
    `)
  })

  it('Produces base64 encoded programs for an application create transaction', async () => {
    const blocks = await getBlocksBulk({ startRound: 34632059n, maxRound: 34632059n }, algorand.client.algod) // Contains a appl create transaction with approval and clear state programs
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b))

    expect(blockTransactions.length).toBe(14)

    const transaction = getIndexerTransactionFromAlgodTransaction(blockTransactions[5])
    const transactionForDiff = getSubscribedTransactionForDiff(transaction)

    expect(transactionForDiff.applicationTransaction!.approvalProgram).toBe(
      'CSAFAAGAgKSPxPlaEAImDwpsYXN0X21pbmVyDmhhbHZpbmdfc3VwcGx5EWxhc3RfbWluZXJfZWZmb3J0BmVmZm9ydAV0b2tlbgdoYWx2aW5nDG1pbmVkX3N1cHBseQxtaW5lcl9yZXdhcmQUY3VycmVudF9taW5lcl9lZmZvcnQFYmxvY2sMdG90YWxfZWZmb3J0EnRvdGFsX3RyYW5zYWN0aW9ucw1jdXJyZW50X21pbmVyD3N0YXJ0X3RpbWVzdGFtcAAxGCINgQYLMRkIjQgDCgMrAAAAAAAAAAADHQMsAIgAAiNDigAAJwQiZycJImcnCiJnJwsiZycFImcpgYCA0ofivC1nJwYiZycHgYCAgDJnKDIDZyoiZycMMgNnJwgiZycNgYCByKwGZ4mKAAAnBLGBA7IQgAZPcmFuZ2WyJoADT1JBsiUyCrIpMgqyKjIDsisyA7IsJLIigQiyI4A6aXBmczovL1FtVWl0eEp1UEpKcmN1QWRBaVZkRUVwdXpHbXNFTEdnQXZoTGQ1RmlYUlNoRXUjYXJjM7IngCDT/VG+LujCsXp66CbTScDfIP6rik1oAwNAHHQVYMMkNrIoIrIBgKgBSm9obiBBbGFuIFdvb2RzIDAxL0RlYy8yMDIzIFlvdSBrbm93LCBJIGNhbiBwdWxsIG1ldHJpY3Mgb3V0IG9mIHRoZSBhaXIgdG9vLCB3aGF0ZXZlciwgOCBtaWxsaW9uIHRyYW5zYWN0aW9ucyBvdmVyIHRoZSBsYXN0IHdlZWssIEkgZG9uJ3Qga25vdywgbXkgbW9tIGhhcyBmb3VyIG9yYW5nZXMusgWztDxniYgAAiNDigAAJwRkIhJBAAOI/qQxACsiZomKAwAyBjIGgQUYCYz/Jwlki/8TQQC3KGQnBGRwAExIQQB0KWQnB2QNQQAGJwdkQgACKWSM/rGBBLIQJwRkshEoZLIUi/6yEiKyAbMoZCpkFlCwJwYnBmSL/ghnKSlki/4JZylkIhJBAC0nBScFZCMIZycFZCUPQQAKKSQnBmQJZ0IAEykkJwZkCSEECmcnBycHZCEECmcoZDYyAGFBABsoZCtijP0oZCuL/SpkDUEACIv9KmQJQgABImYnCYv/ZygnDGRnKicIZGcnCCJniScOSTYaAUkVgSASRIgAAiNDigMAi/82MgArY0xIRDIHJw1kD0QnBWQlDkQxAYGgnAEORCcORwKI/vgnCicKZDEBCGcnCycLZCMIZ4v/K2IxAQiM/ov/K4v+Zov+jP0oZIv/EkEAE4v9KmQNQQAIi/0qZAlCAAEijP2L/ScIZA1BAAonDIv/ZycIi/1niTEbQfzygAS4RHs2NhoAjgH85QCABKsjcMw2GgCOAf9TAAAxG0H+ZQA=',
    )
    expect(transactionForDiff.applicationTransaction!.clearStateProgram).toBe('CQ==')
  })

  it('Produces the correct state deltas in an application call transaction with r key', async () => {
    const blocks = await getBlocksBulk({ startRound: 45172924n, maxRound: 45172924n }, algorand.client.algod) // Contains an axfer opt out inner transaction without an arcv address
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b))
    const txn = blockTransactions[4]

    const transaction = getIndexerTransactionFromAlgodTransaction(txn)
    const globalStateDelta = transaction.globalStateDelta
    expect(globalStateDelta).toMatchInlineSnapshot(`
      [
        EvalDeltaKeyValue {
          "key": "cg==",
          "value": EvalDelta {
            "action": 2,
            "bytes": undefined,
            "uint": 6311n,
          },
        },
        EvalDeltaKeyValue {
          "key": "cmk=",
          "value": EvalDelta {
            "action": 1,
            "bytes": "gfOn0O9iF4/OGJ6kRsOFfbp/zhAedEwoZL/escO+M+QAAAAAQ/9CAQAAAAACsUi5AwAkCj8UAphDyseTKWeF7KZFZuNK8zA9rbqocWk+NJ5CpMtNsCSq7S8AAAAAAAAAJxAAAABi6BgWCgAAAAAAAAAA",
            "uint": 0n,
          },
        },
      ]
    `)
  })
})
