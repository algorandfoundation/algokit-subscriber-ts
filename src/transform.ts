import { ApplicationOnComplete } from '@algorandfoundation/algokit-utils/types/indexer'
import * as msgpack from 'algorand-msgpack'
import algosdk, { Address } from 'algosdk'
import { Buffer } from 'buffer'
import base32 from 'hi-base32'
import sha512 from 'js-sha512'
import type { Block, BlockData, BlockInnerTransaction, BlockTransaction, TransactionInBlock } from './types/block'
import {
  BalanceChange,
  BalanceChangeRole,
  BlockMetadata,
  SubscribedTransaction,
  SubscribedTransactionApplicationCall,
  SubscribedTransactionAssetConfig,
  SubscribedTransactionAssetFreeze,
  SubscribedTransactionAssetTransfer,
  SubscribedTransactionKeyreg,
  SubscribedTransactionPayment,
  SubscribedTransactionStateProof,
} from './types/subscription'
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
  createdAssetId?: bigint
  createdAppId?: bigint
  assetCloseAmount?: number | bigint
  closeAmount?: number
  logs?: Uint8Array[]
} {
  const txn = extractAndNormaliseTransaction(blockTransaction, genesisHash, genesisId)
  const t = Transaction.fromEncodingData(txn)
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
  const txn = {
    ...blockTransaction.txn,
    apar: blockTransaction.txn.apar ? new Map(Object.entries(blockTransaction.txn.apar)) : undefined,
    apls: blockTransaction.txn.apls ? new Map(Object.entries(blockTransaction.txn.apls)) : undefined,
    apgs: blockTransaction.txn.apgs ? new Map(Object.entries(blockTransaction.txn.apgs)) : undefined,
    apbx: blockTransaction.txn.apbx ? blockTransaction.txn.apbx.map((b) => new Map(Object.entries(b))) : undefined,
  }

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
    txn.arcv = Address.fromString(ALGORAND_ZERO_ADDRESS)
  }

  if (txn.type === TransactionType.pay && !txn.rcv) {
    // from_obj_for_encoding expects rcv to be set, which may not be defined when closing an account.
    txn.rcv = Address.fromString(ALGORAND_ZERO_ADDRESS)
  }

  // Convert txn object to Map
  return new Map(Object.entries(txn))
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
            assetConfigTransaction: {
              assetId: transaction.assetConfig!.assetIndex,
              params: createdAssetId
                ? {
                    creator: algosdk.encodeAddress(transaction.sender.publicKey),
                    decimals: transaction.assetConfig!.decimals,
                    total: transaction.assetConfig!.total,
                    defaultFrozen: transaction.assetConfig!.defaultFrozen,
                    metadataHash: transaction.assetConfig!.assetMetadataHash,
                    ...(transaction.assetConfig!.unitName
                      ? {
                          name: transaction.assetConfig!.unitName,
                          nameB64: encoder.encode(Buffer.from(transaction.assetConfig!.unitName).toString('base64')),
                        }
                      : undefined),
                    ...(transaction.assetConfig!.assetName
                      ? {
                          name: transaction.assetConfig!.assetName,
                          nameB64: encoder.encode(Buffer.from(transaction.assetConfig!.assetName).toString('base64')),
                        }
                      : undefined),
                    ...(transaction.assetConfig!.assetURL
                      ? {
                          url: transaction.assetConfig!.assetURL,
                          urlB64: encoder.encode(Buffer.from(transaction.assetConfig!.assetURL).toString('base64')),
                        }
                      : undefined),
                    manager: transaction.assetConfig!.manager
                      ? algosdk.encodeAddress(transaction.assetConfig!.manager.publicKey)
                      : undefined,
                    reserve: transaction.assetConfig!.reserve
                      ? algosdk.encodeAddress(transaction.assetConfig!.reserve.publicKey)
                      : undefined,
                    clawback: transaction.assetConfig!.clawback
                      ? algosdk.encodeAddress(transaction.assetConfig!.clawback.publicKey)
                      : undefined,
                    freeze: transaction.assetConfig!.freeze ? algosdk.encodeAddress(transaction.assetConfig!.freeze.publicKey) : undefined,
                  }
                : 'apar' in blockTransaction.txn && blockTransaction.txn.apar
                  ? {
                      manager: transaction.assetConfig!.manager
                        ? algosdk.encodeAddress(transaction.assetConfig!.manager.publicKey)
                        : undefined,
                      reserve: transaction.assetConfig!.reserve
                        ? algosdk.encodeAddress(transaction.assetConfig!.reserve.publicKey)
                        : undefined,
                      clawback: transaction.assetConfig!.clawback
                        ? algosdk.encodeAddress(transaction.assetConfig!.clawback.publicKey)
                        : undefined,
                      freeze: transaction.assetConfig!.freeze
                        ? algosdk.encodeAddress(transaction.assetConfig!.freeze.publicKey)
                        : undefined,
                      // These parameters are required in the indexer type so setting to empty values
                      creator: '',
                      decimals: 0,
                      total: BigInt(0),
                    }
                  : undefined,
            } satisfies SubscribedTransactionAssetConfig,
          }
        : undefined),
      ...(transaction.type === TransactionType.axfer
        ? {
            assetTransferTransaction: {
              assetId: transaction.assetTransfer!.assetIndex,
              amount: transaction.assetTransfer!.amount, // The amount can be undefined
              receiver: algosdk.encodeAddress(transaction.assetTransfer!.receiver.publicKey),
              sender: transaction.assetTransfer!.assetSender
                ? algosdk.encodeAddress(transaction.assetTransfer!.assetSender.publicKey)
                : undefined,
              closeAmount: assetCloseAmount !== undefined ? BigInt(assetCloseAmount) : undefined,
              closeTo: transaction.assetTransfer!.closeRemainderTo
                ? algosdk.encodeAddress(transaction.assetTransfer!.closeRemainderTo.publicKey)
                : undefined,
            } satisfies SubscribedTransactionAssetTransfer,
          }
        : undefined),
      ...(transaction.type === TransactionType.afrz
        ? {
            assetFreezeTransaction: {
              assetId: transaction.assetFreeze!.assetIndex,
              newFreezeStatus: transaction.assetFreeze!.frozen,
              address: algosdk.encodeAddress(transaction.assetFreeze!.freezeAccount.publicKey),
            } satisfies SubscribedTransactionAssetFreeze,
          }
        : undefined),
      ...(transaction.type === TransactionType.appl
        ? {
            applicationTransaction: {
              applicationId: transaction.applicationCall!.appIndex ?? 0,
              approvalProgram:
                transaction.applicationCall!.approvalProgram && transaction.applicationCall!.approvalProgram.length > 0
                  ? transaction.applicationCall!.approvalProgram
                  : undefined,
              clearStateProgram:
                transaction.applicationCall!.clearProgram && transaction.applicationCall!.clearProgram.length > 0
                  ? transaction.applicationCall!.clearProgram
                  : undefined,
              onCompletion: algodOnCompleteToIndexerOnComplete(transaction.applicationCall!.onComplete),
              applicationArgs: transaction.applicationCall!.appArgs.map((a) => a),
              foreignApps: transaction.applicationCall!.foreignApps.map((a) => a),
              foreignAssets: transaction.applicationCall!.foreignAssets.map((a) => a),
              ...(blockTransaction.txn.apgs
                ? {
                    globalStateSchema: {
                      numByteSlice: transaction.applicationCall!.numGlobalByteSlices,
                      numUint: transaction.applicationCall!.numGlobalInts,
                    },
                  }
                : undefined),
              ...(blockTransaction.txn.apls
                ? {
                    localStateSchema: {
                      numByteSlice: transaction.applicationCall!.numLocalByteSlices,
                      numUint: transaction.applicationCall!.numLocalInts,
                    },
                  }
                : undefined),
              accounts: transaction.applicationCall!.accounts?.map((a) => a),
            } satisfies SubscribedTransactionApplicationCall,
          }
        : undefined),
      ...(transaction.type === TransactionType.pay
        ? {
            paymentTransaction: {
              amount: BigInt(transaction.payment!.amount ?? 0), // The amount can be undefined
              receiver: algosdk.encodeAddress(transaction.payment!.receiver.publicKey),
              // TODO: PD - confirm closeAmount
              closeAmount: closeAmount !== undefined ? BigInt(closeAmount) : undefined,
              closeRemainderTo: transaction.payment!.closeRemainderTo
                ? algosdk.encodeAddress(transaction.payment!.closeRemainderTo.publicKey)
                : undefined,
            } satisfies SubscribedTransactionPayment,
          }
        : undefined),
      ...(transaction.type === TransactionType.keyreg
        ? {
            keyregTransaction: {
              nonParticipation: transaction.keyreg!.nonParticipation,
              selectionParticipationKey: transaction.keyreg!.selectionKey,
              stateProofKey: transaction.keyreg!.stateProofKey,
              voteFirstValid: transaction.keyreg!.voteFirst,
              voteKeyDilution: transaction.keyreg!.voteKeyDilution,
              voteLastValid: transaction.keyreg!.voteLast,
              voteParticipationKey: transaction.keyreg!.voteKey,
            } satisfies SubscribedTransactionKeyreg,
          }
        : undefined),
      ...(transaction.type === TransactionType.stpf
        ? {
            stateProofTransaction: {
              stateProof: new algosdk.indexerModels.StateProofFields({
                partProofs: transaction.stateProof!.stateProof?.partProofs
                  ? algodMerkleArrayProofToIndexerMerkleArrayProof(transaction.stateProof!.stateProof.partProofs)
                  : undefined,
                positionsToReveal: transaction.stateProof!.stateProof?.positionsToReveal.map((p) => BigInt(p)),
                saltVersion: transaction.stateProof!.stateProof?.merkleSignatureSaltVersion,
                sigCommit: transaction.stateProof!.stateProof?.sigCommit,
                sigProofs: transaction.stateProof!.stateProof?.sigProofs
                  ? algodMerkleArrayProofToIndexerMerkleArrayProof(transaction.stateProof!.stateProof.sigProofs)
                  : undefined,
                signedWeight: transaction.stateProof!.stateProof?.signedWeight,
                reveals: mapKeys(transaction.stateProof!.stateProof?.reveals ?? new Map()).map((position) => {
                  const reveal = transaction.stateProof!.stateProof?.reveals.get(position)!
                  return new algosdk.indexerModels.StateProofReveal({
                    sigSlot: new algosdk.indexerModels.StateProofSigSlot({
                      lowerSigWeight: reveal.sigslot.l,
                      signature: new algosdk.indexerModels.StateProofSignature({
                        merkleArrayIndex: reveal.sigslot.sig.vectorCommitmentIndex,
                        falconSignature: Buffer.from(reveal.sigslot.sig.signature),
                        proof: algodMerkleArrayProofToIndexerMerkleArrayProof(reveal.sigslot.sig.proof),
                        verifyingKey: reveal.sigslot.sig.verifyingKey.publicKey,
                      }),
                    }),
                    position: Number(position),
                    participant: new algosdk.indexerModels.StateProofParticipant({
                      weight: Number(reveal.participant.weight),
                      verifier: new algosdk.indexerModels.StateProofVerifier({
                        keyLifetime: BigInt(reveal.participant.pk.keyLifetime),
                        commitment: reveal.participant.pk.commitment,
                      }),
                    }),
                  })
                }),
              }),
              message: new algosdk.indexerModels.IndexerStateProofMessage({
                blockHeadersCommitment: Buffer.from(transaction.stateProof!.message!.blockHeadersCommitment),
                firstAttestedRound: BigInt(transaction.stateProof!.message!.firstAttestedRound),
                latestAttestedRound: BigInt(transaction.stateProof!.message!.lastAttestedRound),
                lnProvenWeight: BigInt(transaction.stateProof!.message!.lnProvenWeight),
                votersCommitment: Buffer.from(transaction.stateProof!.message!.votersCommitment),
              }),
              stateProofType: Number(transaction.stateProof!.stateProofType ?? 0),
            } satisfies SubscribedTransactionStateProof,
          }
        : undefined),
      firstValid: transaction.firstValid,
      lastValid: transaction.lastValid,
      txType: transaction.type,
      fee: transaction.fee ?? 0,
      sender: algosdk.encodeAddress(transaction.sender.publicKey),
      confirmedRound: BigInt(roundNumber),
      roundTime: roundTimestamp,
      intraRoundOffset: roundOffset,
      createdAssetIndex: createdAssetId,
      genesisHash: transaction.genesisHash,
      genesisId: transaction.genesisID,
      group: transaction.group,
      note: transaction.note,
      lease: transaction.lease,
      rekeyTo: transaction.rekeyTo,
      closingAmount: closeAmount !== undefined ? BigInt(closeAmount) : undefined,
      createdApplicationIndex: createdAppId,
      authAddr: blockTransaction.sgnr ? new algosdk.Address(blockTransaction.sgnr) : undefined,
      innerTxns: blockTransaction.dt?.itx?.map((ibt) =>
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
            signature: new algosdk.indexerModels.TransactionSignature({
              sig: blockTransaction.sig ? Buffer.from(blockTransaction.sig).toString('base64') : undefined,
              logicsig: blockTransaction.lsig
                ? new algosdk.indexerModels.TransactionSignatureLogicsig({
                    logic: Buffer.from(blockTransaction.lsig.l).toString('base64'),
                    args: blockTransaction.lsig.arg,
                    signature: blockTransaction.lsig.sig ? Buffer.from(blockTransaction.lsig.sig).toString('base64') : undefined,
                    multisigSignature: blockTransaction.lsig.msig
                      ? new algosdk.indexerModels.TransactionSignatureMultisig({
                          version: blockTransaction.lsig.msig.v,
                          threshold: blockTransaction.lsig.msig.thr,
                          subsignature: blockTransaction.lsig.msig.subsig.map(
                            (s) =>
                              new algosdk.indexerModels.TransactionSignatureMultisigSubsignature({
                                publicKey: Buffer.from(s.pk).toString('base64'),
                                signature: s.s ? Buffer.from(s.s).toString('base64') : undefined,
                              }),
                          ),
                        })
                      : undefined,
                  })
                : undefined,
              multisig: blockTransaction.msig
                ? new algosdk.indexerModels.TransactionSignatureMultisig({
                    version: blockTransaction.msig.v,
                    threshold: blockTransaction.msig.thr,
                    subsignature: blockTransaction.msig.subsig.map(
                      (s) =>
                        new algosdk.indexerModels.TransactionSignatureMultisigSubsignature({
                          publicKey: Buffer.from(s.pk).toString('base64'),
                          signature: s.s ? Buffer.from(s.s).toString('base64') : undefined,
                        }),
                    ),
                  })
                : undefined,
            }),
          }
        : undefined),
      logs: blockTransaction.dt?.lg,
      closeRewards: closeRewards !== undefined ? BigInt(closeRewards) : undefined,
      receiverRewards: receiverRewards !== undefined ? BigInt(receiverRewards) : undefined,
      senderRewards: senderRewards !== undefined ? BigInt(senderRewards) : undefined,
      globalStateDelta: blockTransaction.dt?.gd
        ? Object.entries(blockTransaction.dt.gd).map(
            ([key, value]) =>
              new algosdk.indexerModels.EvalDeltaKeyValue({
                key: Buffer.from(key).toString('base64'),
                value: new algosdk.indexerModels.EvalDelta({
                  action: value.at,
                  bytes: value.bs ? Buffer.from(value.bs).toString('base64') : undefined,
                  uint: value.ui !== undefined ? BigInt(value.ui) : undefined,
                }),
              }),
          )
        : undefined,
      localStateDelta: blockTransaction.dt?.ld
        ? Object.entries(blockTransaction.dt.ld).map(([addressIndex, delta]) => {
            const addresses = [
              algosdk.encodeAddress(transaction.sender.publicKey),
              ...(transaction.applicationCall?.accounts?.map((a) => algosdk.encodeAddress(a.publicKey)) || []),
            ]
            return new algosdk.indexerModels.AccountStateDelta({
              address: addresses[Number(addressIndex)],
              delta: Object.entries(delta).map(
                ([key, value]) =>
                  new algosdk.indexerModels.EvalDeltaKeyValue({
                    key: Buffer.from(key).toString('base64'),
                    value: new algosdk.indexerModels.EvalDelta({
                      action: value.at,
                      bytes: value.bs ? Buffer.from(value.bs).toString('base64') : undefined,
                      uint: value.ui !== undefined ? BigInt(value.ui) : undefined,
                    }),
                  }),
              ),
            })
          })
        : undefined,
    } satisfies SubscribedTransaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(`Failed to transform transaction ${txId} from block ${roundNumber} with offset ${roundOffset}`)
    throw e
  }
}

