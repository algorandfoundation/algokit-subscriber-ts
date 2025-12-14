import { ALGORAND_ZERO_ADDRESS_STRING, decodeAddress } from '@algorandfoundation/algokit-utils'
import type { Block, BlockResponse, SignedTxnInBlock, SignedTxnWithAD } from '@algorandfoundation/algokit-utils/algod-client'
import { OnApplicationComplete, Transaction, TransactionType } from '@algorandfoundation/algokit-utils/transact'
import { ApplicationOnComplete } from '@algorandfoundation/algokit-utils/types/indexer'
import { Buffer } from 'buffer'
import type { TransactionInBlock } from './types/block'
import { BalanceChange, BalanceChangeRole, BlockMetadata, type SubscribedTransaction } from './types/subscription'

export const ALGORAND_ZERO_ADDRESS = ALGORAND_ZERO_ADDRESS_STRING
export const ALGORAND_ZERO_ADDRESS_BYTES = decodeAddress(ALGORAND_ZERO_ADDRESS).publicKey

/**
 * Gets the synthetic transaction for the block payout as defined in the indexer
 *
 * @see https://github.com/algorand/indexer/blob/084577338ad4882f5797b3e1b30b84718ad40333/idb/postgres/internal/writer/write_txn.go?plain=1#L180-L202
 */
export function getTransactionFromBlockPayout(block: BlockResponse, getRoundOffset: () => number): TransactionInBlock {
  const header = block.block.header
  const pay = new Transaction({
    type: TransactionType.Payment,
    sender: header.feeSink!,
    note: new Uint8Array(Buffer.from(`ProposerPayout for Round ${header.round}`)),
    firstValid: header.round!,
    lastValid: header.round!,
    genesisId: header.genesisId,
    genesisHash: header.genesisHash,
    fee: 0n,
    payment: {
      receiver: header.proposer!,
      amount: header.proposerPayout!,
    },
  })

  const txn: TransactionInBlock = {
    transactionId: pay.txId(),
    roundTimestamp: Number(header.timestamp),
    transaction: pay,
    intraRoundOffset: getRoundOffset(),
    roundNumber: header.round!,
    signedTxnWithAD: {
      signedTxn: { txn: pay },
      applyData: {},
    },
  }

  return txn
}

/**
 * Processes a block and returns all transactions from it, including inner transactions, with key information populated.
 * @param blockResponse An Algorand block
 * @returns An array of processed transactions from the block
 */
export function getBlockTransactions(blockResponse: BlockResponse): TransactionInBlock[] {
  const block = blockResponse.block

  let roundOffset = 0
  const getRoundOffset = () => roundOffset++

  const txns = (block.payset ?? []).flatMap((signedTransactionInBlock: SignedTxnInBlock) => {
    // Assume that Consensus.RequireGenesisHash is true, we always copy the genesis hash from the block to the transaction
    const genesisHash = block.header.genesisHash ? Buffer.from(block.header.genesisHash) : undefined
    const genesisId = signedTransactionInBlock.hasGenesisId ? block.header.genesisId : undefined

    const signedTxnWithAD: SignedTxnWithAD = {
      signedTxn: signedTransactionInBlock.signedTxn.signedTxn,
      applyData: signedTransactionInBlock.signedTxn.applyData,
    }

    const rootTransactionData = extractTransactionDataFromSignedTxnInBlock(signedTxnWithAD, genesisHash, genesisId)

    const rootTransaction = {
      signedTxnWithAD,
      transactionId: rootTransactionData.transaction.txId(),
      intraRoundOffset: getRoundOffset(),
      roundNumber: block.header.round!,
      roundTimestamp: Number(block.header.timestamp),
      genesisId: block.header.genesisId,
      genesisHash: genesisHash,
      ...rootTransactionData,
    } satisfies TransactionInBlock

    let parentOffset = 0
    const getParentOffset = () => parentOffset++

    return [
      rootTransaction,
      ...(signedTxnWithAD.applyData?.evalDelta?.innerTxns ?? []).flatMap((innerTransaction: SignedTxnInBlock) =>
        getBlockInnerTransactions(innerTransaction, block, rootTransaction, getRoundOffset, getParentOffset, genesisHash),
      ),
    ]
  })

  if (block.header.proposerPayout && block.header.proposerPayout > 0n) {
    txns.push(getTransactionFromBlockPayout(blockResponse, getRoundOffset))
  }

  return txns
}

