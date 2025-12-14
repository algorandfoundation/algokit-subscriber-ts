import { Config, indexer } from '@algorandfoundation/algokit-utils'
import type { AlgodClient } from '@algorandfoundation/algokit-utils/algod-client'
import type { IndexerClient, Transaction as IndexerTransaction } from '@algorandfoundation/algokit-utils/indexer-client'
import { ABITupleType, type ABIValue } from '@algorandfoundation/algokit-utils/abi'
import { TransactionType, OnApplicationComplete } from '@algorandfoundation/algokit-utils/transact'
import { Buffer } from 'buffer'
import sha512, { sha512_256 } from 'js-sha512'
import { getBlocksBulk } from './block'
import {
  algodOnCompleteToIndexerOnComplete,
  blockResponseToBlockMetadata,
  extractBalanceChangesFromBlockTransaction,
  extractBalanceChangesFromIndexerTransaction,
  getBlockTransactions,
  getIndexerTransactionFromAlgodTransaction,
  getTransactionType,
} from './transform'
import type { Arc28EventGroup, Arc28EventToProcess, EmittedArc28Event } from './types/arc-28'
import type { TransactionInBlock } from './types/block'
import {
  BlockMetadata,
  type SubscribedTransaction,
  type BalanceChange,
  type NamedTransactionFilter,
  type TransactionFilter,
  type TransactionSubscriptionParams,
  type TransactionSubscriptionResult,
} from './types/subscription'
import { chunkArray } from './utils'

type SearchForTransactionsCriteria = Parameters<typeof indexer.searchTransactions>[1]

const deduplicateSubscribedTransactionsReducer = (dedupedTransactions: SubscribedTransaction[], t: SubscribedTransaction) => {
  const existing = dedupedTransactions.find((e) => e.id === t.id)
  if (existing) {
    // Concat new filters to existing filters
    existing.filtersMatched = (existing.filtersMatched ?? []).concat(t.filtersMatched ?? []).filter((value, index, self) => {
      // Remove duplicates
      return self.indexOf(value) === index
    })
  } else {
    dedupedTransactions.push(t)
  }
  return dedupedTransactions
}

/**
 * Executes a single pull/poll to subscribe to transactions on the configured Algorand
 * blockchain for the given subscription context.
 * @param subscription The subscription context.
 * @param algod An Algod client.
 * @param indexer An optional indexer client, only needed when `onMaxRounds` is `catchup-with-indexer`.
 * @returns The result of this subscription pull/poll.
 */