function algodMerkleArrayProofToIndexerMerkleArrayProof(proof: algosdk.MerkleArrayProof): algosdk.indexerModels.MerkleArrayProof {
  return new algosdk.indexerModels.MerkleArrayProof({
    hashFactory: proof.hashFactory
      ? new algosdk.indexerModels.HashFactory({
          hashType: proof.hashFactory.hashType,
        })
      : undefined,
    path: proof.path,
    treeDepth: proof.treeDepth,
  })
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
    round: BigInt(block.rnd),
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
      rewardsCalculationRound: BigInt(block.rwcalr),
    },
    upgradeState: {
      currentProtocol: block.proto,
      nextProtocol: block.nextproto,
      nextProtocolApprovals: block.nextyes,
      nextProtocolSwitchOn: block.nextswitch !== undefined ? BigInt(block.nextswitch) : undefined,
      nextProtocolVoteBefore: block.nextbefore !== undefined ? BigInt(block.nextbefore) : undefined,
    },
    txnCounter: BigInt(block.tc ?? 0),
    transactionsRoot: block.txn ? Buffer.from(block.txn).toString('base64') : 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    transactionsRootSha256: block.txn256,
    proposer: block.prp ? algosdk.encodeAddress(block.prp) : undefined,
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
          nextRound: value.n !== undefined ? BigInt(value.n) : undefined,
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
      address: transaction.txn.snd.toString(),
      amount: -1n * BigInt(transaction.txn.fee ?? 0),
      roles: [BalanceChangeRole.Sender],
      assetId: 0n,
    })
  }

  if (transaction.txn.type === TransactionType.pay) {
    balanceChanges.push(
      {
        address: transaction.txn.snd.toString(),
        amount: -1n * BigInt(transaction.txn.amt ?? 0),
        roles: [BalanceChangeRole.Sender],
        assetId: 0n,
      },
      ...(transaction.txn.rcv
        ? [
            {
              address: transaction.txn.rcv.toString(),
              amount: BigInt(transaction.txn.amt ?? 0),
              roles: [BalanceChangeRole.Receiver],
              assetId: 0n,
            },
          ]
        : []),
      ...(transaction.ca && transaction.txn.close
        ? [
            {
              address: transaction.txn.close.toString(),
              amount: BigInt(transaction.ca ?? 0),
              roles: [BalanceChangeRole.CloseTo],
              assetId: 0n,
            },
            {
              address: transaction.txn.snd.toString(),
              amount: -1n * BigInt(transaction.ca ?? 0),
              roles: [BalanceChangeRole.Sender],
              assetId: 0n,
            },
          ]
        : []),
    )
  }

  if (transaction.txn.type === TransactionType.axfer && transaction.txn.xaid) {
    balanceChanges.push(
      {
        address: transaction.txn.snd.toString(),
        assetId: transaction.txn.xaid,
        amount: -1n * BigInt(transaction.txn.aamt ?? 0),
        roles: [BalanceChangeRole.Sender],
      },
      ...(transaction.txn.arcv
        ? [
            {
              address: transaction.txn.arcv.toString(),
              assetId: transaction.txn.xaid,
              amount: BigInt(transaction.txn.aamt ?? 0),
              roles: [BalanceChangeRole.Receiver],
            },
          ]
        : []),
      ...(transaction.aca && transaction.txn.aclose
        ? [
            {
              address: transaction.txn.aclose.toString(),
              assetId: transaction.txn.xaid,
              amount: BigInt(transaction.aca ?? 0),
              roles: [BalanceChangeRole.CloseTo],
            },
            {
              address: (transaction.txn.asnd ?? transaction.txn.snd).toString(),
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
        address: transaction.txn.snd.toString(),
        assetId: transaction.caid,
        amount: BigInt(transaction.txn.apar?.t ?? 0),
        roles: [BalanceChangeRole.AssetCreator],
      })
    } else if (transaction.txn.caid && !transaction.txn.apar) {
      // Handle balance changes related to the destruction of an asset.
      balanceChanges.push({
        address: transaction.txn.snd.toString(),
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
export function extractBalanceChangesFromIndexerTransaction(transaction: SubscribedTransaction): BalanceChange[] {
  const balanceChanges: BalanceChange[] = []

  const getSafeBigInt = (value: number | bigint | undefined) => {
    return BigInt(typeof value === 'bigint' ? value : Number.isNaN(value) ? 0 : value ?? 0)
  }

  if (transaction.fee > 0) {
    balanceChanges.push({
      address: transaction.sender,
      amount: -1n * BigInt(transaction.fee),
      roles: [BalanceChangeRole.Sender],
      assetId: 0n,
    })
  }

  if (transaction.txType === TransactionType.pay && transaction.paymentTransaction) {
    const pay = transaction.paymentTransaction
    balanceChanges.push(
      {
        address: transaction.sender,
        amount: -1n * getSafeBigInt(pay.amount),
        roles: [BalanceChangeRole.Sender],
        assetId: 0n,
      },
      {
        address: pay.receiver,
        amount: getSafeBigInt(pay.amount),
        roles: [BalanceChangeRole.Receiver],
        assetId: 0n,
      },
      ...(pay.closeAmount
        ? [
            {
              address: pay.closeRemainderTo!,
              amount: getSafeBigInt(pay.closeAmount),
              roles: [BalanceChangeRole.CloseTo],
              assetId: 0n,
            },
            {
              address: transaction.sender,
              amount: -1n * getSafeBigInt(pay.closeAmount),
              roles: [BalanceChangeRole.Sender],
              assetId: 0n,
            },
          ]
        : []),
    )
  }

  if (transaction.txType === TransactionType.axfer && transaction.assetTransferTransaction) {
    const axfer = transaction.assetTransferTransaction
    balanceChanges.push(
      {
        address: axfer.sender ?? transaction.sender,
        assetId: axfer.assetId,
        amount: -1n * getSafeBigInt(axfer.amount),
        roles: [BalanceChangeRole.Sender],
      },
      {
        address: axfer.receiver,
        assetId: axfer.assetId,
        amount: getSafeBigInt(axfer.amount),
        roles: [BalanceChangeRole.Receiver],
      },
      ...(axfer.closeAmount && axfer.closeTo
        ? [
            {
              address: axfer.closeTo,
              assetId: axfer.assetId,
              amount: getSafeBigInt(axfer.closeAmount),
              roles: [BalanceChangeRole.CloseTo],
            },
            {
              address: axfer.sender ?? transaction.sender,
              assetId: axfer.assetId,
              amount: -1n * getSafeBigInt(axfer.closeAmount),
              roles: [BalanceChangeRole.Sender],
            },
          ]
        : []),
    )
  }

  if (transaction.txType === TransactionType.acfg && transaction.assetConfigTransaction) {
    const acfg = transaction.assetConfigTransaction
    if (!transaction.assetConfigTransaction.assetId && transaction.createdAssetIndex) {
      // Handle balance changes related to the creation of an asset.
      balanceChanges.push({
        address: transaction.sender,
        assetId: transaction.createdAssetIndex,
        amount: BigInt(acfg.params?.total ?? 0),
        roles: [BalanceChangeRole.AssetCreator],
      })
    } else if (acfg.assetId && !acfg['params']) {
      // Handle balance changes related to the destruction of an asset.
      balanceChanges.push({
        address: transaction.sender,
        assetId: acfg.assetId,
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

export function getTransactionType(type: string): TransactionType {
  switch (type) {
    case 'pay':
      return TransactionType.pay
    case 'keyreg':
      return TransactionType.keyreg
    case 'acfg':
      return TransactionType.acfg
    case 'axfer':
      return TransactionType.axfer
    case 'afrz':
      return TransactionType.afrz
    case 'appl':
      return TransactionType.appl
    case 'stpf':
      return TransactionType.stpf
    default:
      throw new Error(`Unknown transaction type: ${type}`)
  }
}
