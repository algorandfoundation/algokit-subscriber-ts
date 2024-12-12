import { Address } from 'algosdk'
import type { SubscribedTransaction } from '../src/types'

function getReceiver(transaction: SubscribedTransaction): string | undefined {
  if (transaction.paymentTransaction?.receiver) {
    return transaction.paymentTransaction.receiver
  }
  if (transaction.assetTransferTransaction?.receiver) {
    return transaction.assetTransferTransaction.receiver
  }

  return undefined
}

const foo = (obj: any): any => {
  if (obj instanceof Address) {
    return obj.toString()
  }
  if (obj instanceof Uint8Array) {
    return Buffer.from(obj).toString('base64')
  }
  if (obj instanceof Array) {
    return obj.map((v) => foo(v))
  }
  if (typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        if (value == null) {
          return acc
        }
        return {
          ...acc,
          [key]: foo(value),
        }
      },
      {} as Record<string, any>,
    )
  }

  return obj
}

export function getSubscribedTransactionForDiff(transaction: SubscribedTransaction): any {
  return foo(transaction)
}