export async function getSubscribedTransactions(
  subscription: TransactionSubscriptionParams,
  algod: AlgodClient,
  indexerClient?: IndexerClient,
): Promise<TransactionSubscriptionResult> {
  const { watermark, filters, maxRoundsToSync: _maxRoundsToSync, syncBehaviour: onMaxRounds, currentRound: _currentRound } = subscription
  const maxRoundsToSync = _maxRoundsToSync ?? 500
  const currentRound = _currentRound ?? (await algod.getStatus()).lastRound
  let blockMetadata: BlockMetadata[] | undefined

  // Pre-calculate a flat list of all ARC-28 events to process
  const arc28Events = (subscription.arc28Events ?? []).flatMap((g) =>
    g.events.map((e) => {
      // https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0028.md#sample-interpretation-of-event-log-data
      const eventSignature = `${e.name}(${e.args.map((a) => a.type).join(',')})`
      const eventHash = sha512_256(eventSignature)
      const eventPrefix = eventHash.slice(0, 8)

      return {
        groupName: g.groupName,
        eventName: e.name,
        eventSignature,
        eventPrefix,
        eventDefinition: e,
      } satisfies Arc28EventToProcess
    }),
  )

  // Nothing to sync we at the tip of the chain already
  if (currentRound <= watermark) {
    return {
      currentRound: currentRound,
      startingWatermark: watermark,
      newWatermark: watermark,
      subscribedTransactions: [],
      syncedRoundRange: [currentRound, currentRound],
    }
  }

  let indexerSyncToRoundNumber = 0n
  let algodSyncFromRoundNumber = watermark + 1n
  let startRound = algodSyncFromRoundNumber
  let endRound = currentRound
  let catchupTransactions: SubscribedTransaction[] = []
  let start = +new Date()
  let skipAlgodSync = false

  // If we are less than `maxRoundsToSync` from the tip of the chain then we consult the `syncBehaviour` to determine what to do
  if (currentRound - watermark > maxRoundsToSync) {
    switch (onMaxRounds) {
      case 'fail':
        throw new Error(`Invalid round number to subscribe from ${algodSyncFromRoundNumber}; current round number is ${currentRound}`)
      case 'skip-sync-newest':
        algodSyncFromRoundNumber = currentRound - BigInt(maxRoundsToSync) + 1n
        startRound = algodSyncFromRoundNumber
        break
      case 'sync-oldest':
        endRound = algodSyncFromRoundNumber + BigInt(maxRoundsToSync) - 1n
        break
      case 'sync-oldest-start-now':
        // When watermark is 0 same behaviour as skip-sync-newest
        if (watermark === 0n) {
          algodSyncFromRoundNumber = currentRound - BigInt(maxRoundsToSync) + 1n
          startRound = algodSyncFromRoundNumber
        } else {
          // Otherwise same behaviour as sync-oldest
          endRound = algodSyncFromRoundNumber + BigInt(maxRoundsToSync) - 1n
        }
        break
      case 'catchup-with-indexer':
        if (!indexerClient) {
          throw new Error("Can't catch up using indexer since it's not provided")
        }

        // If we have more than `maxIndexerRoundsToSync` rounds to sync from indexer then we skip algod sync and just sync that many rounds from indexer
        indexerSyncToRoundNumber = currentRound - BigInt(maxRoundsToSync)
        if (subscription.maxIndexerRoundsToSync && indexerSyncToRoundNumber - startRound + 1n > subscription.maxIndexerRoundsToSync) {
          indexerSyncToRoundNumber = startRound + BigInt(subscription.maxIndexerRoundsToSync) - 1n
          endRound = indexerSyncToRoundNumber
          skipAlgodSync = true
        } else {
          algodSyncFromRoundNumber = indexerSyncToRoundNumber + 1n
        }

        Config.logger.debug(
          `Catching up from round ${startRound} to round ${indexerSyncToRoundNumber} via indexer; this may take a few seconds`,
        )

        // Retrieve and process transactions from indexer in groups of 30 so we don't get rate limited
        for (const chunkedFilters of chunkArray(filters, 30)) {
          catchupTransactions = catchupTransactions.concat(
            (
              await Promise.all(
                // For each filter
                chunkedFilters.map(async (f) =>
                  // Retrieve all pre-filtered transactions from the indexer
                  (await indexer.searchTransactions(indexerClient, indexerPreFilter(f.filter, startRound, indexerSyncToRoundNumber))).transactions
                    // Re-run the pre-filter in-memory so we properly extract inner transactions
                    .flatMap((t) => getFilteredIndexerTransactions(t, f))
                    // Run the post-filter so we get the final list of matching transactions
                    .filter(indexerPostFilter(f.filter, arc28Events, subscription.arc28Events ?? [])),
                ),
              )
            )
              // Collapse the filtered transactions into a single array
              .flat(),
          )
        }

        catchupTransactions = catchupTransactions
          // Sort by transaction order
          .sort((a, b) => Number(a.confirmedRound! - b.confirmedRound!) || a.intraRoundOffset! - b.intraRoundOffset!)
          // Collapse duplicate transactions
          .reduce(deduplicateSubscribedTransactionsReducer, [] as SubscribedTransaction[])

        Config.logger.debug(
          `Retrieved ${catchupTransactions.length} transactions from round ${startRound} to round ${
            algodSyncFromRoundNumber - 1n
          } via indexer in ${(+new Date() - start) / 1000}s`,
        )

        break
      default:
        throw new Error('Not implemented')
    }
  }

  // Retrieve and process blocks from algod
  let algodTransactions: SubscribedTransaction[] = []
  if (!skipAlgodSync) {
    start = +new Date()
    const blocks = await getBlocksBulk({ startRound: algodSyncFromRoundNumber, maxRound: endRound }, algod)
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b))
    algodTransactions = filters
      .flatMap((f) =>
        blockTransactions
          .filter((t) => transactionFilter(f.filter, arc28Events, subscription.arc28Events ?? [])(t!))
          .map((t) => getIndexerTransactionFromAlgodTransaction(t, f.name)),
      )
      .reduce(deduplicateSubscribedTransactionsReducer, [])

    blockMetadata = blocks.map((b) => blockResponseToBlockMetadata(b))

    Config.logger.debug(
      `Retrieved ${blockTransactions.length} transactions from algod via round(s) ${algodSyncFromRoundNumber}-${endRound} in ${
        (+new Date() - start) / 1000
      }s`,
    )
  } else {
    Config.logger.debug(`Skipping algod sync since we have more than ${subscription.maxIndexerRoundsToSync} rounds to sync from indexer.`)
  }

  return {
    syncedRoundRange: [startRound, endRound],
    startingWatermark: watermark,
    newWatermark: endRound,
    currentRound,
    blockMetadata,
    subscribedTransactions: catchupTransactions
      .concat(algodTransactions)
      .map((t) => processExtraFields(t, arc28Events, subscription.arc28Events ?? [])),
  }
}

