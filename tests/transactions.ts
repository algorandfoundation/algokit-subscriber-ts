import * as algokit from '@algorandfoundation/algokit-utils'
import { SendTransactionFrom, SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import algosdk, { Algodv2, Indexer, Transaction } from 'algosdk'
import { vi } from 'vitest'
import { getSubscribedTransactions } from '../src'
import type {
  Arc28EventGroup,
  NamedTransactionFilter,
  TransactionFilter,
  TransactionInBlock,
  TransactionSubscriptionParams,
} from '../src/types'

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
  algod: Algodv2,
  indexer?: Indexer,
) => {
  const { roundsToSync, indexerRoundsToSync, syncBehaviour, watermark, currentRound, filters, arc28Events } = subscription

  if (currentRound !== undefined) {
    const existingStatus = algod.status
    Object.assign(algod, {
      status: vi.fn().mockImplementation(() => {
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
      filters: Array.isArray(filters) ? filters : [{ name: 'default', filter: filters }],
      maxRoundsToSync: roundsToSync,
      maxIndexerRoundsToSync: indexerRoundsToSync,
      syncBehaviour: syncBehaviour,
      watermark: watermark ?? 0,
      arc28Events,
    },
    algod,
    indexer,
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
  account: SendTransactionFrom | SendTransactionFrom[],
  algod: Algodv2,
  indexer?: Indexer,
) => {
  return GetSubscribedTransactions(
    {
      ...subscription,
      filters:
        account instanceof Array
          ? account.map((a) => algokit.getSenderAddress(a)).map((a) => ({ name: a, filter: { sender: a } }))
          : { sender: algokit.getSenderAddress(account) },
    },
    algod,
    indexer,
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
