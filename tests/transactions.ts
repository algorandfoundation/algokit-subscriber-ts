import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { SendTransactionResult } from '@algorandfoundation/algokit-utils/types/transaction'
import algosdk, { Account, Address, Transaction } from 'algosdk'
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
  const lastTxnRound = txns[x - 1].confirmation!.confirmedRound!

  return {
    txns,
    txIds: txns.map((t) => t.transaction.txID()),
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
    const existingStatus = algorand.client.algod.status
    Object.assign(algorand.client.algod, {
      status: vi.fn().mockImplementation(() => {
        return {
          do: async () => {
            const status = await existingStatus.apply(algorand.client.algod).do()
            status.lastRound = currentRound
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
  account: Account | Account[],
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

function getReceiver(transaction: Transaction): Address | undefined {
  if (transaction.payment?.receiver) {
    return transaction.payment.receiver
  }
  if (transaction.assetTransfer?.receiver) {
    return transaction.assetTransfer.receiver
  }

  return undefined
}

export function getTransactionForDiff(transaction: Transaction) {
  const t = {
    ...transaction,
    name: undefined,
    appAccounts: transaction.applicationCall?.accounts?.map((a) => algosdk.encodeAddress(a.publicKey)),
    from: algosdk.encodeAddress(transaction.sender.publicKey),
    to: getReceiver(transaction)?.toString(), // TODO: NC - Change to sender/receiver?
    reKeyTo: transaction.rekeyTo ? algosdk.encodeAddress(transaction.rekeyTo.publicKey) : undefined,
    appArgs: transaction.applicationCall?.appArgs?.map((a) => Buffer.from(a).toString('base64')),
    genesisHash: transaction.genesisHash ? Buffer.from(transaction.genesisHash).toString('base64') : '',
    group: transaction.group ? Buffer.from(transaction.group).toString('base64') : undefined,
    lease: transaction.lease && transaction.lease.length ? Buffer.from(transaction.lease).toString('base64') : undefined,
    note: transaction.note && transaction.note.length ? Buffer.from(transaction.note).toString('base64') : undefined,
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