function transactionIsInArc28EventGroup(group: Arc28EventGroup, appId: bigint, transaction: () => SubscribedTransaction) {
  return (
    (!group.processForAppIds || group.processForAppIds.includes(appId)) &&
    // Lazily evaluate transaction so it's only evaluated if needed since creating the transaction object may be expensive if from algod
    (!group.processTransaction || group.processTransaction(transaction()))
  )
}

function processExtraFields(
  transaction: SubscribedTransaction,
  arc28Events: Arc28EventToProcess[],
  arc28Groups: Arc28EventGroup[],
): SubscribedTransaction {
  const groupsToApply =
    transaction.txType !== 'appl'
      ? []
      : arc28Groups.filter((g) =>
          transactionIsInArc28EventGroup(
            g,
            transaction.createdAssetId ?? transaction.applicationTransaction?.applicationId ?? 0n,
            () => transaction,
          ),
        )
  const eventsToApply = groupsToApply.length > 0 ? arc28Events.filter((e) => groupsToApply.some((g) => g.groupName === e.groupName)) : []
  return {
    ...transaction,
    arc28Events: extractArc28Events(
      transaction.id,
      transaction.logs ?? [],
      eventsToApply,
      (groupName) => groupsToApply.find((g) => g.groupName === groupName)!.continueOnError ?? false,
    ),
    balanceChanges: extractBalanceChangesFromIndexerTransaction(transaction),
    innerTxns: transaction.innerTxns?.map((inner) => processExtraFields(inner, arc28Events, arc28Groups)),
  }
}

function hasEmittedMatchingArc28Event(
  logs: Uint8Array[],
  allEvents: Arc28EventToProcess[],
  eventGroups: Arc28EventGroup[],
  eventFilter: { groupName: string; eventName: string }[],
  appId: bigint,
  transaction: () => SubscribedTransaction,
): boolean {
  const potentialEvents = allEvents
    .filter((e) => eventFilter.some((f) => f.eventName === e.eventName && f.groupName === e.groupName))
    .filter((e) => transactionIsInArc28EventGroup(eventGroups.find((g) => g.groupName === e.groupName)!, appId, transaction))

  return (
    logs
      .filter((log) => log.length > 4)
      .filter((log) => {
        const prefix = Buffer.from(log.slice(0, 4)).toString('hex')
        return potentialEvents.some((e) => e.eventPrefix === prefix)
      }).length > 0
  )
}

function extractArc28Events(
  transactionId: string,
  logs: Uint8Array[],
  events: Arc28EventToProcess[],
  continueOnError: (groupName: string) => boolean,
): EmittedArc28Event[] | undefined {
  if (events.length === 0) {
    return undefined
  }

  return logs
    .filter((log) => log.length > 4)
    .flatMap((log) => {
      const prefix = Buffer.from(log.slice(0, 4)).toString('hex')
      return events
        .filter((e) => e.eventPrefix === prefix)
        .map((e) => {
          try {
            const args: ABIValue[] = []
            const argsByName: Record<string, ABIValue> = {}

            const type = ABITupleType.from(`(${e.eventDefinition.args.map((a) => a.type).join(',')})`)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = type.decode(log.slice(4)) as any[]

            e.eventDefinition.args.forEach((a, i) => {
              args.push(value[i])
              if (a.name) {
                argsByName[a.name] = value[i]
              }
            })

            return {
              ...e,
              args,
              argsByName,
            } satisfies EmittedArc28Event
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            if (continueOnError(e.groupName)) {
              // eslint-disable-next-line no-console
              console.warn(`Encountered error while processing ${e.groupName}.${e.eventName} on transaction ${transactionId}:`, error)
              return undefined
            }
            throw error
          }
        })
    })
    .filter((e) => !!e) as EmittedArc28Event[]
}

