import { ApplicationOnComplete } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk, { SignedTxnWithAD, UntypedValue } from 'algosdk'
import { Buffer } from 'buffer'
import type { TransactionInBlock } from './types/block'
import { BalanceChange, BalanceChangeRole, BlockMetadata, SubscribedTransaction } from './types/subscription'
import OnApplicationComplete = algosdk.OnApplicationComplete
import Transaction = algosdk.Transaction
import TransactionType = algosdk.TransactionType

export const ALGORAND_ZERO_ADDRESS = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ'
export const ALGORAND_ZERO_ADDRESS_BYTES = algosdk.decodeAddress(ALGORAND_ZERO_ADDRESS).publicKey

/**
 * Gets the synthetic transaction for the block payout as defined in the indexer
 *
 * @see https://github.com/algorand/indexer/blob/084577338ad4882f5797b3e1b30b84718ad40333/idb/postgres/internal/writer/write_txn.go?plain=1#L180-L202
 */
export function getTransactionFromBlockPayout(block: algosdk.modelsv2.BlockResponse, getRoundOffset: () => number): TransactionInBlock {
  const pay = new algosdk.Transaction({
    type: algosdk.TransactionType.pay,
    sender: block.block.header.rewardState.feeSink,
    note: new Uint8Array(Buffer.from(`ProposerPayout for Round ${block.block.header.round}`)),
    suggestedParams: {
      firstValid: block.block.header.round,
      lastValid: block.block.header.round,
      genesisID: block.block.header.genesisID,
      genesisHash: block.block.header.genesisHash,
      fee: 0n,
      minFee: 0n,
    },
    paymentParams: {
      receiver: block.block.header.proposer,
      amount: block.block.header.proposerPayout,
    },
  })

  const txn: TransactionInBlock = {
    transactionId: pay.txID(),
    roundTimestamp: Number(block.block.header.timestamp),
    transaction: pay,
    intraRoundOffset: getRoundOffset(),
    roundNumber: block.block.header.round,
    signedTxnWithAD: new algosdk.SignedTxnWithAD({
      applyData: new algosdk.ApplyData({}),
      signedTxn: new algosdk.SignedTransaction({ txn: pay }),
    }),
  }

  return txn
}

/**
 * Processes a block and returns all transactions from it, including inner transactions, with key information populated.
 * @param blockResponse An Algorand block
 * @returns An array of processed transactions from the block
 */
export function getBlockTransactions(blockResponse: algosdk.modelsv2.BlockResponse): TransactionInBlock[] {
  const block = blockResponse.block

  let roundOffset = 0
  const getRoundOffset = () => roundOffset++

  const txns = (block.payset ?? []).flatMap((signedTransactionInBlock) => {
    // Assume that Consensus.RequireGenesisHash is true, we always copy the genesis hash from the block to the transaction
    const genesisHash = Buffer.from(blockResponse.block.header.genesisHash)
    const genesisId = signedTransactionInBlock.hasGenesisID ? blockResponse.block.header.genesisID : undefined

    const rootTransactionData = extractTransactionDataFromSignedTxnInBlock(signedTransactionInBlock.signedTxn, genesisHash, genesisId)

    const rootTransaction = {
      signedTxnWithAD: signedTransactionInBlock.signedTxn,
      transactionId: rootTransactionData.transaction.txID(),
      intraRoundOffset: getRoundOffset(),
      roundNumber: block.header.round,
      roundTimestamp: Number(block.header.timestamp),
      genesisId: block.header.genesisID,
      genesisHash: Buffer.from(block.header.genesisHash),
      ...rootTransactionData,
    } satisfies TransactionInBlock

    let parentOffset = 0
    const getParentOffset = () => parentOffset++

    return [
      rootTransaction,
      ...(signedTransactionInBlock.signedTxn.applyData.evalDelta?.innerTxns ?? []).flatMap((innerTransaction) =>
        getBlockInnerTransactions(innerTransaction, block, rootTransaction, getRoundOffset, getParentOffset, genesisHash),
      ),
    ]
  })

  if (blockResponse.block.header.proposerPayout > 0n) {
    txns.push(getTransactionFromBlockPayout(blockResponse, getRoundOffset))
  }

  return txns
}

