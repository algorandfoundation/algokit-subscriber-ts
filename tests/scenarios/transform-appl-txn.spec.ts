import algosdk, { UntypedValue } from 'algosdk'
import { describe, expect, it } from 'vitest'
import { getBlockTransactions, getIndexerTransactionFromAlgodTransaction } from '../../src/transform'

describe('Application transaction', () => {
  it('correctly handles application access list', async () => {
    const block = new algosdk.modelsv2.BlockResponse({
      block: new algosdk.Block({
        header: new algosdk.BlockHeader({
          round: 8670n,
          timestamp: 1758683634n,
          genesisID: 'dockernet-v1',
          genesisHash: new Uint8Array([
            224, 98, 0, 143, 179, 147, 51, 66, 97, 55, 93, 12, 84, 251, 18, 30, 102, 58, 226, 21, 145, 85, 241, 231, 59, 55, 213, 85, 167,
            79, 239, 157,
          ]),
          branch: new Uint8Array([
            32, 242, 130, 230, 53, 223, 251, 112, 95, 122, 187, 102, 237, 110, 23, 155, 228, 93, 86, 240, 145, 99, 119, 80, 120, 196, 65,
            235, 68, 51, 139, 155,
          ]),
          seed: new Uint8Array([
            32, 242, 130, 230, 53, 223, 251, 112, 95, 122, 187, 102, 237, 110, 23, 155, 228, 93, 86, 240, 145, 99, 119, 80, 120, 196, 65,
            235, 68, 51, 139, 155,
          ]),
          proposer: algosdk.Address.zeroAddress(),
          proposerPayout: 0n,
          feesCollected: 1000n,
          bonus: 10000000n,
          rewardState: new algosdk.RewardState({
            feeSink: new algosdk.Address(
              new Uint8Array([
                7, 218, 203, 75, 109, 158, 209, 65, 177, 117, 118, 189, 69, 154, 230, 66, 29, 72, 109, 163, 212, 239, 34, 71, 196, 9, 163,
                150, 184, 46, 162, 33,
              ]),
            ),
            rewardsPool: new algosdk.Address(
              new Uint8Array([
                255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
                255, 255, 255, 255, 255, 255, 255,
              ]),
            ),
            rewardsLevel: 0n,
            rewardsRate: 0n,
            rewardsResidue: 0n,
            rewardsRecalculationRound: 500000n,
          }),
          upgradeState: new algosdk.UpgradeState({
            currentProtocol: 'https://github.com/algorandfoundation/specs/tree/953304de35264fc3ef91bcd05c123242015eeaed',
            nextProtocol: '',
            nextProtocolApprovals: 0n,
            nextProtocolSwitchOn: 0n,
            nextProtocolVoteBefore: 0n,
          }),
          txnCommitments: new algosdk.TxnCommitments({
            nativeSha512_256Commitment: new Uint8Array([
              229, 183, 225, 191, 141, 93, 71, 223, 211, 53, 46, 40, 251, 198, 81, 216, 19, 100, 165, 70, 211, 58, 51, 182, 94, 79, 5, 163,
              161, 7, 36, 12,
            ]),
            sha256Commitment: new Uint8Array([
              19, 54, 233, 239, 227, 173, 192, 159, 154, 6, 73, 6, 53, 93, 95, 242, 223, 183, 11, 73, 98, 193, 45, 16, 130, 31, 29, 112, 37,
              213, 220, 178,
            ]),
          }),
          stateproofTracking: new Map([
            [
              0,
              new algosdk.StateProofTrackingData({
                stateProofVotersCommitment: new Uint8Array(),
                stateProofOnlineTotalWeight: 0n,
                stateProofNextRound: 8704n,
              }),
            ],
          ]),
          participationUpdates: new algosdk.ParticipationUpdates({
            expiredParticipationAccounts: [],
            absentParticipationAccounts: [],
          }),
          upgradeVote: new algosdk.UpgradeVote({
            upgradePropose: '',
            upgradeDelay: 0n,
            upgradeApprove: false,
          }),
          txnCounter: 11271n,
        }),
        payset: [
          new algosdk.SignedTxnInBlock({
            signedTxn: new algosdk.SignedTxnWithAD({
              signedTxn: new algosdk.SignedTransaction({
                sig: new Uint8Array([
                  219, 164, 210, 216, 18, 195, 71, 195, 25, 223, 63, 92, 13, 77, 191, 161, 22, 10, 205, 137, 250, 195, 178, 19, 130, 105,
                  249, 81, 89, 228, 224, 79, 75, 161, 109, 147, 160, 119, 78, 114, 144, 89, 11, 204, 8, 242, 181, 130, 8, 218, 233, 225,
                  168, 214, 100, 87, 241, 63, 231, 32, 189, 113, 97, 5,
                ]),
                txn: new algosdk.Transaction({
                  type: algosdk.TransactionType.appl,
                  sender: new algosdk.Address(
                    new Uint8Array([
                      40, 216, 160, 244, 127, 212, 206, 188, 73, 36, 9, 194, 51, 208, 159, 185, 98, 55, 51, 168, 59, 185, 201, 57, 63, 5,
                      158, 63, 19, 44, 179, 161,
                    ]),
                  ),
                  suggestedParams: {
                    fee: 1000n,
                    minFee: 1000,
                    firstValid: 8669,
                    lastValid: 9669,
                  },
                  appCallParams: {
                    appIndex: 11270n,
                    onComplete: algosdk.OnApplicationComplete.NoOpOC,
                    appArgs: [new Uint8Array([241, 126, 128, 165]), new Uint8Array([0, 4, 116, 101, 115, 116])],
                    access: [
                      { appIndex: 123n },
                      { address: algosdk.Address.fromString('FDMKB5D72THLYSJEBHBDHUE7XFRDOM5IHO44SOJ7AWPD6EZMWOQ2WKN7HQ') },
                      { assetIndex: 54n },
                      {
                        holding: {
                          assetIndex: 54n,
                          address: algosdk.Address.fromString('FDMKB5D72THLYSJEBHBDHUE7XFRDOM5IHO44SOJ7AWPD6EZMWOQ2WKN7HQ'),
                        },
                      },
                      { appIndex: 432n },
                      {
                        locals: {
                          appIndex: 432n,
                          address: algosdk.Address.fromString('FDMKB5D72THLYSJEBHBDHUE7XFRDOM5IHO44SOJ7AWPD6EZMWOQ2WKN7HQ'),
                        },
                      },
                      { appIndex: 678n },
                      { box: { appIndex: 678n, name: new Uint8Array([1, 2, 3]) } },
                    ],
                  },
                }),
              }),
              applyData: new algosdk.ApplyData({
                applicationID: undefined,
                evalDelta: new algosdk.EvalDelta({
                  globalDelta: new Map(),
                  localDeltas: new Map(),
                  logs: [new Uint8Array([21, 31, 124, 117, 0, 11, 72, 101, 108, 108, 111, 44, 32, 116, 101, 115, 116])],
                  innerTxns: [],
                }),
              }),
            }),
            hasGenesisID: true,
            hasGenesisHash: false,
          }),
        ],
      }),
      cert: new UntypedValue(new Map([['rnd', 8670n]])),
    })

    const txn = getBlockTransactions(block)[0]
    const transaction = getIndexerTransactionFromAlgodTransaction(txn)

    expect(transaction.applicationTransaction?.access).toMatchInlineSnapshot(`
      [
        ResourceRef {
          "address": undefined,
          "applicationId": 123,
          "assetId": undefined,
          "box": undefined,
          "holding": undefined,
          "local": undefined,
        },
        ResourceRef {
          "address": Address {
            "publicKey": Uint8Array [
              40,
              216,
              160,
              244,
              127,
              212,
              206,
              188,
              73,
              36,
              9,
              194,
              51,
              208,
              159,
              185,
              98,
              55,
              51,
              168,
              59,
              185,
              201,
              57,
              63,
              5,
              158,
              63,
              19,
              44,
              179,
              161,
            ],
          },
          "applicationId": undefined,
          "assetId": undefined,
          "box": undefined,
          "holding": undefined,
          "local": undefined,
        },
        ResourceRef {
          "address": undefined,
          "applicationId": undefined,
          "assetId": 54,
          "box": undefined,
          "holding": undefined,
          "local": undefined,
        },
        ResourceRef {
          "address": undefined,
          "applicationId": undefined,
          "assetId": undefined,
          "box": undefined,
          "holding": HoldingRef {
            "address": Address {
              "publicKey": Uint8Array [
                40,
                216,
                160,
                244,
                127,
                212,
                206,
                188,
                73,
                36,
                9,
                194,
                51,
                208,
                159,
                185,
                98,
                55,
                51,
                168,
                59,
                185,
                201,
                57,
                63,
                5,
                158,
                63,
                19,
                44,
                179,
                161,
              ],
            },
            "asset": 54,
          },
          "local": undefined,
        },
        ResourceRef {
          "address": undefined,
          "applicationId": 432,
          "assetId": undefined,
          "box": undefined,
          "holding": undefined,
          "local": undefined,
        },
        ResourceRef {
          "address": undefined,
          "applicationId": undefined,
          "assetId": undefined,
          "box": undefined,
          "holding": undefined,
          "local": LocalsRef {
            "address": Address {
              "publicKey": Uint8Array [
                40,
                216,
                160,
                244,
                127,
                212,
                206,
                188,
                73,
                36,
                9,
                194,
                51,
                208,
                159,
                185,
                98,
                55,
                51,
                168,
                59,
                185,
                201,
                57,
                63,
                5,
                158,
                63,
                19,
                44,
                179,
                161,
              ],
            },
            "app": 432,
          },
        },
        ResourceRef {
          "address": undefined,
          "applicationId": 678,
          "assetId": undefined,
          "box": undefined,
          "holding": undefined,
          "local": undefined,
        },
        ResourceRef {
          "address": undefined,
          "applicationId": undefined,
          "assetId": undefined,
          "box": BoxReference {
            "app": 678,
            "name": Uint8Array [
              1,
              2,
              3,
            ],
          },
          "holding": undefined,
          "local": undefined,
        },
      ]
    `)
  })

  it('correctly handles application reject version', async () => {
    const block = new algosdk.modelsv2.BlockResponse({
      block: new algosdk.Block({
        header: new algosdk.BlockHeader({
          round: 23056n,
          timestamp: 1758786416n,
          genesisID: 'dockernet-v1',
          genesisHash: new Uint8Array([
            224, 98, 0, 143, 179, 147, 51, 66, 97, 55, 93, 12, 84, 251, 18, 30, 102, 58, 226, 21, 145, 85, 241, 231, 59, 55, 213, 85, 167,
            79, 239, 157,
          ]),
          branch: new Uint8Array([
            13, 50, 44, 85, 195, 58, 235, 18, 240, 186, 208, 118, 213, 194, 136, 113, 62, 70, 155, 114, 31, 20, 190, 74, 219, 166, 55, 165,
            198, 239, 63, 184,
          ]),
          seed: new Uint8Array([
            13, 50, 44, 85, 195, 58, 235, 18, 240, 186, 208, 118, 213, 194, 136, 113, 62, 70, 155, 114, 31, 20, 190, 74, 219, 166, 55, 165,
            198, 239, 63, 184,
          ]),
          proposer: algosdk.Address.zeroAddress(),
          proposerPayout: 0n,
          feesCollected: 1000n,
          bonus: 10000000n,
          rewardState: new algosdk.RewardState({
            feeSink: new algosdk.Address(
              new Uint8Array([
                7, 218, 203, 75, 109, 158, 209, 65, 177, 117, 118, 189, 69, 154, 230, 66, 29, 72, 109, 163, 212, 239, 34, 71, 196, 9, 163,
                150, 184, 46, 162, 33,
              ]),
            ),
            rewardsPool: new algosdk.Address(
              new Uint8Array([
                255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
                255, 255, 255, 255, 255, 255, 255,
              ]),
            ),
            rewardsLevel: 0n,
            rewardsRate: 0n,
            rewardsResidue: 0n,
            rewardsRecalculationRound: 500000n,
          }),
          upgradeState: new algosdk.UpgradeState({
            currentProtocol: 'https://github.com/algorandfoundation/specs/tree/953304de35264fc3ef91bcd05c123242015eeaed',
            nextProtocol: '',
            nextProtocolApprovals: 0n,
            nextProtocolSwitchOn: 0n,
            nextProtocolVoteBefore: 0n,
          }),
          txnCommitments: new algosdk.TxnCommitments({
            nativeSha512_256Commitment: new Uint8Array([
              137, 51, 213, 64, 101, 123, 159, 152, 130, 101, 105, 49, 148, 109, 69, 38, 48, 61, 102, 185, 119, 16, 21, 160, 62, 254, 89,
              54, 147, 175, 138, 29,
            ]),
            sha256Commitment: new Uint8Array([
              88, 232, 193, 250, 126, 51, 202, 241, 244, 41, 212, 183, 227, 211, 58, 245, 237, 172, 178, 197, 254, 95, 75, 42, 129, 75, 135,
              206, 74, 92, 211, 58,
            ]),
          }),
          stateproofTracking: new Map([
            [
              0,
              new algosdk.StateProofTrackingData({
                stateProofVotersCommitment: new Uint8Array(),
                stateProofOnlineTotalWeight: 0n,
                stateProofNextRound: 23296n,
              }),
            ],
          ]),
          participationUpdates: new algosdk.ParticipationUpdates({
            expiredParticipationAccounts: [],
            absentParticipationAccounts: [],
          }),
          upgradeVote: new algosdk.UpgradeVote({
            upgradePropose: '',
            upgradeDelay: 0n,
            upgradeApprove: false,
          }),
          txnCounter: 28645n,
        }),
        payset: [
          new algosdk.SignedTxnInBlock({
            signedTxn: new algosdk.SignedTxnWithAD({
              signedTxn: new algosdk.SignedTransaction({
                sig: new Uint8Array([
                  136, 247, 170, 92, 235, 121, 107, 200, 114, 94, 68, 237, 20, 28, 22, 135, 85, 121, 147, 120, 184, 185, 57, 205, 255, 58,
                  27, 115, 169, 216, 89, 108, 232, 145, 194, 90, 51, 146, 211, 173, 3, 173, 110, 176, 236, 224, 152, 209, 106, 43, 115, 140,
                  193, 27, 56, 45, 53, 47, 67, 172, 186, 13, 199, 5,
                ]),
                txn: new algosdk.Transaction({
                  type: algosdk.TransactionType.appl,
                  sender: new algosdk.Address(
                    new Uint8Array([
                      15, 186, 47, 211, 220, 116, 124, 144, 198, 46, 85, 43, 199, 18, 249, 184, 228, 178, 228, 81, 2, 57, 11, 216, 17, 182,
                      204, 34, 254, 97, 100, 250,
                    ]),
                  ),
                  suggestedParams: {
                    fee: 0,
                    minFee: 1000,
                    firstValid: 23055,
                    lastValid: 24055,
                  },
                  appCallParams: {
                    appIndex: 28639n,
                    onComplete: algosdk.OnApplicationComplete.NoOpOC,
                    appArgs: [new Uint8Array([241, 126, 128, 165]), new Uint8Array([0, 5, 104, 101, 108, 108, 111])],
                    access: [],
                    rejectVersion: 3,
                  },
                }),
              }),
              applyData: new algosdk.ApplyData({
                applicationID: undefined,
                evalDelta: new algosdk.EvalDelta({
                  globalDelta: new Map(),
                  localDeltas: new Map(),
                  logs: [new Uint8Array([21, 31, 124, 117, 0, 12, 72, 101, 108, 108, 111, 44, 32, 104, 101, 108, 108, 111])],
                  innerTxns: [],
                }),
              }),
            }),
            hasGenesisID: true,
            hasGenesisHash: false,
          }),
        ],
      }),
      cert: new UntypedValue(new Map([['rnd', 23056n]])),
    })

    const txn = getBlockTransactions(block)[0]
    const transaction = getIndexerTransactionFromAlgodTransaction(txn)

    expect(transaction.applicationTransaction?.rejectVersion).toBe(3)
  })
})