function indexerPreFilter(
  subscription: TransactionFilter,
  minRound: bigint,
  maxRound: bigint,
): SearchForTransactionsCriteria {
  // NOTE: everything in this method needs to be mirrored to `indexerPreFilterInMemory` below
  const criteria: SearchForTransactionsCriteria = {
    minRound,
    maxRound,
  }

  if (subscription.sender && typeof subscription.sender === 'string') {
    criteria.address = subscription.sender
    criteria.addressRole = 'sender'
  }
  if (subscription.receiver && typeof subscription.receiver === 'string') {
    criteria.address = subscription.receiver
    criteria.addressRole = 'receiver'
  }
  if (subscription.type && typeof subscription.type === 'string') {
    criteria.txType = subscription.type.toString() as SearchForTransactionsCriteria['txType']
  }
  if (subscription.notePrefix) {
    criteria.notePrefix = Buffer.from(subscription.notePrefix).toString('base64')
  }
  if (subscription.appId && typeof subscription.appId === 'bigint') {
    criteria.applicationId = subscription.appId
  }
  if (subscription.assetId && typeof subscription.assetId === 'bigint') {
    criteria.assetId = subscription.assetId
  }

  // Indexer only supports minAmount and maxAmount for non-payments if an asset ID is provided so check
  //  we are looking for just payments, or we have provided asset ID before adding to pre-filter
  //  if they aren't added here they will be picked up in the in-memory pre-filter
  if (subscription.minAmount && (subscription.type === TransactionType.Payment || subscription.assetId)) {
    // Indexer only supports numbers, but even though this is less precise the in-memory indexer pre-filter will remove any false positives
    criteria.currencyGreaterThan =
      subscription.minAmount > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : Number(subscription.minAmount) - 1
  }
  if (
    subscription.maxAmount &&
    subscription.maxAmount < Number.MAX_SAFE_INTEGER &&
    // Only let an asset currency max search work when there is also a min > 0 otherwise opt-ins aren't picked up by the pre-filter :(
    (subscription.type === TransactionType.Payment || (subscription.assetId && (subscription?.minAmount ?? 0) > 0))
  ) {
    criteria.currencyLessThan = Number(subscription.maxAmount) + 1
  }

  return criteria
}

function indexerPreFilterInMemory(subscription: TransactionFilter): (t: SubscribedTransaction) => boolean {
  // This is needed so we can overcome the problem that when indexer matches on an inner transaction it doesn't return that inner transaction,
  // it returns the parent so we need to re-run these filters in-memory to identify the actual transaction(s) that were matched
  return (t) => {
    let result = true
    if (subscription.sender) {
      if (typeof subscription.sender === 'string') {
        result &&= t.sender === subscription.sender
      } else {
        result &&= subscription.sender.includes(t.sender)
      }
    }
    if (subscription.receiver) {
      if (typeof subscription.receiver === 'string') {
        result &&=
          (!!t.assetTransferTransaction && t.assetTransferTransaction.receiver === subscription.receiver) ||
          (!!t.paymentTransaction && t.paymentTransaction.receiver === subscription.receiver)
      } else {
        result &&=
          (!!t.assetTransferTransaction && subscription.receiver.includes(t.assetTransferTransaction.receiver)) ||
          (!!t.paymentTransaction && subscription.receiver.includes(t.paymentTransaction.receiver))
      }
    }
    if (subscription.type) {
      result &&= !!t.txType && subscription.type.includes(getTransactionType(t.txType))
    }
    if (subscription.notePrefix) {
      result &&= t.note ? Buffer.from(t.note).toString('utf-8').startsWith(subscription.notePrefix) : false
    }
    if (subscription.appId) {
      if (typeof subscription.appId === 'bigint') {
        result &&=
          t.createdAppId === subscription.appId ||
          (!!t.applicationTransaction && t.applicationTransaction.applicationId === subscription.appId)
      } else {
        result &&=
          (t.createdAppId && subscription.appId.includes(t.createdAppId)) ||
          (!!t.applicationTransaction && subscription.appId.includes(t.applicationTransaction.applicationId))
      }
    }
    if (subscription.assetId) {
      if (typeof subscription.assetId === 'bigint') {
        result &&=
          t.createdAssetId === subscription.assetId ||
          (!!t.assetConfigTransaction && t.assetConfigTransaction.assetId === subscription.assetId) ||
          (!!t.assetFreezeTransaction && t.assetFreezeTransaction.assetId === subscription.assetId) ||
          (!!t.assetTransferTransaction && t.assetTransferTransaction.assetId === subscription.assetId)
      } else {
        result &&=
          (t.createdAssetId && subscription.assetId.includes(t.createdAssetId)) ||
          (!!t.assetConfigTransaction &&
            t.assetConfigTransaction.assetId !== undefined &&
            subscription.assetId.includes(t.assetConfigTransaction.assetId)) ||
          (!!t.assetFreezeTransaction && subscription.assetId.includes(t.assetFreezeTransaction.assetId)) ||
          (!!t.assetTransferTransaction && subscription.assetId.includes(t.assetTransferTransaction.assetId))
      }
    }

    if (subscription.minAmount) {
      result &&=
        (!!t.paymentTransaction && t.paymentTransaction.amount >= subscription.minAmount) ||
        (!!t.assetTransferTransaction && t.assetTransferTransaction.amount >= subscription.minAmount)
    }
    if (subscription.maxAmount) {
      result &&=
        (!!t.paymentTransaction && t.paymentTransaction.amount <= subscription.maxAmount) ||
        (!!t.assetTransferTransaction && t.assetTransferTransaction.amount <= subscription.maxAmount)
    }

    return result
  }
}

