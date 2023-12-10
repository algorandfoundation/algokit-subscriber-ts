import type { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { ApplicationOnComplete } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk, { OnApplicationComplete, Transaction, TransactionType } from 'algosdk'
import { Buffer } from 'buffer'
import type { Block, BlockTransaction } from './types/block'

// Recursively remove all null values from object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeNulls(obj: any) {
  for (const key in obj) {
    if (obj[key] === null) {
      // eslint-disable-next-line no-param-reassign
      delete obj[key]
    } else if (typeof obj[key] === 'object') {
      removeNulls(obj[key])
    }
  }
}

/**
 * Transform a raw block transaction representation into an `algosdk.Transaction` object.
 *
 * **Note:** Doesn't currently support `keyreg` (Key Registration) or `stpf` (State Proof) transactions.
 * @param blockTransaction The raw transaction from a block
 * @param block The block the transaction belongs to
 * @returns The `algosdk.Transaction` object along with key secondary information from the block.
 */
export function getAlgodTransactionFromBlockTransaction(
  blockTransaction: BlockTransaction,
  block: Block,
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
  const txn = blockTransaction.txn

  // https://github.com/algorand/js-algorand-sdk/blob/develop/examples/block_fetcher/index.ts
  // Remove nulls (mainly where an appl txn contains a null app arg)
  removeNulls(txn)
  txn.gh = Buffer.from(block.gh)
  txn.gen = block.gen
  // Unset gen if `hgi` isn't set
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!blockTransaction.hgi) txn.gen = null as any

  // todo: support these?
  if (txn.type === 'stpf' || txn.type === 'keyreg') {
    return undefined
  }

  return {
    transaction: Transaction.from_obj_for_encoding(txn),
    createdAssetId: blockTransaction.caid,
    createdAppId: blockTransaction.apid,
    assetCloseAmount: blockTransaction.aca,
    closeAmount: blockTransaction.ca,
    block: block,
    blockOffset: block.txns.indexOf(blockTransaction),
  }
}

/**
 * Transforms `algosdk.Transaction` app on-complete enum to the equivalent indexer on-complete enum.
 * @param appOnComplete The `OnApplicationComplete` value
 * @returns The equivalent `ApplicationOnComplete` value
 */
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

/**
 * Transforms the given `algosdk.Transaction` object into an indexer transaction.
 *
 * **Note:** Currently the following fields are not supported:
 *  * `auth-addr`
 *  * `close-rewards`
 *  * `global-state-delta`
 *  * `inner-txns`
 *  * `keyreg-transaction`
 *  * `local-state-delta`
 *  * `receiver-rewards`
 *  * `sender-rewards`
 *  * `logs`
 *  * `signature`
 *
 * @param transaction The `algosdk.Transaction` object to transform
 * @param block The block data for the block the transaction belongs to
 * @param blockOffset The offset within the block that the transaction was in
 * @param createdAssetId The ID of the asset that was created if the transaction created an asset
 * @param createdAppId The ID of the app that was created if the transaction created an app
 * @param assetCloseAmount The amount of the asset that was transferred if the transaction had an asset close
 * @param closeAmount The amount of microAlgos that were transferred if the transaction had a close
 * @returns The indexer transaction formation (`TransactionResult`)
 */
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
                  'name-b64': transaction.assetName ? encoder.encode(Buffer.from(transaction.assetName).toString('base64')) : undefined,
                  'unit-name': transaction.assetUnitName,
                  'unit-name-b64': transaction.assetUnitName
                    ? encoder.encode(Buffer.from(transaction.assetUnitName).toString('base64'))
                    : undefined,
                  url: transaction.assetURL,
                  'url-b64': transaction.assetURL ? encoder.encode(Buffer.from(transaction.assetURL).toString('base64')) : undefined,
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
