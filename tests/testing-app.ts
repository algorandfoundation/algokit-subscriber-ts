import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import type { AddressWithSigners } from '@algorandfoundation/algokit-utils/transact'
import { OnApplicationComplete, Transaction } from '@algorandfoundation/algokit-utils/transact'
import { TestingAppFactory } from './contract/client'

export async function app(params: {
  create: true
  algorand: AlgorandClient
  creator: AddressWithSigners
  note?: string
}): ReturnType<TestingAppFactory['send']['create']['bare']>
export async function app(params: { create: false; algorand: AlgorandClient; creator: AddressWithSigners; note?: string }): Promise<Transaction>
export async function app(params: { create: boolean; algorand: AlgorandClient; creator: AddressWithSigners; note?: string }) {
  params.algorand.setSignerFromAccount(params.creator)
  const factory = new TestingAppFactory({
    algorand: params.algorand,
  })

  const result = await (params.create ? factory.send : factory.createTransaction).create.bare({
    sender: params.creator.addr,
    onComplete: OnApplicationComplete.NoOp,
    note: params.note,
  })

  return result
}