function indexerPostFilter(
  subscription: TransactionFilter,
  arc28Events: Arc28EventToProcess[],
  arc28EventGroups: Arc28EventGroup[],
): (t: SubscribedTransaction) => boolean {
  return (t) => {
    let result = true
    if (subscription.assetCreate) {
      result &&= !!t.createdAssetId
    } else if (subscription.assetCreate === false) {
      result &&= !t.createdAssetId
    }
    if (subscription.appCreate) {
      result &&= !!t.createdAppId
    } else if (subscription.appCreate === false) {
      result &&= !t.createdAppId
    }
    if (subscription.appOnComplete) {
      result &&=
        !!t.applicationTransaction &&
        t.applicationTransaction.onCompletion !== undefined &&
        (typeof subscription.appOnComplete === 'string' ? [subscription.appOnComplete] : subscription.appOnComplete)
          .map((oc) => oc.toString())
          .includes(t.applicationTransaction.onCompletion)
    }
    if (subscription.methodSignature) {
      if (typeof subscription.methodSignature === 'string') {
        result &&=
          !!t.applicationTransaction &&
          !!t.applicationTransaction.applicationArgs &&
          t.applicationTransaction.applicationArgs.length > 0 &&
          Buffer.from(t.applicationTransaction.applicationArgs[0]).toString('base64') ===
            getMethodSelectorBase64(subscription.methodSignature)
      } else {
        subscription.methodSignature.filter(
          (method) =>
            !!t.applicationTransaction &&
            !!t.applicationTransaction.applicationArgs &&
            t.applicationTransaction.applicationArgs.length > 0 &&
            Buffer.from(t.applicationTransaction.applicationArgs[0]).toString('base64') === getMethodSelectorBase64(method),
        ).length > 0
          ? (result &&= true)
          : (result &&= false)
      }
    }
    if (subscription.appCallArgumentsMatch) {
      result &&= !!t.applicationTransaction && subscription.appCallArgumentsMatch(
        (t.applicationTransaction.applicationArgs ?? []).map((arg) => Buffer.from(arg))
      )
    }
    if (subscription.arc28Events) {
      result &&=
        !!t.applicationTransaction &&
        !!t.logs &&
        hasEmittedMatchingArc28Event(
          t.logs,
          arc28Events,
          arc28EventGroups,
          subscription.arc28Events,
          t.createdAppId ?? t.applicationTransaction?.applicationId ?? 0n,
          () => t,
        )
    }
    if (subscription.balanceChanges) {
      const balanceChanges = extractBalanceChangesFromIndexerTransaction(t)
      result &&= hasBalanceChangeMatch(balanceChanges, subscription.balanceChanges)
    }
    if (subscription.customFilter) {
      result &&= subscription.customFilter(t)
    }
    return result
  }
}

