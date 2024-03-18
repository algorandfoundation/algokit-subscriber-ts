import type { MultisigTransactionSubSignature } from '@algorandfoundation/algokit-utils/types/indexer'
import { ApplicationOnComplete, StateProofTransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import * as msgpack from 'algorand-msgpack'
import algosdk, { OnApplicationComplete, Transaction, TransactionType } from 'algosdk'
import { Buffer } from 'buffer'
import base32 from 'hi-base32'
import sha512 from 'js-sha512'
import type { Block, BlockInnerTransaction, BlockTransaction, StateProof, StateProofMessage } from './types/block'
import { SubscribedTransaction } from './types/subscription'

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

export interface TransactionInBlock {
  // Raw data
  blockTransaction: BlockTransaction | BlockInnerTransaction
  block: Block
  roundOffset: number
  roundIndex: number
  parentTransaction?: BlockTransaction
  parentTransactionId?: string
  parentOffset?: number

  // Processed data
  transaction: Transaction
  createdAssetId?: number
  createdAppId?: number
  assetCloseAmount?: number
  closeAmount?: number
  logs?: Uint8Array[]
}

/**
 * Processes a block and returns all transactions from it, including inner transactions, with key information populated.
 * @param block An Algorand block
 * @returns An array of processed transactions from the block
 */
export function getBlockTransactions(block: Block): TransactionInBlock[] {
  let offset = 0
  const getOffset = () => offset++

  return (block.txns ?? []).flatMap((blockTransaction, roundIndex) => {
    let parentOffset = 0
    const getParentOffset = () => parentOffset++
    const parentData = extractTransactionFromBlockTransaction(blockTransaction, block)
    return [
      {
        blockTransaction,
        block,
        roundOffset: getOffset(),
        roundIndex,
        ...parentData,
      } as TransactionInBlock,
      ...(blockTransaction.dt?.itx ?? []).flatMap((innerTransaction) =>
        getBlockInnerTransactions(
          innerTransaction,
          block,
          blockTransaction,
          parentData.transaction.txID(),
          roundIndex,
          getOffset,
          getParentOffset,
        ),
      ),
    ]
  })
}

function getBlockInnerTransactions(
  blockTransaction: BlockInnerTransaction,
  block: Block,
  parentTransaction: BlockTransaction,
  parentTransactionId: string,
  roundIndex: number,
  getRoundOffset: () => number,
  getParentOffset: () => number,
): TransactionInBlock[] {
  return [
    {
      blockTransaction,
      block,
      roundIndex,
      roundOffset: getRoundOffset(),
      parentOffset: getParentOffset(),
      parentTransaction,
      parentTransactionId,
      ...extractTransactionFromBlockTransaction(blockTransaction, block),
    },
    ...(blockTransaction.dt?.itx ?? []).flatMap((innerInnerTransaction) =>
      getBlockInnerTransactions(
        innerInnerTransaction,
        block,
        parentTransaction,
        parentTransactionId,
        roundIndex,
        getRoundOffset,
        getParentOffset,
      ),
    ),
  ]
}

/**
 * Transform a raw block transaction representation into a `algosdk.Transaction` object and other key transaction data.
 *
 * **Note:** Doesn't currently support `keyreg` (Key Registration) or `stpf` (State Proof) transactions.
 * @param blockTransaction The raw transaction from a block
 * @param block The block the transaction belongs to
 * @returns The `algosdk.Transaction` object along with key secondary information from the block.
 */
export function extractTransactionFromBlockTransaction(
  blockTransaction: BlockTransaction | BlockInnerTransaction,
  block: Block,
): {
  transaction: Transaction
  createdAssetId?: number
  createdAppId?: number
  assetCloseAmount?: number
  closeAmount?: number
  logs?: Uint8Array[]
} {
  const txn = blockTransaction.txn

  // https://github.com/algorand/js-algorand-sdk/blob/develop/examples/block_fetcher/index.ts
  // Remove nulls (mainly where an appl txn contains a null app arg)
  removeNulls(txn)
  txn.gh = Buffer.from(block.gh)
  txn.gen = block.gen
  // Unset gen if `hgi` isn't set
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('hgi' in blockTransaction && !blockTransaction.hgi) txn.gen = null as any
  // Unset gh if `hgh` is set to false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('hgh' in blockTransaction && blockTransaction.hgh === false) txn.gh = null as any

  const t = Transaction.from_obj_for_encoding(txn)
  return {
    transaction: t,
    createdAssetId: blockTransaction.caid,
    createdAppId: blockTransaction.apid,
    assetCloseAmount: blockTransaction.aca,
    closeAmount: blockTransaction.ca,
    logs: blockTransaction.dt?.lg,
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

function concatArrays(...arrs: ArrayLike<number>[]) {
  const size = arrs.reduce((sum, arr) => sum + arr.length, 0)
  const c = new Uint8Array(size)

  let offset = 0
  for (let i = 0; i < arrs.length; i++) {
    c.set(arrs[i], offset)
    offset += arrs[i].length
  }

  return c
}

function getTxIdFromBlockTransaction(blockTransaction: BlockTransaction, block: Block) {
  const txn = blockTransaction.txn

  txn.gh = Buffer.from(block.gh)
  txn.gen = block.gen
  // Unset gen if `hgi` isn't set
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!('hgi' in blockTransaction) || !blockTransaction.hgi) txn.gen = null as any
  // Unset gh if `hgh` is set to false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('hgh' in blockTransaction && blockTransaction.hgh === false) txn.gh = null as any

  // https://github.com/algorand/js-algorand-sdk/blob/develop/examples/block_fetcher/index.ts
  // Remove nulls (mainly where an appl txn contains a null app arg)
  removeNulls(txn)

  // Translated from algosdk.Transaction.txID()
  const ALGORAND_TRANSACTION_LENGTH = 52
  const encodedMessage = msgpack.encode(txn, { sortKeys: true, ignoreUndefined: true })
  const tag = Buffer.from('TX')
  const gh = Buffer.from(concatArrays(tag, encodedMessage))
  const rawTxId = Buffer.from(sha512.sha512_256.array(gh))
  return base32.encode(rawTxId).slice(0, ALGORAND_TRANSACTION_LENGTH)
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
  t: TransactionInBlock & { getChildOffset?: () => number },
): SubscribedTransaction {
  const {
    transaction,
    createdAssetId,
    blockTransaction,
    assetCloseAmount,
    closeAmount,
    createdAppId,
    block,
    roundOffset,
    parentOffset,
    parentTransactionId,
    roundIndex,
    parentTransaction,
  } = t

  if (!transaction.type) {
    throw new Error(`Received no transaction type for transaction ${transaction.txID()}`)
  }

  let childOffset = roundOffset
  const getChildOffset = t.getChildOffset ? t.getChildOffset : () => ++childOffset

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  // The types in algosdk for state proofs are incorrect, so override them
  const stateProof = transaction.stateProof as StateProof | undefined
  const stateProofMessage = transaction.stateProofMessage as StateProofMessage | undefined
  const txId = // There is a bug in algosdk that means it can't calculate transaction IDs for stpf txns
    transaction.type === TransactionType.stpf
      ? getTxIdFromBlockTransaction(blockTransaction as BlockTransaction, block)
      : transaction.txID()
  try {
    // https://github.com/algorand/indexer/blob/main/api/converter_utils.go#L249
    return {
      id: parentTransactionId ? `${parentTransactionId}/inner/${parentOffset! + 1}` : txId,
      parentTransactionId,
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
                : 'apar' in blockTransaction.txn && blockTransaction.txn.apar
                  ? {
                      manager: transaction.assetManager ? algosdk.encodeAddress(transaction.assetManager.publicKey) : undefined,
                      reserve: transaction.assetReserve ? algosdk.encodeAddress(transaction.assetReserve.publicKey) : undefined,
                      clawback: transaction.assetClawback ? algosdk.encodeAddress(transaction.assetClawback.publicKey) : undefined,
                      freeze: transaction.assetFreeze ? algosdk.encodeAddress(transaction.assetFreeze.publicKey) : undefined,
                      // These parameters are required in the indexer type so setting to empty values
                      creator: '',
                      decimals: 0,
                      total: 0,
                    }
                  : undefined,
            }
          : undefined,
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
              'application-args': transaction.appArgs?.map((a) => Buffer.from(a).toString('base64')),
              'extra-program-pages': transaction.extraPages,
              'foreign-apps': transaction.appForeignApps,
              'foreign-assets': transaction.appForeignAssets,
              'global-state-schema': blockTransaction.txn.apgs
                ? {
                    'num-byte-slice': transaction.appGlobalByteSlices,
                    'num-uint': transaction.appGlobalInts,
                  }
                : undefined,
              'local-state-schema': blockTransaction.txn.apls
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
              'close-remainder-to': transaction.closeRemainderTo
                ? algosdk.encodeAddress(transaction.closeRemainderTo.publicKey)
                : undefined,
            }
          : undefined,
      'keyreg-transaction':
        transaction.type === TransactionType.keyreg
          ? {
              'non-participation': transaction.nonParticipation ?? false,
              'selection-participation-key': transaction.selectionKey?.toString('base64'),
              'state-proof-key': transaction.stateProofKey?.toString('base64'),
              'vote-first-valid': transaction.voteFirst,
              'vote-key-dilution': transaction.voteKeyDilution,
              'vote-last-valid': transaction.voteLast,
              'vote-participation-key': transaction.voteKey?.toString('base64'),
            }
          : undefined,
      'state-proof-transaction':
        transaction.type === TransactionType.stpf
          ? {
              'state-proof': {
                'part-proofs': {
                  'hash-factory': {
                    'hash-type': stateProof!.P.hsh.t,
                  },
                  'tree-depth': stateProof!.P.td,
                  path: stateProof!.P.pth.map((p) => Buffer.from(p).toString('base64')),
                },
                'positions-to-reveal': stateProof!.pr,
                'salt-version': Number(stateProof!.v ?? 0),
                'sig-commit': Buffer.from(stateProof!.c).toString('base64'),
                'sig-proofs': {
                  'hash-factory': {
                    'hash-type': stateProof!.S.hsh.t,
                  },
                  'tree-depth': stateProof!.S.td,
                  path: stateProof!.S.pth.map((p) => Buffer.from(p).toString('base64')),
                },
                'signed-weight': Number(stateProof!.w),
                reveals: mapKeys(stateProof!.r).map((position) => {
                  const r = stateProof!.r.get(position)!
                  return {
                    'sig-slot': {
                      'lower-sig-weight': Number(r.s.l ?? 0),
                      signature: {
                        'merkle-array-index': r.s.s.idx,
                        'falcon-signature': Buffer.from(r.s.s.sig).toString('base64'),
                        proof: {
                          'hash-factory': {
                            'hash-type': r.s.s.prf.hsh.t,
                          },
                          'tree-depth': r.s.s.prf.td,
                          path: r.s.s.prf.pth.map((p) => Buffer.from(p).toString('base64')),
                        },
                        'verifying-key': Buffer.from(r.s.s.vkey.k).toString('base64'),
                      },
                    },
                    position: Number(position),
                    participant: {
                      weight: Number(r.p.w),
                      verifier: {
                        'key-lifetime': r.p.p.lf,
                        commitment: Buffer.from(r.p.p.cmt).toString('base64'),
                      },
                    },
                  } satisfies StateProofTransactionResult['state-proof']['reveals'][number]
                }),
              },
              message: {
                'block-headers-commitment': Buffer.from(stateProofMessage!.b).toString('base64'),
                'first-attested-round': stateProofMessage!.f,
                'latest-attested-round': stateProofMessage!.l,
                'ln-proven-weight': Number(stateProofMessage!.P),
                'voters-commitment': Buffer.from(stateProofMessage!.v).toString('base64'),
              },
              'state-proof-type': Number(transaction.stateProofType ?? 0),
            }
          : undefined,
      'first-valid': transaction.firstRound,
      'last-valid': transaction.lastRound,
      'tx-type': transaction.type,
      fee: transaction.fee ?? 0,
      sender: algosdk.encodeAddress(transaction.from.publicKey),
      'confirmed-round': block.rnd,
      'round-time': block.ts,
      'intra-round-offset': roundOffset,
      'created-asset-index': createdAssetId,
      'genesis-hash': Buffer.from(transaction.genesisHash).toString('base64'),
      'genesis-id': transaction.genesisID,
      group: transaction.group ? Buffer.from(transaction.group).toString('base64') : undefined,
      note: transaction.note ? Buffer.from(transaction.note).toString('utf-8') : undefined,
      lease: transaction.lease ? Buffer.from(transaction.lease).toString('base64') : undefined,
      'rekey-to': transaction.reKeyTo ? algosdk.encodeAddress(transaction.reKeyTo.publicKey) : undefined,
      'closing-amount': closeAmount,
      'created-application-index': createdAppId,
      'auth-addr': blockTransaction.sgnr ? algosdk.encodeAddress(blockTransaction.sgnr) : undefined,
      'inner-txns': blockTransaction.dt?.itx?.map((ibt) =>
        getIndexerTransactionFromAlgodTransaction({
          block,
          blockTransaction: ibt,
          roundIndex,
          roundOffset: getChildOffset(),
          ...extractTransactionFromBlockTransaction(ibt, block),
          getChildOffset,
          parentOffset,
          parentTransaction,
          parentTransactionId,
        }),
      ),
      signature:
        blockTransaction.sig || blockTransaction.lsig || blockTransaction.msig
          ? {
              sig: blockTransaction.sig ? Buffer.from(blockTransaction.sig).toString('base64') : undefined,
              logicsig: blockTransaction.lsig
                ? {
                    logic: Buffer.from(blockTransaction.lsig.l).toString('base64'),
                    args: blockTransaction.lsig.arg ? blockTransaction.lsig.arg.map((a) => Buffer.from(a).toString('base64')) : undefined,
                    signature: blockTransaction.lsig.sig ? Buffer.from(blockTransaction.lsig.sig).toString('base64') : undefined,
                    'multisig-signature': blockTransaction.lsig.msig
                      ? {
                          version: blockTransaction.lsig.msig.v,
                          threshold: blockTransaction.lsig.msig.thr,
                          subsignature: blockTransaction.lsig.msig.subsig.map(
                            (s) =>
                              ({
                                'public-key': Buffer.from(s.pk).toString('base64'),
                                signature: s.s ? Buffer.from(s.s).toString('base64') : undefined,
                              }) as MultisigTransactionSubSignature,
                          ),
                        }
                      : undefined,
                  }
                : undefined,
              multisig: blockTransaction.msig
                ? {
                    version: blockTransaction.msig.v,
                    threshold: blockTransaction.msig.thr,
                    subsignature: blockTransaction.msig.subsig.map((s) => ({
                      'public-key': Buffer.from(s.pk).toString('base64'),
                      signature: s.s ? Buffer.from(s.s).toString('base64') : undefined,
                    })),
                  }
                : undefined,
            }
          : undefined,
      logs: blockTransaction.dt?.lg ? blockTransaction.dt.lg.map((l) => Buffer.from(l).toString('base64')) : undefined,
      // todo: do we need any of these?
      //"close-rewards"
      //"receiver-rewards"
      //"sender-rewards"
      //"global-state-delta"
      //"local-state-delta"
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(`Failed to transform transaction ${txId} from block ${block.rnd} with offset ${roundOffset}`)
    throw e
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapKeys<TKey>(map: Map<TKey, any>): TKey[] {
  if (!map) return []

  const keys: TKey[] = []
  map.forEach((_, key) => keys.push(key))
  return keys
}
