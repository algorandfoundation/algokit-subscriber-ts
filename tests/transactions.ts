import * as algokit from '@algorandfoundation/algokit-utils'
import { SendTransactionFrom, SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import { Algodv2, Indexer } from 'algosdk'
import { getSubscribedTransactions } from '../src'
import { TransactionSubscriptionParams } from '../src/types/subscription'

export const SendXTransactions = async (x: number, account: SendTransactionFrom, algod: Algodv2) => {
  const txns: SendTransactionResult[] = []
  for (let i = 0; i < x; i++) {
    txns.push(
      await algokit.transferAlgos(
        {
          amount: (1).algos(),
          from: account,
          to: account,
        },
        algod,
      ),
    )
  }
  const lastTxnRound = Number(txns[x - 1].confirmation?.confirmedRound)

  return {
    txns,
    txIds: txns.map((t) => t.transaction.txID()),
    lastTxnRound,
    rounds: txns.map((t) => Number(t.confirmation!.confirmedRound)),
  }
}

export const GetSubscribedTransactionsFromSender = (
  subscription: {
    syncBehaviour: TransactionSubscriptionParams['syncBehaviour']
    roundsToSync: number
    watermark?: number
    currentRound?: number
  },
  account: SendTransactionFrom,
  algod: Algodv2,
  indexer?: Indexer,
) => {
  const { roundsToSync, syncBehaviour, watermark, currentRound } = subscription

  if (currentRound !== undefined) {
    const existingStatus = algod.status
    Object.assign(algod, {
      status: jest.fn().mockImplementation(() => {
        return {
          do: async () => {
            const status = await existingStatus.apply(algod).do()
            status['last-round'] = currentRound
            return status
          },
        }
      }),
    })
  }

  return getSubscribedTransactions(
    {
      filter: {
        sender: algokit.getSenderAddress(account),
      },
      maxRoundsToSync: roundsToSync,
      syncBehaviour: syncBehaviour,
      watermark: watermark ?? 0,
    },
    algod,
    indexer,
  )
}
