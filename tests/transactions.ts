import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import algosdk, { Account, Transaction } from 'algosdk'
import { vi } from 'vitest'
import { getSubscribedTransactions } from '../src'
import type {
  Arc28EventGroup,
  NamedTransactionFilter,
  TransactionFilter,
  TransactionInBlock,
  TransactionSubscriptionParams,
} from '../src/types'

export const SendXTransactions = async (x: number, account: Account, algorand: AlgorandClient) => {
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
  const lastTxnRound = Number(txns[x - 1].confirmation?.confirmedRound)

  return {
    txns,
    txIds: txns.map((t) => t.transaction.txID()),
    lastTxnRound,
    rounds: txns.map((t) => Number(t.confirmation!.confirmedRound)),
  }
}

export const GetSubscribedTransactions = (
  subscription: {
    syncBehaviour: TransactionSubscriptionParams['syncBehaviour']
    roundsToSync: number
    indexerRoundsToSync?: number
    watermark?: number
    currentRound?: number
    filters: TransactionFilter | NamedTransactionFilter[]
    arc28Events?: Arc28EventGroup[]
  },
  algorand: AlgorandClient,
) => {
  const { roundsToSync, indexerRoundsToSync, syncBehaviour, watermark, currentRound, filters, arc28Events } = subscription

  if (currentRound !== undefined) {
    const existingStatus = algorand.client.algod.status
    Object.assign(algorand.client.algod, {
      status: vi.fn().mockImplementation(() => {
        return {
          do: async () => {
            const status = await existingStatus.apply(algorand.client.algod).do()
            status['last-round'] = currentRound
            return status
          },
        }
      }),
    })
  }

  return getSubscribedTransactions(
    {
      filters: Array.isArray(filters) ? filters : [{ name: 'default', filter: filters }],
      maxRoundsToSync: roundsToSync,
      maxIndexerRoundsToSync: indexerRoundsToSync,
      syncBehaviour: syncBehaviour,
      watermark: watermark ?? 0,
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
    watermark?: number
    currentRound?: number
  },
  account: Account | Account[],
  algorand: AlgorandClient,
) => {
  return GetSubscribedTransactions(
    {
      ...subscription,
      filters:
        account instanceof Array ? account.map((a) => a.addr).map((a) => ({ name: a, filter: { sender: a } })) : { sender: account.addr },
    },
    algorand,
  )
}

export function getTransactionInBlockForDiff(transaction: TransactionInBlock) {
  return {
    transaction: getTransactionForDiff(transaction.transaction),
    parentOffset: transaction.parentOffset,
    parentTransactionId: transaction.parentTransactionId,
    roundIndex: transaction.roundIndex,
    roundOffset: transaction.roundOffset,
    createdAppId: transaction.createdAppId,
    createdAssetId: transaction.createdAppId,
    assetCloseAmount: transaction.assetCloseAmount,
    closeAmount: transaction.closeAmount,
  }
}

export function getTransactionForDiff(transaction: Transaction) {
  const t = {
    ...transaction,
    name: undefined,
    appAccounts: transaction.appAccounts?.map((a) => algosdk.encodeAddress(a.publicKey)),
    from: algosdk.encodeAddress(transaction.from.publicKey),
    to: transaction.to ? algosdk.encodeAddress(transaction.to.publicKey) : undefined,
    reKeyTo: transaction.reKeyTo ? algosdk.encodeAddress(transaction.reKeyTo.publicKey) : undefined,
    appArgs: transaction.appArgs?.map((a) => Buffer.from(a).toString('base64')),
    genesisHash: transaction.genesisHash.toString('base64'),
    group: transaction.group ? transaction.group.toString('base64') : undefined,
    lease: transaction.lease && transaction.lease.length ? Buffer.from(transaction.lease).toString('base64') : undefined,
    note: transaction.note && transaction.note.length ? Buffer.from(transaction.note).toString('base64') : undefined,
    tag: transaction.tag.toString('base64'),
  }

  return clearUndefineds(t)
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
