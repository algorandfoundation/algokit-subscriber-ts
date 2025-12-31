import { Address } from '@algorandfoundation/algokit-utils'
import type { BlockResponse } from '@algorandfoundation/algokit-utils/algod-client'
import { Transaction, TransactionType } from '@algorandfoundation/algokit-utils/transact'
import { describe, expect, it } from 'vitest'
import { getBlockTransactions, getIndexerTransactionFromAlgodTransaction } from '../../src/transform'

describe('Payment transaction', () => {
  it('correctly handles payment lmsig logicsig signed transaction', async () => {
    const sender = Address.fromString('RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM')
    const receiver = Address.fromString('PHWNJTJMA6E4RYZX4SN46QO3OYEXCB46ZIR7B7NJEN5R7PARRKZJBB4FUU')
    const genesisHash = new Uint8Array([
      224, 98, 0, 143, 179, 147, 51, 66, 97, 55, 93, 12, 84, 251, 18, 30, 102, 58, 226, 21, 145, 85, 241, 231, 59, 55, 213, 85, 167, 79,
      239, 157,
    ])

    const txn = new Transaction({
      type: TransactionType.Payment,
      sender,
      fee: 217000n,
      firstValid: 9390n,
      lastValid: 9493n,
      genesisId: 'dockernet-v1',
      genesisHash,
      note: new Uint8Array([180, 81, 121, 57, 252, 250, 210, 113]),
      payment: {
        receiver,
        amount: 1000n,
      },
    })

    const block: BlockResponse = {
      block: {
        header: {
          round: 9394n,
          timestamp: 1758701734n,
          genesisId: 'dockernet-v1',
          genesisHash,
          previousBlockHash: new Uint8Array(32),
          seed: new Uint8Array(32),
          txnCommitments: {
            nativeSha512_256Commitment: new Uint8Array(32),
          },
          rewardState: {
            feeSink: Address.zeroAddress(),
            rewardsPool: Address.zeroAddress(),
            rewardsLevel: 0n,
            rewardsRate: 0n,
            rewardsResidue: 0n,
            rewardsRecalculationRound: 500000n,
          },
          upgradeState: {
            currentProtocol: 'https://github.com/algorandfoundation/specs/tree/953304de35264fc3ef91bcd05c123242015eeaed',
          },
          participationUpdates: {
            expiredParticipationAccounts: [],
            absentParticipationAccounts: [],
          },
          txnCounter: 11271n,
        },
        payset: [
          {
            signedTxn: {
              signedTxn: {
                lsig: {
                  logic: new Uint8Array([1, 32, 1, 1, 34]),
                  args: [new Uint8Array([1]), new Uint8Array([2, 3])],
                  lmsig: {
                    version: 1,
                    threshold: 2,
                    subsigs: [
                      {
                        publicKey: new Uint8Array([
                          27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190,
                          177, 34, 9, 168, 171, 129, 120,
                        ]),
                        sig: new Uint8Array([
                          140, 51, 101, 196, 177, 209, 19, 112, 242, 63, 112, 215, 119, 70, 159, 225, 217, 71, 121, 191, 77, 141, 100, 129,
                          118, 73, 53, 239, 120, 76, 204, 118, 87, 108, 192, 224, 239, 233, 193, 70, 250, 96, 118, 218, 250, 206, 85, 238,
                          154, 243, 27, 118, 142, 188, 50, 180, 236, 26, 44, 140, 61, 192, 103, 6,
                        ]),
                      },
                      {
                        publicKey: new Uint8Array([
                          9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175,
                          240, 26, 162, 92, 249, 194, 113,
                        ]),
                        sig: new Uint8Array([
                          79, 86, 212, 125, 217, 192, 177, 106, 21, 245, 136, 100, 233, 231, 67, 213, 49, 9, 31, 247, 175, 108, 178, 129,
                          223, 52, 13, 21, 58, 35, 110, 165, 217, 23, 115, 217, 255, 151, 101, 142, 247, 234, 99, 240, 55, 104, 205, 254,
                          40, 190, 138, 198, 130, 122, 243, 113, 173, 217, 132, 167, 56, 234, 229, 13,
                        ]),
                      },
                      {
                        publicKey: new Uint8Array([
                          231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134,
                          103, 244, 73, 88, 112, 104, 161,
                        ]),
                        sig: undefined,
                      },
                    ],
                  },
                },
                txn,
              },
              applyData: {},
            },
            hasGenesisId: true,
            hasGenesisHash: false,
          },
        ],
      },
      cert: { rnd: 9394n },
    }

    const blockTxn = getBlockTransactions(block)[0]
    const transaction = getIndexerTransactionFromAlgodTransaction(blockTxn)

    expect(transaction.signature?.logicsig?.logicMultisigSignature).toEqual({
      version: 1,
      threshold: 2,
      subsignature: [
        {
          publicKey: new Uint8Array([
            27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9,
            168, 171, 129, 120,
          ]),
          signature: new Uint8Array([
            140, 51, 101, 196, 177, 209, 19, 112, 242, 63, 112, 215, 119, 70, 159, 225, 217, 71, 121, 191, 77, 141, 100, 129, 118, 73, 53,
            239, 120, 76, 204, 118, 87, 108, 192, 224, 239, 233, 193, 70, 250, 96, 118, 218, 250, 206, 85, 238, 154, 243, 27, 118, 142, 188,
            50, 180, 236, 26, 44, 140, 61, 192, 103, 6,
          ]),
        },
        {
          publicKey: new Uint8Array([
            9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162,
            92, 249, 194, 113,
          ]),
          signature: new Uint8Array([
            79, 86, 212, 125, 217, 192, 177, 106, 21, 245, 136, 100, 233, 231, 67, 213, 49, 9, 31, 247, 175, 108, 178, 129, 223, 52, 13, 21,
            58, 35, 110, 165, 217, 23, 115, 217, 255, 151, 101, 142, 247, 234, 99, 240, 55, 104, 205, 254, 40, 190, 138, 198, 130, 122, 243,
            113, 173, 217, 132, 167, 56, 234, 229, 13,
          ]),
        },
        {
          publicKey: new Uint8Array([
            231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73,
            88, 112, 104, 161,
          ]),
          signature: undefined,
        },
      ],
    })
  })
})
