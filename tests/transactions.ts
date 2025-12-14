import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import type { AddressWithSigners, Transaction } from '@algorandfoundation/algokit-utils/transact'
import { vi } from 'vitest'
import { getSubscribedTransactions } from '../src'
import type {
  Arc28EventGroup,
  NamedTransactionFilter,
  TransactionFilter,
  TransactionInBlock,
  TransactionSubscriptionParams,
} from '../src/types'

export const SendXTransactions = async (x: number, account: AddressWithSigners, algorand: AlgorandClient) => {
  const txns: SendTransactionResult[] = []
  for (let i = 0; i < x; i++) {
    algorand.setSignerFromAccount(account)
    txns.push(
      await algorand.send.payment({
        sender: account.addr,
        receiver: account.addr,
        amount: algo(1),
        note: `txn-${i} at ${new Date().toISOString()}`,
      }),
    )
  }
  const lastTxnRound = txns[x - 1].confirmation!.confirmedRound!

  return {
    txns,
    txIds: txns.map((t) => t.transaction.txId()),
    lastTxnRound,
    rounds: txns.map((t) => t.confirmation!.confirmedRound!),
  }
}

export const GetSubscribedTransactions = (
  subscription: {
    syncBehaviour: TransactionSubscriptionParams['syncBehaviour']
    roundsToSync: number
    indexerRoundsToSync?: number
    watermark?: bigint
    currentRound?: bigint
    filters: TransactionFilter | NamedTransactionFilter[]
    arc28Events?: Arc28EventGroup[]
  },
  algorand: AlgorandClient,
) => {
  const { roundsToSync, indexerRoundsToSync, syncBehaviour, watermark, currentRound, filters, arc28Events } = subscription

  if (currentRound !== undefined) {
    const existingGetStatus = algorand.client.algod.getStatus
    Object.assign(algorand.client.algod, {
      getStatus: vi.fn().mockImplementation(async () => {
        const status = await existingGetStatus.apply(algorand.client.algod)
        status.lastRound = currentRound
        return status
      }),
    })
  }

  return getSubscribedTransactions(
    {
      filters: Array.isArray(filters) ? filters : [{ name: 'default', filter: filters }],
      maxRoundsToSync: roundsToSync,
      maxIndexerRoundsToSync: indexerRoundsToSync,
      syncBehaviour: syncBehaviour,
      watermark: watermark ?? 0n,
      arc28Events,
    },
    algorand.client.algod,
    algorand.client.indexer,
  )
}

export const GetSubscribedTransactionsFromSender = (
  subscription: {
    syncBehaviour: TransactionSubscriptionParams['syncBehaviour']
    roundsToSync: number
    indexerRoundsToSync?: number
    watermark?: bigint
    currentRound?: bigint
  },
  account: AddressWithSigners | AddressWithSigners[],
  algorand: AlgorandClient,
) => {
  return GetSubscribedTransactions(
    {
      ...subscription,
      filters:
        account instanceof Array
          ? account.map((a) => a.addr).map((a) => ({ name: a.toString(), filter: { sender: a.toString() } }))
          : { sender: account.addr.toString() },
    },
    algorand,
  )
}

export function getTransactionInBlockForDiff(transaction: TransactionInBlock) {
  return {
    transactionId: transaction.transactionId,
    transaction: getTransactionForDiff(transaction.transaction),
    parentTransactionId: transaction.parentTransactionId,
    parentIntraRoundOffset: transaction.parentIntraRoundOffset,
    intraRoundOffset: transaction.intraRoundOffset,
    createdAppId: transaction.createdAppId,
    createdAssetId: transaction.createdAppId,
    assetCloseAmount: transaction.assetCloseAmount,
    closeAmount: transaction.closeAmount,
  }
}

export function getTransactionForDiff(transaction: Transaction) {
  const t = {
    ...transaction,
    appCall: transaction.appCall
      ? {
          ...transaction.appCall,
          accountReferences: transaction.appCall?.accountReferences?.map((a: { toString: () => string }) => a.toString()),
          args: transaction.appCall?.args?.map((a: Uint8Array) => Buffer.from(a).toString('base64')),
          approvalProgram: transaction.appCall?.approvalProgram
            ? Buffer.from(transaction.appCall.approvalProgram).toString('base64')
            : undefined,
          clearStateProgram: transaction.appCall?.clearStateProgram
            ? Buffer.from(transaction.appCall.clearStateProgram).toString('base64')
            : undefined,
        }
      : undefined,
    payment: transaction.payment
      ? {
          ...transaction.payment,
          receiver: transaction.payment?.receiver?.toString(),
        }
      : undefined,
    assetTransfer: transaction.assetTransfer
      ? {
          ...transaction.assetTransfer,
          receiver: transaction.assetTransfer?.receiver?.toString(),
        }
      : undefined,
    genesisHash: transaction.genesisHash ? Buffer.from(transaction.genesisHash).toString('base64') : '',
    group: transaction.group ? Buffer.from(transaction.group).toString('base64') : undefined,
    lease: transaction.lease && transaction.lease.length ? Buffer.from(transaction.lease).toString('base64') : undefined,
    note: transaction.note && transaction.note.length ? Buffer.from(transaction.note).toString('base64') : undefined,
    sender: transaction.sender.toString(),
    rekeyTo: transaction.rekeyTo ? transaction.rekeyTo.toString() : undefined,
  }

  return clearUndefineds(t as any)
}

export function clearUndefineds(object: Record<string, unknown>) {
  Object.keys(object).forEach((k) => {
    if (object[k] === undefined) {
      delete object[k]
    } else if (typeof object[k] === 'object') {
      clearUndefineds(object[k] as Record<string, unknown>)
    }
  })
  return object
}
