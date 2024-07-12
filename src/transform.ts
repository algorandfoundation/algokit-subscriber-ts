import type { MultisigTransactionSubSignature, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { ApplicationOnComplete, StateProofTransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import * as msgpack from 'algorand-msgpack'
import algosdk from 'algosdk'
import { Buffer } from 'buffer'
import base32 from 'hi-base32'
import sha512 from 'js-sha512'
import type {
  Block,
  BlockData,
  BlockInnerTransaction,
  BlockTransaction,
  StateProof,
  StateProofMessage,
  TransactionInBlock,
} from './types/block'
import { BalanceChange, BalanceChangeRole, BlockMetadata, SubscribedTransaction } from './types/subscription'
import OnApplicationComplete = algosdk.OnApplicationComplete
import Transaction = algosdk.Transaction
import TransactionType = algosdk.TransactionType

export const ALGORAND_ZERO_ADDRESS = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ'
export const ALGORAND_ZERO_ADDRESS_BYTES = algosdk.decodeAddress(ALGORAND_ZERO_ADDRESS).publicKey

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
    const parentData = extractTransactionFromBlockTransaction(blockTransaction, Buffer.from(block.gh), block.gen)
    return [
      {
        blockTransaction,
        block,
        roundOffset: getOffset(),
        roundIndex,
        roundNumber: block.rnd,
        roundTimestamp: block.ts,
        genesisId: block.gen,
        genesisHash: Buffer.from(block.gh),
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
      roundIndex,
      roundNumber: block.rnd,
      roundTimestamp: block.ts,
      genesisId: block.gen,
      genesisHash: Buffer.from(block.gh),
      roundOffset: getRoundOffset(),
      parentOffset: getParentOffset(),
      parentTransactionId,
      ...extractTransactionFromBlockTransaction(blockTransaction, Buffer.from(block.gh), block.gen),
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
function extractTransactionFromBlockTransaction(
  blockTransaction: BlockTransaction | BlockInnerTransaction,
  genesisHash: Buffer,
  genesisId: string,
): {
  transaction: Transaction
  createdAssetId?: number
  createdAppId?: number
  assetCloseAmount?: number | bigint
  closeAmount?: number
  logs?: Uint8Array[]
} {
  const txn = extractAndNormaliseTransaction(blockTransaction, genesisHash, genesisId)
  const t = Transaction.from_obj_for_encoding(txn)
  return {
    transaction: t,
    createdAssetId: blockTransaction.caid,
    createdAppId: blockTransaction.apid,
    assetCloseAmount: blockTransaction.aca,
    closeAmount: blockTransaction.ca,
    logs: blockTransaction.dt?.lg,
  } satisfies Partial<TransactionInBlock>
}

/**
 * Transforms `algosdk.Transaction` app on-complete enum to the equivalent indexer on-complete enum.
 * @param appOnComplete The `OnApplicationComplete` value
 * @returns The equivalent `ApplicationOnComplete` value
 */
export function algodOnCompleteToIndexerOnComplete(appOnComplete?: OnApplicationComplete): ApplicationOnComplete {
  return appOnComplete === OnApplicationComplete.NoOpOC
    ? ApplicationOnComplete.noop
    : appOnComplete === OnApplicationComplete.OptInOC
      ? ApplicationOnComplete.optin
      : appOnComplete === OnApplicationComplete.CloseOutOC
        ? ApplicationOnComplete.closeout
        : appOnComplete === OnApplicationComplete.ClearStateOC
          ? ApplicationOnComplete.clear
          : appOnComplete === OnApplicationComplete.UpdateApplicationOC
            ? ApplicationOnComplete.update
            : appOnComplete === OnApplicationComplete.DeleteApplicationOC
              ? ApplicationOnComplete.delete
              : ApplicationOnComplete.noop
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

function extractAndNormaliseTransaction(
  blockTransaction: BlockTransaction | BlockInnerTransaction,
  genesisHash: Buffer,
  genesisId: string,
) {
  const txn = { ...blockTransaction.txn }

  // https://github.com/algorand/js-algorand-sdk/blob/develop/examples/block_fetcher/index.ts
  // Remove nulls (mainly where an appl txn contains a null app arg)
  removeNulls(txn)

  // Add genesisId (gen) as the transaction was processed with it, and is required to generate the correct txID.
  if ('hgi' in blockTransaction && blockTransaction.hgi === true) {
    txn.gen = genesisId
  }

  // Add genesisHash (gh) as the transaction was processed with it, and is required to generate the correct txID.
  // gh is mandatory on MainNet and TestNet (see https://forum.algorand.org/t/calculating-transaction-id/3119/7), so set gh unless hgh is explicitly false.
  if (!('hgh' in blockTransaction) || blockTransaction.hgh !== false) {
    txn.gh = genesisHash
  }

  if (txn.type === TransactionType.axfer && !txn.arcv) {
    // from_obj_for_encoding expects arcv to be set, which may not be defined when performing an opt out.
    txn.arcv = Buffer.from(ALGORAND_ZERO_ADDRESS_BYTES)
  }

  if (txn.type === TransactionType.pay && !txn.rcv) {
    // from_obj_for_encoding expects rcv to be set, which may not be defined when closing an account.
    txn.rcv = Buffer.from(ALGORAND_ZERO_ADDRESS_BYTES)
  }

  return txn
}

function getTxIdFromBlockTransaction(blockTransaction: BlockTransaction, genesisHash: Buffer, genesisId: string): string {
  const txn = extractAndNormaliseTransaction(blockTransaction, genesisHash, genesisId)

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
  filterName?: string,
): SubscribedTransaction {
  const {
    transaction,
    createdAssetId,
    blockTransaction,
    assetCloseAmount,
    closeAmount,
    createdAppId,
    roundOffset,
    parentOffset,
    parentTransactionId,
    roundIndex,
    roundNumber,
    roundTimestamp,
    genesisHash,
    genesisId,
    closeRewards,
    receiverRewards,
    senderRewards,
  } = t

  if (!transaction.type) {
    throw new Error(`Received no transaction type for transaction ${transaction.txID()}`)
  }

  let childOffset = roundOffset
  const getChildOffset = t.getChildOffset ? t.getChildOffset : () => ++childOffset

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  // The types in algosdk for state proofs are incorrect, so override them
  const stateProof = transaction.stateProof as unknown as StateProof | undefined
  const stateProofMessage = transaction.stateProofMessage as unknown as StateProofMessage | undefined
  const txId = // There is a bug in algosdk that means it can't calculate transaction IDs for stpf txns
    transaction.type === TransactionType.stpf
      ? getTxIdFromBlockTransaction(blockTransaction as BlockTransaction, genesisHash, genesisId)
      : transaction.txID()

  try {
    // https://github.com/algorand/indexer/blob/main/api/converter_utils.go#L249

    return {
      id: parentTransactionId ? `${parentTransactionId}/inner/${parentOffset! + 1}` : txId,
      parentTransactionId,
      filtersMatched: filterName ? [filterName] : undefined,
      ...(transaction.type === TransactionType.acfg
        ? {
            'asset-config-transaction': {
              'asset-id': transaction.assetIndex,
              params: createdAssetId
                ? {
                    creator: algosdk.encodeAddress(transaction.from.publicKey),
                    decimals: transaction.assetDecimals,
                    total: transaction.assetTotal,
                    'default-frozen': transaction.assetDefaultFrozen,
                    'metadata-hash': transaction.assetMetadataHash,
                    ...(transaction.assetName
                      ? { name: transaction.assetName, 'name-b64': encoder.encode(Buffer.from(transaction.assetName).toString('base64')) }
                      : undefined),
                    ...(transaction.assetUnitName
                      ? {
                          'unit-name': transaction.assetUnitName,
                          'unit-name-b64': encoder.encode(Buffer.from(transaction.assetUnitName).toString('base64')),
                        }
                      : undefined),
                    ...(transaction.assetURL
                      ? { url: transaction.assetURL, 'url-b64': encoder.encode(Buffer.from(transaction.assetURL).toString('base64')) }
                      : undefined),
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
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.axfer
        ? {
            'asset-transfer-transaction': {
              'asset-id': transaction.assetIndex,
              amount: transaction.amount ?? 0, // The amount can be undefined
              receiver: algosdk.encodeAddress(transaction.to.publicKey),
              sender: transaction.assetRevocationTarget ? algosdk.encodeAddress(transaction.assetRevocationTarget.publicKey) : undefined,
              'close-amount': assetCloseAmount,
              'close-to': transaction.closeRemainderTo ? algosdk.encodeAddress(transaction.closeRemainderTo.publicKey) : undefined,
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.afrz
        ? {
            'asset-freeze-transaction': {
              'asset-id': transaction.assetIndex,
              'new-freeze-status': transaction.freezeState,
              address: algosdk.encodeAddress(transaction.freezeAccount.publicKey),
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.appl
        ? {
            'application-transaction': {
              'application-id': transaction.appIndex,
              'approval-program': decoder.decode(transaction.appApprovalProgram),
              'clear-state-program': decoder.decode(transaction.appClearProgram),
              'on-completion': algodOnCompleteToIndexerOnComplete(transaction.appOnComplete),
              'application-args': transaction.appArgs?.map((a) => Buffer.from(a).toString('base64')),
              'extra-program-pages': transaction.extraPages,
              'foreign-apps': transaction.appForeignApps,
              'foreign-assets': transaction.appForeignAssets,
              ...(blockTransaction.txn.apgs
                ? {
                    'global-state-schema': {
                      'num-byte-slice': transaction.appGlobalByteSlices,
                      'num-uint': transaction.appGlobalInts,
                    },
                  }
                : undefined),
              ...(blockTransaction.txn.apls
                ? {
                    'local-state-schema': {
                      'num-byte-slice': transaction.appLocalByteSlices,
                      'num-uint': transaction.appLocalInts,
                    },
                  }
                : undefined),
              accounts: transaction.appAccounts?.map((a) => algosdk.encodeAddress(a.publicKey)),
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.pay
        ? {
            'payment-transaction': {
              amount: Number(transaction.amount ?? 0), // The amount can be undefined
              receiver: algosdk.encodeAddress(transaction.to.publicKey),
              'close-amount': closeAmount,
              'close-remainder-to': transaction.closeRemainderTo
                ? algosdk.encodeAddress(transaction.closeRemainderTo.publicKey)
                : undefined,
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.keyreg
        ? {
            'keyreg-transaction': {
              'non-participation': transaction.nonParticipation ?? false,
              'selection-participation-key': transaction.selectionKey?.toString('base64'),
              'state-proof-key': transaction.stateProofKey?.toString('base64'),
              'vote-first-valid': transaction.voteFirst,
              'vote-key-dilution': transaction.voteKeyDilution,
              'vote-last-valid': transaction.voteLast,
              'vote-participation-key': transaction.voteKey?.toString('base64'),
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.stpf
        ? {
            'state-proof-transaction': {
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
            },
          }
        : undefined),
      'first-valid': transaction.firstRound,
      'last-valid': transaction.lastRound,
      'tx-type': transaction.type,
      fee: transaction.fee ?? 0,
      sender: algosdk.encodeAddress(transaction.from.publicKey),
      'confirmed-round': roundNumber,
      'round-time': roundTimestamp,
      'intra-round-offset': roundOffset,
      'created-asset-index': createdAssetId,
      'genesis-hash': Buffer.from(transaction.genesisHash).toString('base64'),
      'genesis-id': transaction.genesisID,
      group: transaction.group ? Buffer.from(transaction.group).toString('base64') : undefined,
      note: transaction.note ? Buffer.from(transaction.note).toString('base64') : undefined,
      lease: transaction.lease ? Buffer.from(transaction.lease).toString('base64') : undefined,
      'rekey-to': transaction.reKeyTo ? algosdk.encodeAddress(transaction.reKeyTo.publicKey) : undefined,
      'closing-amount': closeAmount,
      'created-application-index': createdAppId,
      'auth-addr': blockTransaction.sgnr ? algosdk.encodeAddress(blockTransaction.sgnr) : undefined,
      'inner-txns': blockTransaction.dt?.itx?.map((ibt) =>
        getIndexerTransactionFromAlgodTransaction({
          blockTransaction: ibt,
          roundIndex,
          roundOffset: getChildOffset(),
          ...extractTransactionFromBlockTransaction(ibt, genesisHash, genesisId),
          getChildOffset,
          parentOffset,
          parentTransactionId,
          roundNumber,
          roundTimestamp,
          genesisHash,
          genesisId,
        }),
      ),
      ...(blockTransaction.sig || blockTransaction.lsig || blockTransaction.msig
        ? {
            signature: {
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
            },
          }
        : undefined),
      logs: blockTransaction.dt?.lg ? blockTransaction.dt.lg.map((l) => Buffer.from(l).toString('base64')) : undefined,
      'close-rewards': closeRewards,
      'receiver-rewards': receiverRewards,
      'sender-rewards': senderRewards,
      'global-state-delta': blockTransaction.dt?.gd
        ? Object.entries(blockTransaction.dt.gd).map(([key, value]) => ({
            key: Buffer.from(key).toString('base64'),
            value: {
              action: value.at,
              bytes: value.bs ? Buffer.from(value.bs).toString('base64') : undefined,
              uint: value.ui ? Number(value.ui) : undefined,
            },
          }))
        : undefined,

      'local-state-delta': blockTransaction.dt?.ld
        ? Object.entries(blockTransaction.dt.ld).map(([addressIndex, delta]) => {
            const addresses = [
              algosdk.encodeAddress(transaction.from.publicKey),
              ...(transaction.appAccounts?.map((a) => algosdk.encodeAddress(a.publicKey)) || []),
            ]
            return {
              address: addresses[Number(addressIndex)],
              delta: Object.entries(delta).map(([key, value]) => ({
                key: Buffer.from(key).toString('base64'),
                value: {
                  action: value.at,
                  bytes: value.bs ? Buffer.from(value.bs).toString('base64') : undefined,
                  uint: value.ui,
                },
              })),
            }
          })
        : undefined,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(`Failed to transform transaction ${txId} from block ${roundNumber} with offset ${roundOffset}`)
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

/**
 * Extract key metadata from a block.
 * @param blockData The raw block data
 * @returns The block metadata
 */
export function blockDataToBlockMetadata(blockData: BlockData): BlockMetadata {
  const { block, cert } = blockData
  return {
    round: block.rnd,
    hash: cert?.prop?.dig ? Buffer.from(cert.prop.dig).toString('base64') : undefined,
    timestamp: block.ts,
    genesisId: block.gen,
    genesisHash: Buffer.from(block.gh).toString('base64'),
    previousBlockHash: block.prev ? Buffer.from(block.prev).toString('base64') : undefined,
    seed: Buffer.from(block.seed).toString('base64'),
    parentTransactionCount: block.txns?.length ?? 0,
    fullTransactionCount: countAllTransactions(block.txns ?? []),
    rewards: {
      feeSink: algosdk.encodeAddress(block.fees),
      rewardsPool: algosdk.encodeAddress(block.rwd),
      rewardsLevel: block.earn,
      rewardsResidue: block.frac,
      rewardsRate: block.rate ?? 0,
      rewardsCalculationRound: block.rwcalr,
    },
    upgradeState: {
      currentProtocol: block.proto,
      nextProtocol: block.nextproto,
      nextProtocolApprovals: block.nextyes,
      nextProtocolSwitchOn: block.nextswitch,
      nextProtocolVoteBefore: block.nextbefore,
    },
    txnCounter: block.tc,
    transactionsRoot: block.txn ? Buffer.from(block.txn).toString('base64') : 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    transactionsRootSha256: block.txn256,
    ...(block.upgradeyes !== undefined || block.upgradedelay !== undefined || block.upgradeprop !== undefined
      ? {
          upgradeVote: {
            upgradeApprove: block.upgradeyes,
            upgradeDelay: block.upgradedelay,
            upgradePropose: block.upgradeprop,
          },
        }
      : undefined),
    ...(block.partupdabs !== undefined || block.partupdrmv !== undefined
      ? {
          participationUpdates: {
            absentParticipationAccounts: block.partupdabs?.map((addr) => algosdk.encodeAddress(addr)),
            expiredParticipationAccounts: block.partupdrmv?.map((addr) => algosdk.encodeAddress(addr)),
          },
        }
      : undefined),
    stateProofTracking: block.spt
      ? Object.entries(block.spt).map(([key, value]) => ({
          nextRound: value.n,
          onlineTotalWeight: value.t ?? 0,
          type: Number(key),
          votersCommitment: value.v,
        }))
      : undefined,
  }
}

function countAllTransactions(txns: (BlockTransaction | BlockInnerTransaction)[]): number {
  return txns.reduce((sum, txn) => sum + 1 + countAllTransactions(txn.dt?.itx ?? []), 0)
}

/**
 * Extracts balance changes from a block transaction or inner transaction.
 * @param transaction The transaction
 * @returns The balance changes
 */
export function extractBalanceChangesFromBlockTransaction(transaction: BlockTransaction | BlockInnerTransaction): BalanceChange[] {
  const balanceChanges: BalanceChange[] = []

  if ((transaction.txn.fee ?? 0) > 0) {
    balanceChanges.push({
      address: algosdk.encodeAddress(transaction.txn.snd),
      amount: -1n * BigInt(transaction.txn.fee ?? 0),
      roles: [BalanceChangeRole.Sender],
      assetId: 0,
    })
  }

  if (transaction.txn.type === TransactionType.pay) {
    balanceChanges.push(
      {
        address: algosdk.encodeAddress(transaction.txn.snd),
        amount: -1n * BigInt(transaction.txn.amt ?? 0),
        roles: [BalanceChangeRole.Sender],
        assetId: 0,
      },
      ...(transaction.txn.rcv
        ? [
            {
              address: algosdk.encodeAddress(transaction.txn.rcv),
              amount: BigInt(transaction.txn.amt ?? 0),
              roles: [BalanceChangeRole.Receiver],
              assetId: 0,
            },
          ]
        : []),
      ...(transaction.ca && transaction.txn.close
        ? [
            {
              address: algosdk.encodeAddress(transaction.txn.close),
              amount: BigInt(transaction.ca ?? 0),
              roles: [BalanceChangeRole.CloseTo],
              assetId: 0,
            },
            {
              address: algosdk.encodeAddress(transaction.txn.snd),
              amount: -1n * BigInt(transaction.ca ?? 0),
              roles: [BalanceChangeRole.Sender],
              assetId: 0,
            },
          ]
        : []),
    )
  }

  if (transaction.txn.type === TransactionType.axfer && transaction.txn.xaid) {
    balanceChanges.push(
      {
        address: algosdk.encodeAddress(transaction.txn.snd),
        assetId: transaction.txn.xaid,
        amount: -1n * BigInt(transaction.txn.aamt ?? 0),
        roles: [BalanceChangeRole.Sender],
      },
      ...(transaction.txn.arcv
        ? [
            {
              address: algosdk.encodeAddress(transaction.txn.arcv),
              assetId: transaction.txn.xaid,
              amount: BigInt(transaction.txn.aamt ?? 0),
              roles: [BalanceChangeRole.Receiver],
            },
          ]
        : []),
      ...(transaction.aca && transaction.txn.aclose
        ? [
            {
              address: algosdk.encodeAddress(transaction.txn.aclose),
              assetId: transaction.txn.xaid,
              amount: BigInt(transaction.aca ?? 0),
              roles: [BalanceChangeRole.CloseTo],
            },
            {
              address: algosdk.encodeAddress(transaction.txn.asnd ?? transaction.txn.snd),
              assetId: transaction.txn.xaid,
              amount: -1n * BigInt(transaction.aca ?? 0),
              roles: [BalanceChangeRole.Sender],
            },
          ]
        : []),
    )
  }

  if (transaction.txn.type === TransactionType.acfg) {
    if (!transaction.txn.caid && transaction.caid) {
      // Handle balance changes related to the creation of an asset.
      balanceChanges.push({
        address: algosdk.encodeAddress(transaction.txn.snd),
        assetId: transaction.caid,
        amount: BigInt(transaction.txn.apar?.t ?? 0),
        roles: [BalanceChangeRole.AssetCreator],
      })
    } else if (transaction.txn.caid && !transaction.txn.apar) {
      // Handle balance changes related to the destruction of an asset.
      balanceChanges.push({
        address: algosdk.encodeAddress(transaction.txn.snd),
        assetId: transaction.txn.caid,
        amount: BigInt(0),
        roles: [BalanceChangeRole.AssetDestroyer],
      })
    }
  }

  return balanceChanges.reduce((changes, change) => {
    const existing = changes.find((c) => c.address === change.address && c.assetId === change.assetId)
    if (existing) {
      existing.amount += change.amount
      if (!existing.roles.includes(change.roles[0])) {
        existing.roles.push(...change.roles)
      }
    } else {
      changes.push(change)
    }
    return changes
  }, [] as BalanceChange[])
}

/**
 * Extracts balance changes from an indexer transaction result object.
 * @param transaction The transaction to extract balance changes from
 * @returns The set of balance changes
 */
export function extractBalanceChangesFromIndexerTransaction(transaction: TransactionResult): BalanceChange[] {
  const balanceChanges: BalanceChange[] = []

  const getSafeBigInt = (value: number | bigint | undefined) => {
    return BigInt(typeof value === 'bigint' ? value : Number.isNaN(value) ? 0 : value ?? 0)
  }

  if (transaction.fee > 0) {
    balanceChanges.push({
      address: transaction.sender,
      amount: -1n * BigInt(transaction.fee),
      roles: [BalanceChangeRole.Sender],
      assetId: 0,
    })
  }

  if (transaction['tx-type'] === TransactionType.pay && transaction['payment-transaction']) {
    const pay = transaction['payment-transaction']
    balanceChanges.push(
      {
        address: transaction.sender,
        amount: -1n * getSafeBigInt(pay.amount),
        roles: [BalanceChangeRole.Sender],
        assetId: 0,
      },
      {
        address: pay.receiver,
        amount: getSafeBigInt(pay.amount),
        roles: [BalanceChangeRole.Receiver],
        assetId: 0,
      },
      ...(pay['close-amount']
        ? [
            {
              address: pay['close-remainder-to']!,
              amount: getSafeBigInt(pay['close-amount']),
              roles: [BalanceChangeRole.CloseTo],
              assetId: 0,
            },
            {
              address: transaction.sender,
              amount: -1n * getSafeBigInt(pay['close-amount']),
              roles: [BalanceChangeRole.Sender],
              assetId: 0,
            },
          ]
        : []),
    )
  }

  if (transaction['tx-type'] === TransactionType.axfer && transaction['asset-transfer-transaction']) {
    const axfer = transaction['asset-transfer-transaction']
    balanceChanges.push(
      {
        address: axfer.sender ?? transaction.sender,
        assetId: axfer['asset-id'],
        amount: -1n * getSafeBigInt(axfer.amount),
        roles: [BalanceChangeRole.Sender],
      },
      {
        address: axfer.receiver,
        assetId: axfer['asset-id'],
        amount: getSafeBigInt(axfer.amount),
        roles: [BalanceChangeRole.Receiver],
      },
      ...(axfer['close-amount'] && axfer['close-to']
        ? [
            {
              address: axfer['close-to'],
              assetId: axfer['asset-id'],
              amount: getSafeBigInt(axfer['close-amount']),
              roles: [BalanceChangeRole.CloseTo],
            },
            {
              address: axfer.sender ?? transaction.sender,
              assetId: axfer['asset-id'],
              amount: -1n * getSafeBigInt(axfer['close-amount']),
              roles: [BalanceChangeRole.Sender],
            },
          ]
        : []),
    )
  }

  if (transaction['tx-type'] === TransactionType.acfg && transaction['asset-config-transaction']) {
    const acfg = transaction['asset-config-transaction']
    if (!transaction['asset-config-transaction']['asset-id'] && transaction['created-asset-index']) {
      // Handle balance changes related to the creation of an asset.
      balanceChanges.push({
        address: transaction.sender,
        assetId: transaction['created-asset-index'],
        amount: BigInt(acfg.params?.total ?? 0),
        roles: [BalanceChangeRole.AssetCreator],
      })
    } else if (acfg['asset-id'] && !acfg['params']) {
      // Handle balance changes related to the destruction of an asset.
      balanceChanges.push({
        address: transaction.sender,
        assetId: acfg['asset-id'],
        amount: BigInt(0),
        roles: [BalanceChangeRole.AssetDestroyer],
      })
    }
  }

  return balanceChanges.reduce((changes, change) => {
    const existing = changes.find((c) => c.address === change.address && c.assetId === change.assetId)
    if (existing) {
      existing.amount += change.amount
      if (!existing.roles.includes(change.roles[0])) {
        existing.roles.push(...change.roles)
      }
    } else {
      changes.push(change)
    }
    return changes
  }, [] as BalanceChange[])
}