function getMethodSelectorBase64(methodSignature: string) {
  // todo: memoize?
  const hash = sha512.sha512_256.array(methodSignature)
  return Buffer.from(new Uint8Array(hash.slice(0, 4))).toString('base64')
}

function transactionFilter(
  subscription: TransactionFilter,
  arc28Events: Arc28EventToProcess[],
  arc28EventGroups: Arc28EventGroup[],
): (t: TransactionInBlock) => boolean {
  return (txn) => {
    const { transaction: t, createdAppId, createdAssetId, logs } = txn
    let result = true
    if (subscription.sender) {
      if (typeof subscription.sender === 'string') {
        result &&= t.sender.toString() === subscription.sender
      } else {
        result &&= subscription.sender.includes(t.sender.toString())
      }
    }
    if (subscription.receiver) {
      const receiver = t.payment?.receiver ?? t.assetTransfer?.receiver
      if (typeof subscription.receiver === 'string') {
        result &&= !!receiver && receiver.toString() === subscription.receiver
      } else {
        result &&= !!receiver && subscription.receiver.includes(receiver.toString())
      }
    }
    if (subscription.type) {
      if (typeof subscription.type === 'string') {
        result &&= t.type === subscription.type
      } else {
        result &&= !!t.type && subscription.type.includes(t.type)
      }
    }
    if (subscription.notePrefix) {
      result &&= !!t.note && new TextDecoder().decode(t.note).startsWith(subscription.notePrefix)
    }
    if (subscription.appId) {
      const appId = t.appCall?.appId
      if (typeof subscription.appId === 'bigint') {
        result &&= appId === subscription.appId || createdAppId === subscription.appId
      } else {
        result &&= (!!appId && subscription.appId.includes(appId)) || (!!createdAppId && subscription.appId.includes(createdAppId))
      }
    }
    if (subscription.assetId) {
      const assetId = t.assetTransfer?.assetId ?? t.assetConfig?.assetId ?? t.assetFreeze?.assetId
      if (typeof subscription.assetId === 'bigint') {
        result &&= assetId === subscription.assetId || createdAssetId === subscription.assetId
      } else {
        result &&=
          (!!assetId && subscription.assetId.includes(assetId)) || (!!createdAssetId && subscription.assetId.includes(createdAssetId))
      }
    }
    if (subscription.minAmount) {
      const amount = t.payment?.amount ?? t.assetTransfer?.amount ?? 0n
      result &&= [TransactionType.AssetTransfer, TransactionType.Payment].includes(t.type) && amount >= subscription.minAmount
    }
    if (subscription.maxAmount) {
      const amount = t.payment?.amount ?? t.assetTransfer?.amount ?? 0n
      result &&= [TransactionType.AssetTransfer, TransactionType.Payment].includes(t.type) && amount <= subscription.maxAmount
    }
    if (subscription.assetCreate) {
      result &&= !!createdAssetId
    } else if (subscription.assetCreate === false) {
      result &&= !createdAssetId
    }
    if (subscription.appCreate) {
      result &&= !!createdAppId
    } else if (subscription.appCreate === false) {
      result &&= !createdAppId
    }
    if (subscription.appOnComplete) {
      result &&= (typeof subscription.appOnComplete === 'string' ? [subscription.appOnComplete] : subscription.appOnComplete).includes(
        algodOnCompleteToIndexerOnComplete(
          t.appCall?.onComplete ?? OnApplicationComplete.NoOp /* the '0' value comes through as undefined */,
        ),
      )
    }
    if (subscription.methodSignature) {
      const firstAppCallArg = t.appCall?.args?.[0]
      if (typeof subscription.methodSignature === 'string') {
        result &&=
          !!firstAppCallArg && Buffer.from(firstAppCallArg).toString('base64') === getMethodSelectorBase64(subscription.methodSignature)
      } else {
        subscription.methodSignature.filter(
          (method) => firstAppCallArg && Buffer.from(firstAppCallArg).toString('base64') === getMethodSelectorBase64(method),
        ).length > 0
          ? (result &&= true)
          : (result &&= false)
      }
    }
    if (subscription.arc28Events) {
      result &&=
        t.type === TransactionType.AppCall &&
        !!logs &&
        hasEmittedMatchingArc28Event(
          logs,
          arc28Events,
          arc28EventGroups,
          subscription.arc28Events,
          createdAppId ?? t.appCall?.appId ?? 0n,
          () => getIndexerTransactionFromAlgodTransaction(txn),
        )
    }
    if (subscription.appCallArgumentsMatch) {
      result &&= subscription.appCallArgumentsMatch(t.appCall?.args)
    }
    if (subscription.balanceChanges) {
      const balanceChanges = extractBalanceChangesFromBlockTransaction(txn.signedTxnWithAD)
      result &&= hasBalanceChangeMatch(balanceChanges, subscription.balanceChanges)
    }
    if (subscription.customFilter) {
      result &&= subscription.customFilter(getIndexerTransactionFromAlgodTransaction(txn))
    }
    return result
  }
}

