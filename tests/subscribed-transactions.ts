import { Address } from 'algosdk'
import type { SubscribedTransaction } from '../src/types'

// Standardise objects to make them easier to compare
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const standardiseObject = (obj: any): any => {
  if (obj instanceof Address) {
    return obj.toString()
  }
  if (obj instanceof Uint8Array) {
    return Buffer.from(obj).toString('base64')
  }
  if (obj instanceof Array) {
    return obj.map((v) => standardiseObject(v))
  }
  if (typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        if (value == null) {
          return acc
        }
        return {
          ...acc,
          [key]: standardiseObject(value),
        }
      },
      {} as Record<string, any>,
    )
  }

  return obj
}

export function getSubscribedTransactionForDiff(transaction: SubscribedTransaction): any {
  return standardiseObject(transaction)
}
