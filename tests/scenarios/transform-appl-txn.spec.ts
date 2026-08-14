import { Address } from '@algorandfoundation/algokit-utils'
import type { BlockResponse } from '@algorandfoundation/algokit-utils/algod-client'
import { OnApplicationComplete, Transaction, TransactionType } from '@algorandfoundation/algokit-utils/transact'
import { describe, expect, it } from 'vitest'
import { getBlockTransactions, getIndexerTransactionFromAlgodTransaction } from '../../src/transform'

describe('Application transaction', () => {
  it('correctly handles application access list', async () => {
    const sender = Address.fromString('FDMKB5D72THLYSJEBHBDHUE7XFRDOM5IHO44SOJ7AWPD6EZMWOQ2WKN7HQ')
    const genesisHash = new Uint8Array([
      224, 98, 0, 143, 179, 147, 51, 66, 97, 55, 93, 12, 84, 251, 18, 30, 102, 58, 226, 21, 145, 85, 241, 231, 59, 55, 213, 85, 167, 79,
      239, 157,
    ])

    const txn = new Transaction({
      type: TransactionType.AppCall,
      sender,
      fee: 1000n,
      firstValid: 8669n,
      lastValid: 9669n,
      genesisId: 'dockernet-v1',
      genesisHash,
      appCall: {
        appId: 11270n,
        onComplete: OnApplicationComplete.NoOp,
        args: [new Uint8Array([241, 126, 128, 165]), new Uint8Array([0, 4, 116, 101, 115, 116])],
        accessReferences: [
          { appId: 123n },
          { address: sender },
          { assetId: 54n },
          {
            holding: {
              assetId: 54n,
              address: sender,
            },
          },
          { appId: 432n },
          {
            locals: {
              appId: 432n,
              address: sender,
            },
          },
          { appId: 678n },
          { box: { appId: 678n, name: new Uint8Array([1, 2, 3]) } },
        ],
      },
    })

    const block: BlockResponse = {
      block: {
        header: {
          round: 8670n,
          timestamp: 1758683634n,
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
                sig: new Uint8Array(64),
                txn,
              },
              applyData: {
                evalDelta: {
                  logs: [new Uint8Array([21, 31, 124, 117, 0, 11, 72, 101, 108, 108, 111, 44, 32, 116, 101, 115, 116])],
                },
              },
            },
            hasGenesisId: true,
            hasGenesisHash: false,
          },
        ],
      },
      cert: { rnd: 8670n },
    }

    const blockTxn = getBlockTransactions(block)[0]
    const transaction = getIndexerTransactionFromAlgodTransaction(blockTxn)

    expect(transaction.applicationTransaction?.access).toEqual([
      { applicationId: 123n },
      { address: sender },
      { assetId: 54n },
      {
        holding: {
          address: sender,
          asset: 54n,
        },
      },
      { applicationId: 432n },
      {
        local: {
          address: sender,
          app: 432n,
        },
      },
      { applicationId: 678n },
      {
        box: {
          app: 678n,
          name: new Uint8Array([1, 2, 3]),
        },
      },
    ])
  })

  it('correctly handles application reject version', async () => {
    const sender = Address.fromString('B65C7U64OR6JBRROKUV4OEXZXDSLFZCRAI4QXWARW3GCF7TBMT5BSCOLGE')
    const genesisHash = new Uint8Array([
      224, 98, 0, 143, 179, 147, 51, 66, 97, 55, 93, 12, 84, 251, 18, 30, 102, 58, 226, 21, 145, 85, 241, 231, 59, 55, 213, 85, 167, 79,
      239, 157,
    ])

    const txn = new Transaction({
      type: TransactionType.AppCall,
      sender,
      fee: 0n,
      firstValid: 23055n,
      lastValid: 24055n,
      genesisId: 'dockernet-v1',
      genesisHash,
      appCall: {
        appId: 28639n,
        onComplete: OnApplicationComplete.NoOp,
        args: [new Uint8Array([241, 126, 128, 165]), new Uint8Array([0, 5, 104, 101, 108, 108, 111])],
        rejectVersion: 3,
      },
    })

    const block: BlockResponse = {
      block: {
        header: {
          round: 23056n,
          timestamp: 1758786416n,
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
          txnCounter: 28645n,
        },
        payset: [
          {
            signedTxn: {
              signedTxn: {
                sig: new Uint8Array(64),
                txn,
              },
              applyData: {
                evalDelta: {
                  logs: [new Uint8Array([21, 31, 124, 117, 0, 12, 72, 101, 108, 108, 111, 44, 32, 104, 101, 108, 108, 111])],
                },
              },
            },
            hasGenesisId: true,
            hasGenesisHash: false,
          },
        ],
      },
      cert: { rnd: 23056n },
    }

    const blockTxn = getBlockTransactions(block)[0]
    const transaction = getIndexerTransactionFromAlgodTransaction(blockTxn)

    expect(transaction.applicationTransaction?.rejectVersion).toBe(3)
  })
})
