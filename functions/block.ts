import { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk, { EncodedTransaction, OnApplicationComplete, Transaction, TransactionType } from 'algosdk'

export function getAlgodTransactionFromBlockTransaction(
  bt: BlockTransaction,
  b: Block,
):
  | {
      transaction: Transaction
      createdAssetId?: number
      createdAppId?: number
      assetCloseAmount?: number
      closeAmount?: number
      block: Block
      blockOffset: number
    }
  | undefined {
  const txn = bt.txn

  // todo: support these?
  if (txn.type === 'stpf' || txn.type === 'keyreg') {
    return undefined
  }

  bt.txn.gh = Buffer.from(b.gh)
  bt.txn.gen = b.gen
  return {
    transaction: Transaction.from_obj_for_encoding(bt.txn),
    createdAssetId: bt.caid,
    createdAppId: bt.apid,
    assetCloseAmount: bt.aca,
    closeAmount: bt.ca,
    block: b,
    blockOffset: b.txns.indexOf(bt),
  }
}

export function algodOnCompleteToIndexerOnComplete(appOnComplete: OnApplicationComplete): ApplicationOnComplete {
  return appOnComplete === OnApplicationComplete.NoOpOC
    ? ApplicationOnComplete.noop
    : appOnComplete === OnApplicationComplete.OptInOC
    ? ApplicationOnComplete.optin
    : appOnComplete === OnApplicationComplete.CloseOutOC
    ? ApplicationOnComplete.closeout
    : appOnComplete === OnApplicationComplete.ClearStateOC
    ? ApplicationOnComplete.clear
    : appOnComplete === OnApplicationComplete.DeleteApplicationOC
    ? ApplicationOnComplete.delete
    : ApplicationOnComplete.update
}

export function getIndexerTransactionFromAlgodTransaction(
  transaction: Transaction,
  block: Block,
  blockOffset: number,
  createdAssetId?: number,
  createdAppId?: number,
  assetCloseAmount?: number,
  closeAmount?: number,
): TransactionResult {
  if (!transaction.type) {
    throw new Error(`Received no transaction type for transaction ${transaction.txID()}`)
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  return {
    id: transaction.txID(),
    'asset-config-transaction':
      transaction.type === TransactionType.acfg
        ? {
            'asset-id': transaction.assetIndex,
            params: createdAssetId
              ? {
                  creator: algosdk.encodeAddress(transaction.from.publicKey),
                  decimals: transaction.assetDecimals,
                  total: transaction.assetTotal,
                  'default-frozen': transaction.assetDefaultFrozen,
                  'metadata-hash': transaction.assetMetadataHash,
                  name: transaction.assetName,
                  'name-b64': encoder.encode(Buffer.from(transaction.assetName).toString('base64')),
                  'unit-name': transaction.assetUnitName,
                  'unit-name-b64': encoder.encode(Buffer.from(transaction.assetUnitName).toString('base64')),
                  url: transaction.assetURL,
                  'url-b64': encoder.encode(Buffer.from(transaction.assetURL).toString('base64')),
                  manager: transaction.assetManager ? algosdk.encodeAddress(transaction.assetManager.publicKey) : undefined,
                  reserve: transaction.assetReserve ? algosdk.encodeAddress(transaction.assetReserve.publicKey) : undefined,
                  clawback: transaction.assetClawback ? algosdk.encodeAddress(transaction.assetClawback.publicKey) : undefined,
                  freeze: transaction.assetFreeze ? algosdk.encodeAddress(transaction.assetFreeze.publicKey) : undefined,
                }
              : 'apar' in block.txns[blockOffset].txn
              ? {
                  manager: transaction.assetManager ? algosdk.encodeAddress(transaction.assetManager.publicKey) : undefined,
                  reserve: transaction.assetReserve ? algosdk.encodeAddress(transaction.assetReserve.publicKey) : undefined,
                  clawback: transaction.assetClawback ? algosdk.encodeAddress(transaction.assetClawback.publicKey) : undefined,
                  freeze: transaction.assetFreeze ? algosdk.encodeAddress(transaction.assetFreeze.publicKey) : undefined,
                }
              : undefined,
          }
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ({} as any),
    'asset-transfer-transaction':
      transaction.type === TransactionType.axfer
        ? {
            'asset-id': transaction.assetIndex,
            amount: Number(transaction.amount),
            receiver: algosdk.encodeAddress(transaction.to.publicKey),
            sender: algosdk.encodeAddress(transaction.from.publicKey),
            'close-amount': assetCloseAmount,
            'close-to': transaction.closeRemainderTo ? algosdk.encodeAddress(transaction.closeRemainderTo.publicKey) : undefined,
          }
        : undefined,
    'asset-freeze-transaction':
      transaction.type === TransactionType.afrz
        ? {
            'asset-id': transaction.assetIndex,
            'new-freeze-status': transaction.freezeState,
            address: algosdk.encodeAddress(transaction.freezeAccount.publicKey),
          }
        : undefined,
    'application-transaction':
      transaction.type === TransactionType.appl
        ? {
            'application-id': transaction.appIndex,
            'approval-program': decoder.decode(transaction.appApprovalProgram),
            'clear-state-program': decoder.decode(transaction.appClearProgram),
            'on-completion': algodOnCompleteToIndexerOnComplete(transaction.appOnComplete),
            'application-args': transaction.appArgs?.map((a) => decoder.decode(a)),
            'extra-program-pages': transaction.extraPages,
            'foreign-apps': transaction.appForeignApps,
            'foreign-assets': transaction.appForeignAssets,
            'global-state-schema': block.txns[blockOffset].txn.apgs
              ? {
                  'num-byte-slice': transaction.appGlobalByteSlices,
                  'num-uint': transaction.appGlobalInts,
                }
              : undefined,
            'local-state-schema': block.txns[blockOffset].txn.apls
              ? {
                  'num-byte-slice': transaction.appLocalByteSlices,
                  'num-uint': transaction.appLocalInts,
                }
              : undefined,
            accounts: transaction.appAccounts?.map((a) => algosdk.encodeAddress(a.publicKey)),
          }
        : undefined,
    'payment-transaction':
      transaction.type === TransactionType.pay
        ? {
            amount: Number(transaction.amount),
            receiver: algosdk.encodeAddress(transaction.to.publicKey),
            'close-amount': closeAmount,
            'close-remainder-to': transaction.closeRemainderTo ? algosdk.encodeAddress(transaction.closeRemainderTo.publicKey) : undefined,
          }
        : undefined,
    'first-valid': transaction.firstRound,
    'last-valid': transaction.lastRound,
    'tx-type': transaction.type,
    fee: transaction.fee,
    sender: algosdk.encodeAddress(transaction.from.publicKey),
    'confirmed-round': block.rnd,
    'round-time': block.ts,
    'intra-round-offset': blockOffset,
    'created-asset-index': createdAssetId,
    'genesis-hash': Buffer.from(transaction.genesisHash).toString('base64'),
    'genesis-id': transaction.genesisID,
    group: transaction.group ? Buffer.from(transaction.group).toString('base64') : undefined,
    note: transaction.note ? Buffer.from(transaction.note).toString('utf-8') : undefined,
    lease: transaction.lease ? Buffer.from(transaction.lease).toString('base64') : undefined,
    'rekey-to': transaction.reKeyTo ? algosdk.encodeAddress(transaction.reKeyTo.publicKey) : undefined,
    'closing-amount': closeAmount,
    'created-application-index': createdAppId,
    // todo: do we need any of these?
    //"auth-addr"
    //"close-rewards"
    //"global-state-delta"
    //"inner-txns"
    //"keyreg-transaction"
    //"local-state-delta"
    //"receiver-rewards"
    //"sender-rewards"
    //logs
    //signature
  }
}

export interface Block {
  earn: number
  fees: Uint8Array
  frac: number
  gen: string
  gh: Uint8Array
  prev: Uint8Array
  proto: string
  rate: number
  /** Round number */
  rnd: number
  rwcalr: number
  rwd: Uint8Array
  seed: Uint8Array
  tc: number
  /** Round time (unix timestamp) */
  ts: number
  txn: Uint8Array
  txns: BlockTransaction[]
}

export interface BlockTransaction {
  //txn: BlockTransactionData
  txn: EncodedTransaction
  /** Asset ID when an asset is created by the transaction */
  caid?: number
  /** App ID when an app is created by the transaction */
  apid?: number
  /** Asset closing amount in decimal units */
  aca?: number
  /** Algo closing amount in microAlgos */
  ca?: number
  /** Has genesis id */
  hgi: boolean
}