function hasBalanceChangeMatch(transactionBalanceChanges: BalanceChange[], filteredBalanceChanges: TransactionFilter['balanceChanges']) {
  return (filteredBalanceChanges ?? []).some((changeFilter) =>
    transactionBalanceChanges.some(
      (actualChange) =>
        (!changeFilter.address ||
          (Array.isArray(changeFilter.address) && changeFilter.address.length === 0) ||
          (Array.isArray(changeFilter.address) ? changeFilter.address : [changeFilter.address]).includes(actualChange.address)) &&
        (changeFilter.minAbsoluteAmount === undefined ||
          (actualChange.amount < 0n ? -1n * actualChange.amount : actualChange.amount) >= changeFilter.minAbsoluteAmount) &&
        (changeFilter.maxAbsoluteAmount === undefined ||
          (actualChange.amount < 0n ? -1n * actualChange.amount : actualChange.amount) <= changeFilter.maxAbsoluteAmount) &&
        (changeFilter.minAmount === undefined || actualChange.amount >= changeFilter.minAmount) &&
        (changeFilter.maxAmount === undefined || actualChange.amount <= changeFilter.maxAmount) &&
        (changeFilter.assetId === undefined ||
          (Array.isArray(changeFilter.assetId) && changeFilter.assetId.length === 0) ||
          (Array.isArray(changeFilter.assetId) ? changeFilter.assetId : [changeFilter.assetId]).includes(actualChange.assetId)) &&
        (changeFilter.role === undefined ||
          (Array.isArray(changeFilter.role) && changeFilter.role.length === 0) ||
          (Array.isArray(changeFilter.role) ? changeFilter.role : [changeFilter.role]).some((r) => actualChange.roles.includes(r))),
    ),
  )
}

/** Process an indexer transaction and return that transaction or any of it's inner transactions
 * that meet the indexer pre-filter requirements; patching up transaction ID and intra-round-offset on the way through.
 */
function getFilteredIndexerTransactions(
  transaction: IndexerTransaction,
  filter: NamedTransactionFilter,
): SubscribedTransaction[] {
  let rootOffset = 0
  const getRootOffset = () => rootOffset++

  const innerTransactions = getIndexerInnerTransactions(transaction, transaction, getRootOffset)
  const rootTransaction: SubscribedTransaction = {
    ...transaction,
    id: transaction.id!,
    innerTxns: innerTransactions,
    filtersMatched: [filter.name],
  }

  const transactions = [rootTransaction, ...innerTransactions] satisfies SubscribedTransaction[]

  return transactions.filter(indexerPreFilterInMemory(filter.filter))
}

/** Return a transaction and its inner transactions as an array of `SubscribedTransaction` objects. */
function getIndexerInnerTransactions(
  root: IndexerTransaction,
  parent: IndexerTransaction,
  getRootOffset: () => number,
): SubscribedTransaction[] {
  return (parent.innerTxns ?? []).flatMap((t): SubscribedTransaction[] => {
    const rootOffset = getRootOffset() + 1
    const intraRoundOffset = root.intraRoundOffset! + rootOffset
    const transactionId = `${root.id}/inner/${rootOffset}`

    const innerTransactions = getIndexerInnerTransactions(root, t, getRootOffset)

    const transaction: SubscribedTransaction = {
      ...t,
      id: transactionId,
      parentTransactionId: root.id,
      parentIntraRoundOffset: root.intraRoundOffset!,
      intraRoundOffset: intraRoundOffset,
      innerTxns: innerTransactions,
    }

    return [transaction, ...innerTransactions] satisfies SubscribedTransaction[]
  })
}