function getBlockInnerTransactions(
  signedTxnWithAD: algosdk.SignedTxnWithAD,
  block: algosdk.Block,
  rootTransaction: TransactionInBlock,
  getRoundOffset: () => number,
  getParentOffset: () => number,
  genesisHash?: Buffer,
): TransactionInBlock[] {
  const transactionData = extractTransactionDataFromSignedTxnInBlock(signedTxnWithAD, genesisHash)
  const offset = getParentOffset() + 1
  const transactionId = `${rootTransaction.transactionId}/inner/${offset}`

  const transaction = {
    signedTxnWithAD,
    roundNumber: block.header.round,
    roundTimestamp: Number(block.header.timestamp),
    transactionId,
    genesisHash,
    intraRoundOffset: getRoundOffset(),
    parentIntraRoundOffset: rootTransaction.intraRoundOffset,
    parentTransactionId: rootTransaction.transactionId,
    ...transactionData,
  } satisfies TransactionInBlock

  return [
    transaction,
    ...(signedTxnWithAD.applyData.evalDelta?.innerTxns ?? []).flatMap((innerInnerTransaction) =>
      getBlockInnerTransactions(innerInnerTransaction, block, rootTransaction, getRoundOffset, getParentOffset, genesisHash),
    ),
  ]
}

/**
 * Transform a signed transaction with apply data into a `algosdk.Transaction` object and other key transaction data.
 *
 * @param signedTxnWithAD The signed transaction with apply data from a block
 * @returns The `algosdk.Transaction` object along with key secondary information from the block.
 */
