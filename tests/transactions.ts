import * as algokit from '@algorandfoundation/algokit-utils'
import { SendTransactionFrom, SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import { Algodv2 } from 'algosdk'
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
    lastTxnRound,
  }
}

export const GetSubscribedTransactionsFromSender = (
  subscription: { syncBehaviour: TransactionSubscriptionParams['syncBehaviour']; roundsToSync: number; watermark?: number },
  account: SendTransactionFrom,
  algod: Algodv2,
) => {
  const { roundsToSync, syncBehaviour, watermark } = subscription

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
  )
}