function getBlockInnerTransactions(
  signedTxnInBlock: SignedTxnInBlock,
  block: Block,
  rootTransaction: TransactionInBlock,
  getRoundOffset: () => number,
  getParentOffset: () => number,
  genesisHash?: Buffer,
): TransactionInBlock[] {
  const signedTxnWithAD: SignedTxnWithAD = {
    signedTxn: signedTxnInBlock.signedTxn.signedTxn,
    applyData: signedTxnInBlock.signedTxn.applyData,
  }
  const transactionData = extractTransactionDataFromSignedTxnInBlock(signedTxnWithAD, genesisHash)
  const offset = getParentOffset() + 1
  const transactionId = `${rootTransaction.transactionId}/inner/${offset}`

  const transaction = {
    signedTxnWithAD,
    roundNumber: block.header.round!,
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
    ...(signedTxnWithAD.applyData?.evalDelta?.innerTxns ?? []).flatMap((innerInnerTransaction: SignedTxnInBlock) =>
      getBlockInnerTransactions(innerInnerTransaction, block, rootTransaction, getRoundOffset, getParentOffset, genesisHash),
    ),
  ]
}

/**
 * Transform a signed transaction with apply data into a `Transaction` object and other key transaction data.
 *
 * @param signedTxnWithAD The signed transaction with apply data from a block
 * @returns The `Transaction` object along with key secondary information from the block.
 */
function extractTransactionDataFromSignedTxnInBlock(
  signedTxnWithAD: SignedTxnWithAD,
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
  // Get the transaction from the signed transaction
  const txn = signedTxnWithAD.signedTxn.txn

  // Normalise the transaction so that the transaction ID is generated correctly
  const transaction = new Transaction({
    ...txn,
    genesisHash: genesisHash ?? txn.genesisHash,
    genesisId: genesisId ?? txn.genesisId,
  })

  return {
    transaction,
    createdAssetId: signedTxnWithAD.applyData?.configAsset,
    createdAppId: signedTxnWithAD.applyData?.applicationId,
    assetCloseAmount: signedTxnWithAD.applyData?.assetClosingAmount,
    closeAmount: signedTxnWithAD.applyData?.closingAmount,
    logs: signedTxnWithAD.applyData?.evalDelta?.logs,
  } satisfies Partial<TransactionInBlock>
}

/**
 * Transforms `Transaction` app on-complete enum to the equivalent indexer on-complete enum.
 * @param appOnComplete The `OnApplicationComplete` value
 * @returns The equivalent `ApplicationOnComplete` value
 */
