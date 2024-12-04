import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import algosdk, { OnApplicationComplete } from 'algosdk'
import { TestingAppFactory } from './contract/client'

export async function app(params: {
  create: true
  algorand: AlgorandClient
  creator: algosdk.Account
  note?: string
}): ReturnType<TestingAppFactory['send']['create']['bare']>
export async function app(params: {
  create: false
  algorand: AlgorandClient
  creator: algosdk.Account
  note?: string
}): Promise<algosdk.Transaction>
export async function app(params: { create: boolean; algorand: AlgorandClient; creator: algosdk.Account; note?: string }) {
  params.algorand.setSignerFromAccount(params.creator)
  const factory = new TestingAppFactory({
    algorand: params.algorand,
  })

  const result = await (params.create ? factory.send : factory.createTransaction).create.bare({
    sender: params.creator.addr,
    onComplete: OnApplicationComplete.NoOpOC,
    note: params.note,
  })

  return result
}
