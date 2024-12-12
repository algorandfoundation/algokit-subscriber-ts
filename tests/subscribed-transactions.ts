import type { SubscribedTransaction } from '../src/types'
import { clearUndefineds } from './transactions'

function getReceiver(transaction: SubscribedTransaction): string | undefined {
  if (transaction.paymentTransaction?.receiver) {
    return transaction.paymentTransaction.receiver
  }
  if (transaction.assetTransferTransaction?.receiver) {
    return transaction.assetTransferTransaction.receiver
  }

  return undefined
}

export function getSubscribedTransactionForDiff(transaction: SubscribedTransaction): any {
  const t = {
    ...transaction,
    applicationTransaction: {
      ...transaction.applicationTransaction,
      accounts: transaction.applicationTransaction?.accounts?.map((a) => a.toString()),
      applicationArgs: transaction.applicationTransaction?.applicationArgs?.map((a) => Buffer.from(a).toString('base64')),
      approvalProgram: transaction.applicationTransaction?.approvalProgram
        ? Buffer.from(transaction.applicationTransaction.approvalProgram).toString('base64')
        : undefined,
      clearStateProgram: transaction.applicationTransaction?.clearStateProgram
        ? Buffer.from(transaction.applicationTransaction.clearStateProgram).toString('base64')
        : undefined,
    },
    reKeyTo: transaction.rekeyTo ? transaction.rekeyTo.toString() : undefined,
    genesisHash: transaction.genesisHash ? Buffer.from(transaction.genesisHash).toString('base64') : '',
    group: transaction.group ? Buffer.from(transaction.group).toString('base64') : undefined,
    lease: transaction.lease ? Buffer.from(transaction.lease).toString('base64') : undefined,
    note: transaction.note ? Buffer.from(transaction.note).toString('base64') : undefined,
    logs: transaction.logs?.map((l) => Buffer.from(l).toString('base64')),
    innerTxns: transaction.innerTxns?.map((i) => getSubscribedTransactionForDiff(i)),
  }

  return structuredClone(clearUndefineds(t as any))
}