function extractTransactionDataFromSignedTxnInBlock(
  signedTxnWithAD: algosdk.SignedTxnWithAD,
  genesisHash?: Buffer,
  genesisId?: string,
): {
  transaction: Transaction
  createdAssetId?: bigint
  createdAppId?: bigint
  assetCloseAmount?: bigint
  closeAmount?: bigint
  logs?: Uint8Array[]
} {
  // Normalise the transaction so that the transaction ID is generated correctly
  const txnMap = signedTxnWithAD.signedTxn.txn.toEncodingData()
  if (genesisHash) {
    txnMap.set('gh', genesisHash)
  }
  if (genesisId) {
    txnMap.set('gen', genesisId)
  }
  const txn = algosdk.Transaction.fromEncodingData(txnMap)

  return {
    transaction: txn,
    createdAssetId: signedTxnWithAD.applyData.configAsset,
    createdAppId: signedTxnWithAD.applyData.applicationID,
    assetCloseAmount: signedTxnWithAD.applyData.assetClosingAmount,
    closeAmount: signedTxnWithAD.applyData.closingAmount,
    logs: signedTxnWithAD.applyData.evalDelta?.logs,
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

/**
 * Transforms the given TransactionInBlock object into a SubscribedTransaction.
 * @param t The `TransactionInBlock` object to transform
 * @param filterName The filter name
 * @returns The SubscribedTransaction
 */
export function getIndexerTransactionFromAlgodTransaction(t: TransactionInBlock, filterName?: string): SubscribedTransaction {
  const {
    transaction,
    createdAssetId,
    signedTxnWithAD,
    assetCloseAmount,
    closeAmount,
    createdAppId,
    intraRoundOffset,
    transactionId,
    parentTransactionId,
    parentIntraRoundOffset,
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

  let parentOffset = 1
  const getParentOffset = () => parentOffset++

  try {
    // https://github.com/algorand/indexer/blob/main/api/converter_utils.go#L249

    return new SubscribedTransaction({
      id: transactionId,
      parentTransactionId,
      parentIntraRoundOffset,
      filtersMatched: filterName ? [filterName] : undefined,
      ...(transaction.type === TransactionType.acfg && transaction.assetConfig
        ? {
            assetConfigTransaction: new algosdk.indexerModels.TransactionAssetConfig({
              assetId: transaction.assetConfig.assetIndex,
              params: createdAssetId
                ? new algosdk.indexerModels.AssetParams({
                    creator: transaction.sender.toString(),
                    decimals: transaction.assetConfig.decimals,
                    total: transaction.assetConfig.total,
                    defaultFrozen: transaction.assetConfig.defaultFrozen,
                    metadataHash: transaction.assetConfig.assetMetadataHash,
                    ...(transaction.assetConfig.unitName
                      ? {
                          unitName: transaction.assetConfig.unitName,
                          unitNameB64: Buffer.from(transaction.assetConfig.unitName).toString('base64'),
                        }
                      : undefined),
                    ...(transaction.assetConfig.assetName
                      ? {
                          name: transaction.assetConfig.assetName,
                          nameB64: Buffer.from(transaction.assetConfig.assetName).toString('base64'),
                        }
                      : undefined),
                    ...(transaction.assetConfig.assetURL
                      ? {
                          url: transaction.assetConfig.assetURL,
                          urlB64: Buffer.from(transaction.assetConfig.assetURL).toString('base64'),
                        }
                      : undefined),
                    manager: transaction.assetConfig.manager?.toString(),
                    reserve: transaction.assetConfig.reserve?.toString(),
                    clawback: transaction.assetConfig.clawback?.toString(),
                    freeze: transaction.assetConfig.freeze?.toString(),
                  })
                : // In algosdk, transaction.assetConfig is always defined, even if it's an asset destroy transaction
                  // If any field is truthy, it's an asset update, otherwise, it's an asset destroy
                  transaction.assetConfig.manager ||
                    transaction.assetConfig.reserve ||
                    transaction.assetConfig.clawback ||
                    transaction.assetConfig.freeze ||
                    transaction.assetConfig.unitName ||
                    transaction.assetConfig.assetName ||
                    transaction.assetConfig.assetURL ||
                    transaction.assetConfig.assetMetadataHash
                  ? new algosdk.indexerModels.AssetParams({
                      manager: transaction.assetConfig.manager?.toString(),
                      reserve: transaction.assetConfig.reserve?.toString(),
                      clawback: transaction.assetConfig.clawback?.toString(),
                      freeze: transaction.assetConfig.freeze?.toString(),
                      // These parameters are required in the indexer type so setting to empty values
                      creator: '',
                      decimals: 0,
                      total: 0,
                    })
                  : undefined,
            }),
          }
        : undefined),
      ...(transaction.type === TransactionType.axfer
        ? {
            assetTransferTransaction: new algosdk.indexerModels.TransactionAssetTransfer({
              assetId: transaction.assetTransfer!.assetIndex,
              amount: transaction.assetTransfer!.amount,
              receiver: transaction.assetTransfer!.receiver.toString(),
              sender: transaction.assetTransfer!.assetSender ? transaction.assetTransfer!.assetSender.toString() : undefined,
              closeAmount: assetCloseAmount,
              closeTo: transaction.assetTransfer!.closeRemainderTo ? transaction.assetTransfer!.closeRemainderTo.toString() : undefined,
            }),
          }
        : undefined),
      ...(transaction.type === TransactionType.afrz
        ? {
            assetFreezeTransaction: new algosdk.indexerModels.TransactionAssetFreeze({
              assetId: transaction.assetFreeze!.assetIndex,
              newFreezeStatus: transaction.assetFreeze!.frozen,
              address: transaction.assetFreeze!.freezeAccount.toString(),
            }),
          }
        : undefined),
      ...(transaction.type === TransactionType.appl
        ? {
            applicationTransaction: new algosdk.indexerModels.TransactionApplication({
              applicationId: transaction.applicationCall!.appIndex ?? 0,
              approvalProgram: transaction.applicationCall!.approvalProgram,
              clearStateProgram: transaction.applicationCall!.clearProgram,
              onCompletion: algodOnCompleteToIndexerOnComplete(transaction.applicationCall!.onComplete),
              applicationArgs: transaction.applicationCall!.appArgs.map((a) => a),
              foreignApps: transaction.applicationCall!.foreignApps.map((a) => a),
              foreignAssets: transaction.applicationCall!.foreignAssets.map((a) => a),
              globalStateSchema: new algosdk.indexerModels.StateSchema({
                numByteSlice: transaction.applicationCall!.numGlobalByteSlices,
                numUint: transaction.applicationCall!.numGlobalInts,
              }),
              localStateSchema: new algosdk.indexerModels.StateSchema({
                numByteSlice: transaction.applicationCall!.numLocalByteSlices,
                numUint: transaction.applicationCall!.numLocalInts,
              }),
              accounts: transaction.applicationCall!.accounts.map((a) => a),
              boxReferences:
                transaction.applicationCall!.boxes?.map((b) => {
                  return new algosdk.indexerModels.BoxReference({ app: b.appIndex, name: b.name })
                }) ?? [],
              access:
                transaction.applicationCall!.access?.map((ar) => {
                  return new algosdk.indexerModels.ResourceRef({
                    address: ar.address,
                    applicationId: ar.appIndex,
                    assetId: ar.assetIndex,
                    box: ar.box
                      ? new algosdk.indexerModels.BoxReference({
                          app: ar.box.appIndex,
                          name: ar.box.name,
                        })
                      : undefined,
                    holding: ar.holding
                      ? new algosdk.indexerModels.HoldingRef({
                          address: ar.holding.address,
                          asset: ar.holding.assetIndex,
                        })
                      : undefined,
                    local: ar.locals
                      ? new algosdk.indexerModels.LocalsRef({
                          address: ar.locals.address,
                          app: ar.locals.appIndex,
                        })
                      : undefined,
                  })
                }) ?? [],
              extraProgramPages: transaction.applicationCall!.extraPages,
              rejectVersion: transaction.applicationCall!.rejectVersion,
            }),
          }
        : undefined),
      ...(transaction.type === TransactionType.pay
        ? {
            paymentTransaction: new algosdk.indexerModels.TransactionPayment({
              amount: transaction.payment!.amount,
              receiver: transaction.payment!.receiver.toString(),
              closeAmount: closeAmount,
              closeRemainderTo: transaction.payment!.closeRemainderTo?.toString(),
            }),
          }
        : undefined),
      ...(transaction.type === TransactionType.keyreg
        ? {
            keyregTransaction: new algosdk.indexerModels.TransactionKeyreg({
              nonParticipation: transaction.keyreg!.nonParticipation,
              selectionParticipationKey: transaction.keyreg!.selectionKey,
              stateProofKey: transaction.keyreg!.stateProofKey,
              voteFirstValid: transaction.keyreg!.voteFirst,
              voteKeyDilution: transaction.keyreg!.voteKeyDilution,
              voteLastValid: transaction.keyreg!.voteLast,
              voteParticipationKey: transaction.keyreg!.voteKey,
            }),
          }
        : undefined),
      ...(transaction.type === TransactionType.stpf
        ? {
            stateProofTransaction: new algosdk.indexerModels.TransactionStateProof({
              stateProof: new algosdk.indexerModels.StateProofFields({
                partProofs: transaction.stateProof!.stateProof?.partProofs
                  ? algodMerkleArrayProofToIndexerMerkleArrayProof(transaction.stateProof!.stateProof.partProofs)
                  : undefined,
                positionsToReveal: transaction.stateProof!.stateProof?.positionsToReveal,
                saltVersion: transaction.stateProof!.stateProof?.merkleSignatureSaltVersion,
                sigCommit: transaction.stateProof!.stateProof?.sigCommit,
                sigProofs: transaction.stateProof!.stateProof?.sigProofs
                  ? algodMerkleArrayProofToIndexerMerkleArrayProof(transaction.stateProof!.stateProof.sigProofs)
                  : undefined,
                signedWeight: transaction.stateProof!.stateProof?.signedWeight,
                reveals: transaction.stateProof!.stateProof?.reveals
                  ? Array.from(transaction.stateProof!.stateProof?.reveals.entries()).map(([position, reveal]) => {
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
                        position: position,
                        participant: new algosdk.indexerModels.StateProofParticipant({
                          weight: reveal.participant.weight,
                          verifier: new algosdk.indexerModels.StateProofVerifier({
                            keyLifetime: reveal.participant.pk.keyLifetime,
                            commitment: reveal.participant.pk.commitment,
                          }),
                        }),
                      })
                    })
                  : undefined,
              }),
              message: new algosdk.indexerModels.IndexerStateProofMessage({
                blockHeadersCommitment: Buffer.from(transaction.stateProof!.message!.blockHeadersCommitment),
                firstAttestedRound: transaction.stateProof!.message!.firstAttestedRound,
                latestAttestedRound: transaction.stateProof!.message!.lastAttestedRound,
                lnProvenWeight: transaction.stateProof!.message!.lnProvenWeight,
                votersCommitment: Buffer.from(transaction.stateProof!.message!.votersCommitment),
              }),
              stateProofType: Number(transaction.stateProof!.stateProofType ?? 0),
            }),
          }
        : undefined),
      ...(transaction.type === TransactionType.hb && transaction.heartbeat
        ? {
            heartbeatTransaction: new algosdk.indexerModels.TransactionHeartbeat({
              hbAddress: transaction.heartbeat.address.toString(),
              hbKeyDilution: transaction.heartbeat.keyDilution,
              hbProof: new algosdk.indexerModels.HbProofFields({
                hbPk: transaction.heartbeat.proof.pk,
                hbPk1sig: transaction.heartbeat.proof.pk1Sig,
                hbPk2: transaction.heartbeat.proof.pk2,
                hbPk2sig: transaction.heartbeat.proof.pk2Sig,
                hbSig: transaction.heartbeat.proof.sig,
              }),
              hbSeed: transaction.heartbeat.seed,
              hbVoteId: transaction.heartbeat.voteID,
            }),
          }
        : undefined),
      firstValid: transaction.firstValid,
      lastValid: transaction.lastValid,
      txType: transaction.type,
      fee: transaction.fee ?? 0,
      sender: transaction.sender.toString(),
      confirmedRound: roundNumber,
      roundTime: Number(roundTimestamp),
      intraRoundOffset: intraRoundOffset,
      createdAssetIndex: createdAssetId,
      genesisHash: transaction.genesisHash,
      genesisId: transaction.genesisID,
      group: transaction.group,
      note: transaction.note,
      lease: transaction.lease,
      rekeyTo: transaction.rekeyTo,
      closingAmount: closeAmount,
      createdApplicationIndex: createdAppId,
      authAddr: signedTxnWithAD.signedTxn.sgnr,
      innerTxns: signedTxnWithAD.applyData.evalDelta?.innerTxns.map((innerTxn) => {
        const offset = getParentOffset()
        const childIntraRoundOffset = intraRoundOffset + offset
        const innerTransactionId = `${parentTransactionId}/inner/${childIntraRoundOffset - (parentIntraRoundOffset ?? intraRoundOffset)}`

        return getIndexerTransactionFromAlgodTransaction({
          signedTxnWithAD: innerTxn,
          intraRoundOffset: childIntraRoundOffset,
          ...extractTransactionDataFromSignedTxnInBlock(innerTxn, genesisHash, genesisId),
          transactionId: innerTransactionId,
          parentTransactionId: parentTransactionId,
          parentIntraRoundOffset: parentIntraRoundOffset,
          roundNumber,
          roundTimestamp,
          genesisHash,
          genesisId,
        })
      }),
      ...(signedTxnWithAD.signedTxn.sig || signedTxnWithAD.signedTxn.lsig || signedTxnWithAD.signedTxn.msig
        ? {
            signature: new algosdk.indexerModels.TransactionSignature({
              sig: signedTxnWithAD.signedTxn.sig ? Buffer.from(signedTxnWithAD.signedTxn.sig).toString('base64') : undefined,
              logicsig: signedTxnWithAD.signedTxn.lsig
                ? new algosdk.indexerModels.TransactionSignatureLogicsig({
                    logic: Buffer.from(signedTxnWithAD.signedTxn.lsig.logic).toString('base64'),
                    args: signedTxnWithAD.signedTxn.lsig.args,
                    signature: signedTxnWithAD.signedTxn.lsig.sig
                      ? Buffer.from(signedTxnWithAD.signedTxn.lsig.sig).toString('base64')
                      : undefined,
                    multisigSignature: signedTxnWithAD.signedTxn.lsig.msig
                      ? new algosdk.indexerModels.TransactionSignatureMultisig({
                          version: signedTxnWithAD.signedTxn.lsig.msig.v,
                          threshold: signedTxnWithAD.signedTxn.lsig.msig.thr,
                          subsignature: signedTxnWithAD.signedTxn.lsig.msig.subsig.map(
                            (s) =>
                              new algosdk.indexerModels.TransactionSignatureMultisigSubsignature({
                                publicKey: Buffer.from(s.pk).toString('base64'),
                                signature: s.s ? Buffer.from(s.s).toString('base64') : undefined,
                              }),
                          ),
                        })
                      : undefined,
                    logicMultisigSignature: signedTxnWithAD.signedTxn.lsig.lmsig
                      ? new algosdk.indexerModels.TransactionSignatureMultisig({
                          version: signedTxnWithAD.signedTxn.lsig.lmsig.v,
                          threshold: signedTxnWithAD.signedTxn.lsig.lmsig.thr,
                          subsignature: signedTxnWithAD.signedTxn.lsig.lmsig.subsig.map(
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
              multisig: signedTxnWithAD.signedTxn.msig
                ? new algosdk.indexerModels.TransactionSignatureMultisig({
                    version: signedTxnWithAD.signedTxn.msig.v,
                    threshold: signedTxnWithAD.signedTxn.msig.thr,
                    subsignature: signedTxnWithAD.signedTxn.msig.subsig.map(
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
      logs: signedTxnWithAD.applyData.evalDelta?.logs,
      closeRewards: closeRewards,
      receiverRewards: receiverRewards,
      senderRewards: senderRewards,
      globalStateDelta: signedTxnWithAD.applyData.evalDelta?.globalDelta
        ? Array.from(signedTxnWithAD.applyData.evalDelta?.globalDelta.entries()).map(
            ([key, value]) =>
              new algosdk.indexerModels.EvalDeltaKeyValue({
                key: Buffer.from(key).toString('base64'),
                value: new algosdk.indexerModels.EvalDelta({
                  action: value.action,
                  ...(value.action === 2
                    ? {
                        uint: value.uint,
                      }
                    : {
                        bytes: value.bytes ? Buffer.from(value.bytes).toString('base64') : undefined,
                        uint: value.uint,
                      }),
                }),
              }),
          )
        : undefined,
      localStateDelta: signedTxnWithAD.applyData.evalDelta?.localDeltas
        ? Array.from(signedTxnWithAD.applyData.evalDelta?.localDeltas.entries()).map(([addressIndex, delta]) => {
            const addresses = [transaction.sender.toString(), ...(transaction.applicationCall?.accounts?.map((a) => a.toString()) || [])]
            return new algosdk.indexerModels.AccountStateDelta({
              address: addresses[Number(addressIndex)],
              delta: Array.from(delta.entries()).map(
                ([key, value]) =>
                  new algosdk.indexerModels.EvalDeltaKeyValue({
                    key: Buffer.from(key).toString('base64'),
                    value: new algosdk.indexerModels.EvalDelta({
                      action: value.action,
                      ...(value.action === 2
                        ? {
                            uint: value.uint,
                          }
                        : {
                            bytes: value.bytes ? Buffer.from(value.bytes).toString('base64') : undefined,
                            uint: value.uint,
                          }),
                    }),
                  }),
              ),
            })
          })
        : undefined,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(`Failed to transform transaction ${transactionId} from block ${roundNumber}`)
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

function getHashFromBlockCert(cert: UntypedValue | undefined): string | undefined {
  if (!cert) {
    return undefined
  }
  if (!(cert.data instanceof Map)) {
    return undefined
  }
  const prop = cert.data.get('prop')
  if (!(prop instanceof Map)) {
    return undefined
  }

  const dig = prop.get('dig')
  if (!(dig instanceof Uint8Array)) {
    return undefined
  }

  return Buffer.from(dig).toString('base64')
}

/**
 * Extract key metadata from a block.
 * @param blockResponse The block response from algod
 * @returns The block metadata
 */
export function blockResponseToBlockMetadata(blockResponse: algosdk.modelsv2.BlockResponse): BlockMetadata {
  const { block, cert } = blockResponse
  return {
    round: block.header.round,
    hash: getHashFromBlockCert(cert),
    timestamp: Number(block.header.timestamp),
    genesisId: block.header.genesisID,
    genesisHash: Buffer.from(block.header.genesisHash).toString('base64'),
    previousBlockHash: block.header.branch ? Buffer.from(block.header.branch).toString('base64') : undefined,
    seed: Buffer.from(block.header.seed).toString('base64'),
    parentTransactionCount: block.payset?.length ?? 0,
    fullTransactionCount: countAllTransactions(block.payset.map((s) => s.signedTxn) ?? []),
    rewards: {
      feeSink: block.header.rewardState.feeSink.toString(),
      rewardsPool: block.header.rewardState.rewardsPool.toString(),
      rewardsLevel: block.header.rewardState.rewardsLevel,
      rewardsResidue: block.header.rewardState.rewardsResidue,
      rewardsRate: block.header.rewardState.rewardsRate ?? 0n,
      rewardsCalculationRound: block.header.rewardState.rewardsRecalculationRound,
    },
    upgradeState: {
      currentProtocol: block.header.upgradeState.currentProtocol,
      nextProtocol: block.header.upgradeState.nextProtocol,
      nextProtocolApprovals: block.header.upgradeState.nextProtocolApprovals,
      nextProtocolSwitchOn: block.header.upgradeState.nextProtocolSwitchOn,
      nextProtocolVoteBefore: block.header.upgradeState.nextProtocolVoteBefore,
    },
    txnCounter: block.header.txnCounter ?? 0n,
    transactionsRoot: Buffer.from(block.header.txnCommitments.nativeSha512_256Commitment).toString('base64'),
    transactionsRootSha256: Buffer.from(block.header.txnCommitments.sha256Commitment).toString('base64'),
    proposer: block.header.proposer?.toString(),
    ...(block.header.upgradeVote
      ? {
          upgradeVote: {
            upgradeApprove: block.header.upgradeVote.upgradeApprove,
            upgradeDelay: block.header.upgradeVote.upgradeDelay,
            upgradePropose: block.header.upgradeVote.upgradePropose,
          },
        }
      : undefined),
    ...(block.header.participationUpdates
      ? {
          participationUpdates: {
            absentParticipationAccounts: block.header.participationUpdates.absentParticipationAccounts.map((addr) => addr.toString()),
            expiredParticipationAccounts: block.header.participationUpdates.expiredParticipationAccounts.map((addr) => addr.toString()),
          },
        }
      : undefined),
    stateProofTracking: block.header.stateproofTracking
      ? Array.from(block.header.stateproofTracking.entries()).map(([key, value]) => ({
          nextRound: value.stateProofNextRound,
          onlineTotalWeight: value.stateProofOnlineTotalWeight ?? 0n,
          type: Number(key),
          votersCommitment: Buffer.from(value.stateProofVotersCommitment).toString('base64'),
        }))
      : undefined,
  }
}

function countAllTransactions(txns: SignedTxnWithAD[]): number {
  return txns.reduce((sum, txn) => sum + 1 + countAllTransactions(txn.applyData.evalDelta?.innerTxns ?? []), 0)
}

/**
 * Extracts balance changes from a signed transaction with apply data.
 * @param signedTxnWithAD The signed transaction with apply data
 * @returns The balance changes
 */
export function extractBalanceChangesFromBlockTransaction(signedTxnWithAD: SignedTxnWithAD): BalanceChange[] {
  const balanceChanges: BalanceChange[] = []
  const transaction = signedTxnWithAD.signedTxn.txn

  if ((signedTxnWithAD.signedTxn.txn.fee ?? 0) > 0) {
    balanceChanges.push({
      address: transaction.sender.toString(),
      amount: -1n * (transaction.fee ?? 0n),
      roles: [BalanceChangeRole.Sender],
      assetId: 0n,
    })
  }

  if (transaction.type === TransactionType.pay) {
    balanceChanges.push(
      {
        address: transaction.sender.toString(),
        amount: -1n * (transaction.payment?.amount ?? 0n),
        roles: [BalanceChangeRole.Sender],
        assetId: 0n,
      },
      ...(transaction.payment?.receiver
        ? [
            {
              address: transaction.payment.receiver.toString(),
              amount: transaction.payment.amount,
              roles: [BalanceChangeRole.Receiver],
              assetId: 0n,
            },
          ]
        : []),
      ...(transaction.payment?.closeRemainderTo
        ? [
            {
              address: transaction.payment.closeRemainderTo.toString(),
              amount: signedTxnWithAD.applyData.closingAmount ?? 0n,
              roles: [BalanceChangeRole.CloseTo],
              assetId: 0n,
            },
            {
              address: transaction.sender.toString(),
              amount: -1n * (signedTxnWithAD.applyData.closingAmount ?? 0n),
              roles: [BalanceChangeRole.Sender],
              assetId: 0n,
            },
          ]
        : []),
    )
  }

  if (transaction.type === TransactionType.axfer && transaction.assetTransfer) {
    balanceChanges.push(
      {
        address: transaction.sender.toString(),
        assetId: transaction.assetTransfer!.assetIndex,
        amount: -1n * (transaction.assetTransfer!.amount ?? 0n),
        roles: [BalanceChangeRole.Sender],
      },
      ...(transaction.assetTransfer!.receiver
        ? [
            {
              address: transaction.assetTransfer!.receiver.toString(),
              assetId: transaction.assetTransfer!.assetIndex,
              amount: transaction.assetTransfer!.amount,
              roles: [BalanceChangeRole.Receiver],
            },
          ]
        : []),
      ...(transaction.assetTransfer!.closeRemainderTo
        ? [
            {
              address: transaction.assetTransfer!.closeRemainderTo.toString(),
              assetId: transaction.assetTransfer!.assetIndex,
              amount: signedTxnWithAD.applyData.assetClosingAmount ?? 0n,
              roles: [BalanceChangeRole.CloseTo],
            },
            {
              address: transaction.sender.toString(),
              assetId: transaction.assetTransfer!.assetIndex,
              amount: -1n * (signedTxnWithAD.applyData.assetClosingAmount ?? 0n),
              roles: [BalanceChangeRole.Sender],
            },
          ]
        : []),
    )
  }

  if (transaction.type === TransactionType.acfg) {
    if (!transaction.assetConfig?.assetIndex && signedTxnWithAD.applyData.configAsset) {
      // Handle balance changes related to the creation of an asset.
      balanceChanges.push({
        address: transaction.sender.toString(),
        assetId: signedTxnWithAD.applyData.configAsset,
        amount: transaction.assetConfig?.total ?? 0n,
        roles: [BalanceChangeRole.AssetCreator],
      })
    } else if (transaction.assetConfig?.assetIndex && !signedTxnWithAD.applyData.configAsset) {
      // Handle balance changes related to the destruction of an asset.
      balanceChanges.push({
        address: transaction.sender.toString(),
        assetId: transaction.assetConfig?.assetIndex,
        amount: 0n,
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
export function extractBalanceChangesFromIndexerTransaction(transaction: algosdk.indexerModels.Transaction): BalanceChange[] {
  const balanceChanges: BalanceChange[] = []

  if (transaction.fee > 0) {
    balanceChanges.push({
      address: transaction.sender,
      amount: -1n * transaction.fee,
      roles: [BalanceChangeRole.Sender],
      assetId: 0n,
    })
  }

  if (transaction.txType === TransactionType.pay && transaction.paymentTransaction) {
    const pay = transaction.paymentTransaction
    balanceChanges.push(
      {
        address: transaction.sender,
        amount: -1n * pay.amount,
        roles: [BalanceChangeRole.Sender],
        assetId: 0n,
      },
      {
        address: pay.receiver,
        amount: pay.amount,
        roles: [BalanceChangeRole.Receiver],
        assetId: 0n,
      },
      ...(pay.closeAmount
        ? [
            {
              address: pay.closeRemainderTo!,
              amount: pay.closeAmount,
              roles: [BalanceChangeRole.CloseTo],
              assetId: 0n,
            },
            {
              address: transaction.sender,
              amount: -1n * pay.closeAmount,
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
        amount: -1n * axfer.amount,
        roles: [BalanceChangeRole.Sender],
      },
      {
        address: axfer.receiver,
        assetId: axfer.assetId,
        amount: axfer.amount,
        roles: [BalanceChangeRole.Receiver],
      },
      ...(axfer.closeAmount && axfer.closeTo
        ? [
            {
              address: axfer.closeTo,
              assetId: axfer.assetId,
              amount: axfer.closeAmount,
              roles: [BalanceChangeRole.CloseTo],
            },
            {
              address: axfer.sender ?? transaction.sender,
              assetId: axfer.assetId,
              amount: -1n * axfer.closeAmount,
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
        amount: acfg.params?.total ?? 0n,
        roles: [BalanceChangeRole.AssetCreator],
      })
    } else if (acfg.assetId && !acfg['params']) {
      // Handle balance changes related to the destruction of an asset.
      balanceChanges.push({
        address: transaction.sender,
        assetId: acfg.assetId,
        amount: 0n,
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
    case 'hb':
      return TransactionType.hb
    default:
      throw new Error(`Unknown transaction type: ${type}`)
  }
}