export function algodOnCompleteToIndexerOnComplete(appOnComplete?: OnApplicationComplete): ApplicationOnComplete {
  return appOnComplete === OnApplicationComplete.NoOp
    ? ApplicationOnComplete.noop
    : appOnComplete === OnApplicationComplete.OptIn
      ? ApplicationOnComplete.optin
      : appOnComplete === OnApplicationComplete.CloseOut
        ? ApplicationOnComplete.closeout
        : appOnComplete === OnApplicationComplete.ClearState
          ? ApplicationOnComplete.clear
          : appOnComplete === OnApplicationComplete.UpdateApplication
            ? ApplicationOnComplete.update
            : appOnComplete === OnApplicationComplete.DeleteApplication
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
    throw new Error(`Received no transaction type for transaction ${transaction.txId()}`)
  }

  let parentOffset = 1
  const getParentOffset = () => parentOffset++

  try {
    // https://github.com/algorand/indexer/blob/main/api/converter_utils.go#L249

    const result: SubscribedTransaction = {
      id: transactionId,
      parentTransactionId,
      parentIntraRoundOffset,
      filtersMatched: filterName ? [filterName] : undefined,
      ...(transaction.type === TransactionType.AssetConfig && transaction.assetConfig
        ? {
            assetConfigTransaction: {
              assetId: transaction.assetConfig.assetId,
              params: createdAssetId
                ? {
                    creator: transaction.sender.toString(),
                    decimals: transaction.assetConfig.decimals ?? 0,
                    total: transaction.assetConfig.total ?? 0n,
                    defaultFrozen: transaction.assetConfig.defaultFrozen,
                    metadataHash: transaction.assetConfig.metadataHash,
                    ...(transaction.assetConfig.unitName
                      ? {
                          unitName: transaction.assetConfig.unitName,
                          unitNameB64: new Uint8Array(Buffer.from(transaction.assetConfig.unitName)),
                        }
                      : undefined),
                    ...(transaction.assetConfig.assetName
                      ? {
                          name: transaction.assetConfig.assetName,
                          nameB64: new Uint8Array(Buffer.from(transaction.assetConfig.assetName)),
                        }
                      : undefined),
                    ...(transaction.assetConfig.url
                      ? {
                          url: transaction.assetConfig.url,
                          urlB64: new Uint8Array(Buffer.from(transaction.assetConfig.url)),
                        }
                      : undefined),
                    manager: transaction.assetConfig.manager?.toString(),
                    reserve: transaction.assetConfig.reserve?.toString(),
                    clawback: transaction.assetConfig.clawback?.toString(),
                    freeze: transaction.assetConfig.freeze?.toString(),
                  }
                : // In algosdk, transaction.assetConfig is always defined, even if it's an asset destroy transaction
                  // If any field is truthy, it's an asset update, otherwise, it's an asset destroy
                  transaction.assetConfig.manager ||
                    transaction.assetConfig.reserve ||
                    transaction.assetConfig.clawback ||
                    transaction.assetConfig.freeze ||
                    transaction.assetConfig.unitName ||
                    transaction.assetConfig.assetName ||
                    transaction.assetConfig.url ||
                    transaction.assetConfig.metadataHash
                  ? {
                      manager: transaction.assetConfig.manager?.toString(),
                      reserve: transaction.assetConfig.reserve?.toString(),
                      clawback: transaction.assetConfig.clawback?.toString(),
                      freeze: transaction.assetConfig.freeze?.toString(),
                      // These parameters are required in the indexer type so setting to empty values
                      creator: '',
                      decimals: 0,
                      total: 0n,
                    }
                  : undefined,
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.AssetTransfer
        ? {
            assetTransferTransaction: {
              assetId: transaction.assetTransfer!.assetId,
              amount: transaction.assetTransfer!.amount,
              receiver: transaction.assetTransfer!.receiver.toString(),
              sender: transaction.assetTransfer!.assetSender ? transaction.assetTransfer!.assetSender.toString() : undefined,
              closeAmount: assetCloseAmount,
              closeTo: transaction.assetTransfer!.closeRemainderTo ? transaction.assetTransfer!.closeRemainderTo.toString() : undefined,
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.AssetFreeze
        ? {
            assetFreezeTransaction: {
              assetId: transaction.assetFreeze!.assetId,
              newFreezeStatus: transaction.assetFreeze!.frozen,
              address: transaction.assetFreeze!.freezeTarget.toString(),
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.AppCall
        ? {
            applicationTransaction: {
              applicationId: transaction.appCall!.appId ?? 0n,
              approvalProgram: transaction.appCall!.approvalProgram,
              clearStateProgram: transaction.appCall!.clearStateProgram,
              onCompletion: algodOnCompleteToIndexerOnComplete(transaction.appCall!.onComplete),
              applicationArgs: transaction.appCall!.args,
              foreignApps: transaction.appCall!.appReferences?.map((a: bigint) => a),
              foreignAssets: transaction.appCall!.assetReferences?.map((a: bigint) => a),
              ...(transaction.appCall?.globalStateSchema
                ? {
                    globalStateSchema: {
                      numByteSlice: transaction.appCall.globalStateSchema.numByteSlices,
                      numUint: transaction.appCall.globalStateSchema.numUints,
                    },
                  }
                : undefined),
              ...(transaction.appCall?.localStateSchema
                ? {
                    localStateSchema: {
                      numByteSlice: transaction.appCall.localStateSchema.numByteSlices,
                      numUint: transaction.appCall.localStateSchema.numUints,
                    },
                  }
                : undefined),
              accounts: transaction.appCall!.accountReferences,
              extraProgramPages: transaction.appCall!.extraProgramPages,
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.Payment
        ? {
            paymentTransaction: {
              amount: transaction.payment!.amount,
              receiver: transaction.payment!.receiver.toString(),
              closeAmount: closeAmount,
              closeRemainderTo: transaction.payment!.closeRemainderTo?.toString(),
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.KeyRegistration
        ? {
            keyregTransaction: {
              nonParticipation: transaction.keyRegistration!.nonParticipation,
              selectionParticipationKey: transaction.keyRegistration!.selectionKey,
              stateProofKey: transaction.keyRegistration!.stateProofKey,
              voteFirstValid: transaction.keyRegistration!.voteFirst,
              voteKeyDilution: transaction.keyRegistration!.voteKeyDilution,
              voteLastValid: transaction.keyRegistration!.voteLast,
              voteParticipationKey: transaction.keyRegistration!.voteKey,
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.StateProof
        ? {
            stateProofTransaction: {
              stateProof: transaction.stateProof!.stateProof
                ? {
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
                          return {
                            sigSlot: {
                              lowerSigWeight: reveal.sigslot.lowerSigWeight,
                              signature: {
                                merkleArrayIndex: Number(reveal.sigslot.sig.vectorCommitmentIndex),
                                falconSignature: Buffer.from(reveal.sigslot.sig.signature),
                                proof: algodMerkleArrayProofToIndexerMerkleArrayProof(reveal.sigslot.sig.proof),
                                verifyingKey: reveal.sigslot.sig.verifyingKey.publicKey,
                              },
                            },
                            position: position,
                            participant: {
                              weight: reveal.participant.weight,
                              verifier: {
                                keyLifetime: reveal.participant.verifier.keyLifetime,
                                commitment: reveal.participant.verifier.commitment,
                              },
                            },
                          }
                        })
                      : undefined,
                  }
                : undefined,
              message: transaction.stateProof!.message
                ? {
                    blockHeadersCommitment: Buffer.from(transaction.stateProof!.message!.blockHeadersCommitment),
                    firstAttestedRound: transaction.stateProof!.message!.firstAttestedRound,
                    latestAttestedRound: transaction.stateProof!.message!.lastAttestedRound,
                    lnProvenWeight: transaction.stateProof!.message!.lnProvenWeight,
                    votersCommitment: Buffer.from(transaction.stateProof!.message!.votersCommitment),
                  }
                : undefined,
              stateProofType: BigInt(transaction.stateProof!.stateProofType ?? 0),
            },
          }
        : undefined),
      ...(transaction.type === TransactionType.Heartbeat && transaction.heartbeat
        ? {
            heartbeatTransaction: {
              hbAddress: transaction.heartbeat.address.toString(),
              hbKeyDilution: transaction.heartbeat.keyDilution,
              hbProof: {
                hbPk: transaction.heartbeat.proof.pk,
                hbPk1sig: transaction.heartbeat.proof.pk1Sig,
                hbPk2: transaction.heartbeat.proof.pk2,
                hbPk2sig: transaction.heartbeat.proof.pk2Sig,
                hbSig: transaction.heartbeat.proof.sig,
              },
              hbSeed: transaction.heartbeat.seed,
              hbVoteId: transaction.heartbeat.voteId,
            },
          }
        : undefined),
      firstValid: Number(transaction.firstValid),
      lastValid: Number(transaction.lastValid),
      txType: transactionTypeToIndexerTxType(transaction.type),
      fee: transaction.fee ?? 0n,
      sender: transaction.sender.toString(),
      confirmedRound: roundNumber,
      roundTime: Number(roundTimestamp),
      intraRoundOffset: intraRoundOffset,
      createdAssetId: createdAssetId,
      genesisHash: transaction.genesisHash,
      genesisId: transaction.genesisId,
      group: transaction.group,
      note: transaction.note,
      lease: transaction.lease,
      rekeyTo: transaction.rekeyTo,
      closingAmount: closeAmount,
      createdAppId: createdAppId,
      authAddr: signedTxnWithAD.signedTxn.authAddress,
      innerTxns: signedTxnWithAD.applyData?.evalDelta?.innerTxns?.map((innerTxn: SignedTxnInBlock) => {
        const offset = getParentOffset()
        const childIntraRoundOffset = intraRoundOffset + offset
        const innerTransactionId = `${parentTransactionId}/inner/${childIntraRoundOffset - (parentIntraRoundOffset ?? intraRoundOffset)}`

        const innerSignedTxnWithAD: SignedTxnWithAD = {
          signedTxn: innerTxn.signedTxn.signedTxn,
          applyData: innerTxn.signedTxn.applyData,
        }

        return getIndexerTransactionFromAlgodTransaction({
          signedTxnWithAD: innerSignedTxnWithAD,
          intraRoundOffset: childIntraRoundOffset,
          ...extractTransactionDataFromSignedTxnInBlock(innerSignedTxnWithAD, genesisHash, genesisId),
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
            signature: {
              sig: signedTxnWithAD.signedTxn.sig,
              logicsig: signedTxnWithAD.signedTxn.lsig
                ? {
                    logic: signedTxnWithAD.signedTxn.lsig.logic,
                    args: signedTxnWithAD.signedTxn.lsig.args,
                    signature: signedTxnWithAD.signedTxn.lsig.sig,
                    multisigSignature: signedTxnWithAD.signedTxn.lsig.msig
                      ? {
                          version: signedTxnWithAD.signedTxn.lsig.msig.version,
                          threshold: signedTxnWithAD.signedTxn.lsig.msig.threshold,
                          subsignature: signedTxnWithAD.signedTxn.lsig.msig.subsignatures.map((s) => ({
                            publicKey: s.publicKey,
                            signature: s.signature,
                          })),
                        }
                      : undefined,
                  }
                : undefined,
              multisig: signedTxnWithAD.signedTxn.msig
                ? {
                    version: signedTxnWithAD.signedTxn.msig.version,
                    threshold: signedTxnWithAD.signedTxn.msig.threshold,
                    subsignature: signedTxnWithAD.signedTxn.msig.subsignatures.map((s) => ({
                      publicKey: s.publicKey,
                      signature: s.signature,
                    })),
                  }
                : undefined,
            },
          }
        : undefined),
      logs: signedTxnWithAD.applyData?.evalDelta?.logs,
      closeRewards: closeRewards,
      receiverRewards: receiverRewards,
      senderRewards: senderRewards,
      globalStateDelta: signedTxnWithAD.applyData?.evalDelta?.globalDelta
        ? Array.from(signedTxnWithAD.applyData.evalDelta.globalDelta.entries()).map(([key, value]) => ({
            key: Buffer.from(key).toString('base64'),
            value: {
              action: value.action,
              ...(value.action === 2
                ? {
                    uint: value.uint,
                  }
                : {
                    bytes: value.bytes ? Buffer.from(value.bytes).toString('base64') : undefined,
                    uint: value.uint,
                  }),
            },
          }))
        : undefined,
      localStateDelta: signedTxnWithAD.applyData?.evalDelta?.localDeltas
        ? Array.from(signedTxnWithAD.applyData.evalDelta.localDeltas.entries()).map(([addressIndex, delta]) => {
            const addresses = [transaction.sender.toString(), ...(transaction.appCall?.accountReferences?.map((a) => a.toString()) || [])]
            return {
              address: addresses[Number(addressIndex)],
              delta: Array.from(delta.entries()).map(([key, value]) => ({
                key: Buffer.from(key).toString('base64'),
                value: {
                  action: value.action,
                  ...(value.action === 2
                    ? {
                        uint: value.uint,
                      }
                    : {
                        bytes: value.bytes ? Buffer.from(value.bytes).toString('base64') : undefined,
                        uint: value.uint,
                      }),
                },
              })),
            }
          })
        : undefined,
    }

    return result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(`Failed to transform transaction ${transactionId} from block ${roundNumber}`)
    throw e
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function algodMerkleArrayProofToIndexerMerkleArrayProof(proof: any): any {
  return {
    hashFactory: proof.hashFactory
      ? {
          hashType: proof.hashFactory.hashType,
        }
      : undefined,
    path: proof.path,
    treeDepth: proof.treeDepth,
  }
}

function getHashFromBlockCert(cert: unknown | undefined): string | undefined {
  if (!cert) {
    return undefined
  }
  if (!(cert instanceof Map) && typeof cert !== 'object') {
    return undefined
  }
  const certData = cert instanceof Map ? cert : (cert as Record<string, unknown>)
  const prop = certData instanceof Map ? certData.get('prop') : (certData as Record<string, unknown>)['prop']
  if (!prop || (!(prop instanceof Map) && typeof prop !== 'object')) {
    return undefined
  }

  const propData = prop instanceof Map ? prop : (prop as Record<string, unknown>)
  const dig = propData instanceof Map ? propData.get('dig') : (propData as Record<string, unknown>)['dig']
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
export function blockResponseToBlockMetadata(blockResponse: BlockResponse): BlockMetadata {
  const { block, cert } = blockResponse
  const header = block.header
  return {
    round: header.round!,
    hash: getHashFromBlockCert(cert),
    timestamp: Number(header.timestamp),
    genesisId: header.genesisId!,
    genesisHash: header.genesisHash ? Buffer.from(header.genesisHash).toString('base64') : '',
    previousBlockHash: header.previousBlockHash ? Buffer.from(header.previousBlockHash).toString('base64') : undefined,
    seed: header.seed ? Buffer.from(header.seed).toString('base64') : '',
    parentTransactionCount: block.payset?.length ?? 0,
    fullTransactionCount: countAllTransactions(block.payset ?? []),
    rewards: {
      feeSink: header.feeSink?.toString() ?? '',
      rewardsPool: header.rewardsPool?.toString() ?? '',
      rewardsLevel: header.rewardsLevel ?? 0n,
      rewardsResidue: header.rewardsResidue ?? 0n,
      rewardsRate: header.rewardsRate ?? 0n,
      rewardsCalculationRound: header.rewardsRecalculationRound ?? 0n,
    },
    upgradeState: {
      currentProtocol: header.currentProtocol ?? '',
      nextProtocol: header.nextProtocol,
      nextProtocolApprovals: header.nextProtocolApprovals,
      nextProtocolSwitchOn: header.nextProtocolSwitchOn,
      nextProtocolVoteBefore: header.nextProtocolVoteBefore,
    },
    txnCounter: header.txnCounter ?? 0n,
    transactionsRoot: header.transactionsRoot ? Buffer.from(header.transactionsRoot).toString('base64') : '',
    transactionsRootSha256: header.transactionsRootSha256 ? Buffer.from(header.transactionsRootSha256).toString('base64') : '',
    proposer: header.proposer?.toString(),
    ...(header.upgradeApprove !== undefined || header.upgradeDelay !== undefined || header.upgradePropose !== undefined
      ? {
          upgradeVote: {
            upgradeApprove: header.upgradeApprove,
            upgradeDelay: header.upgradeDelay,
            upgradePropose: header.upgradePropose,
          },
        }
      : undefined),
    ...(header.participationUpdates
      ? {
          participationUpdates: {
            absentParticipationAccounts: header.participationUpdates.absentParticipationAccounts?.map((addr: string) => addr) ?? [],
            expiredParticipationAccounts: header.participationUpdates.expiredParticipationAccounts?.map((addr: string) => addr) ?? [],
          },
        }
      : undefined),
    stateProofTracking: header.stateProofTracking
      ? Array.from(header.stateProofTracking.entries()).map(([key, value]) => ({
          nextRound: value.stateProofNextRound,
          onlineTotalWeight: value.stateProofOnlineTotalWeight ?? 0n,
          type: Number(key),
          votersCommitment: value.stateProofVotersCommitment ? Buffer.from(value.stateProofVotersCommitment).toString('base64') : '',
        }))
      : undefined,
  }
}

function countAllTransactions(txns: SignedTxnInBlock[]): number {
  return txns.reduce((sum, txn) => {
    const innerTxns = txn.signedTxn.applyData?.evalDelta?.innerTxns ?? []
    return sum + 1 + countAllTransactions(innerTxns)
  }, 0)
}

/**
 * Extracts balance changes from a signed transaction with apply data.
 * @param signedTxnWithAD The signed transaction with apply data
 * @returns The balance changes
 */
export function extractBalanceChangesFromBlockTransaction(signedTxnWithAD: SignedTxnWithAD): BalanceChange[] {
  const balanceChanges: BalanceChange[] = []
  const transaction = signedTxnWithAD.signedTxn.txn

  if ((transaction.fee ?? 0n) > 0n) {
    balanceChanges.push({
      address: transaction.sender.toString(),
      amount: -1n * (transaction.fee ?? 0n),
      roles: [BalanceChangeRole.Sender],
      assetId: 0n,
    })
  }

  if (transaction.type === TransactionType.Payment) {
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
              amount: signedTxnWithAD.applyData?.closingAmount ?? 0n,
              roles: [BalanceChangeRole.CloseTo],
              assetId: 0n,
            },
            {
              address: transaction.sender.toString(),
              amount: -1n * (signedTxnWithAD.applyData?.closingAmount ?? 0n),
              roles: [BalanceChangeRole.Sender],
              assetId: 0n,
            },
          ]
        : []),
    )
  }

  if (transaction.type === TransactionType.AssetTransfer && transaction.assetTransfer) {
    balanceChanges.push(
      {
        address: transaction.sender.toString(),
        assetId: transaction.assetTransfer!.assetId,
        amount: -1n * (transaction.assetTransfer!.amount ?? 0n),
        roles: [BalanceChangeRole.Sender],
      },
      ...(transaction.assetTransfer!.receiver
        ? [
            {
              address: transaction.assetTransfer!.receiver.toString(),
              assetId: transaction.assetTransfer!.assetId,
              amount: transaction.assetTransfer!.amount,
              roles: [BalanceChangeRole.Receiver],
            },
          ]
        : []),
      ...(transaction.assetTransfer!.closeRemainderTo
        ? [
            {
              address: transaction.assetTransfer!.closeRemainderTo.toString(),
              assetId: transaction.assetTransfer!.assetId,
              amount: signedTxnWithAD.applyData?.assetClosingAmount ?? 0n,
              roles: [BalanceChangeRole.CloseTo],
            },
            {
              address: transaction.sender.toString(),
              assetId: transaction.assetTransfer!.assetId,
              amount: -1n * (signedTxnWithAD.applyData?.assetClosingAmount ?? 0n),
              roles: [BalanceChangeRole.Sender],
            },
          ]
        : []),
    )
  }

  if (transaction.type === TransactionType.AssetConfig) {
    if (!transaction.assetConfig?.assetId && signedTxnWithAD.applyData?.configAsset) {
      // Handle balance changes related to the creation of an asset.
      balanceChanges.push({
        address: transaction.sender.toString(),
        assetId: signedTxnWithAD.applyData.configAsset,
        amount: transaction.assetConfig?.total ?? 0n,
        roles: [BalanceChangeRole.AssetCreator],
      })
    } else if (transaction.assetConfig?.assetId && !signedTxnWithAD.applyData?.configAsset) {
      // Handle balance changes related to the destruction of an asset.
      balanceChanges.push({
        address: transaction.sender.toString(),
        assetId: transaction.assetConfig?.assetId,
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
export function extractBalanceChangesFromIndexerTransaction(transaction: SubscribedTransaction): BalanceChange[] {
  const balanceChanges: BalanceChange[] = []

  if (transaction.fee > 0n) {
    balanceChanges.push({
      address: transaction.sender,
      amount: -1n * transaction.fee,
      roles: [BalanceChangeRole.Sender],
      assetId: 0n,
    })
  }

  if (transaction.txType === 'pay' && transaction.paymentTransaction) {
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

  if (transaction.txType === 'axfer' && transaction.assetTransferTransaction) {
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

  if (transaction.txType === 'acfg' && transaction.assetConfigTransaction) {
    const acfg = transaction.assetConfigTransaction
    if (!transaction.assetConfigTransaction.assetId && transaction.createdAssetId) {
      // Handle balance changes related to the creation of an asset.
      balanceChanges.push({
        address: transaction.sender,
        assetId: transaction.createdAssetId,
        amount: acfg.params?.total ?? 0n,
        roles: [BalanceChangeRole.AssetCreator],
      })
    } else if (acfg.assetId && !acfg.params) {
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
      return TransactionType.Payment
    case 'keyreg':
      return TransactionType.KeyRegistration
    case 'acfg':
      return TransactionType.AssetConfig
    case 'axfer':
      return TransactionType.AssetTransfer
    case 'afrz':
      return TransactionType.AssetFreeze
    case 'appl':
      return TransactionType.AppCall
    case 'stpf':
      return TransactionType.StateProof
    case 'hb':
      return TransactionType.Heartbeat
    default:
      throw new Error(`Unknown transaction type: ${type}`)
  }
}

function transactionTypeToIndexerTxType(type: TransactionType): 'pay' | 'keyreg' | 'acfg' | 'axfer' | 'afrz' | 'appl' | 'stpf' | 'hb' {
  switch (type) {
    case TransactionType.Payment:
      return 'pay'
    case TransactionType.KeyRegistration:
      return 'keyreg'
    case TransactionType.AssetConfig:
      return 'acfg'
    case TransactionType.AssetTransfer:
      return 'axfer'
    case TransactionType.AssetFreeze:
      return 'afrz'
    case TransactionType.AppCall:
      return 'appl'
    case TransactionType.StateProof:
      return 'stpf'
    case TransactionType.Heartbeat:
      return 'hb'
    default:
      throw new Error(`Unknown transaction type: ${type}`)
  }
}
