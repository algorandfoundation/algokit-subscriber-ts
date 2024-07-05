import * as algokit from '@algorandfoundation/algokit-utils'
import type { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'

import algosdk from 'algosdk'
import type SearchForTransactions from 'algosdk/dist/types/client/v2/indexer/searchForTransactions'
import { Buffer } from 'buffer'
import sha512, { sha512_256 } from 'js-sha512'
import { getBlocksBulk } from './block'
import {
  algodOnCompleteToIndexerOnComplete,
  blockDataToBlockMetadata,
  extractBalanceChangesFromBlockTransaction,
  extractBalanceChangesFromIndexerTransaction,
  getBlockTransactions,
  getIndexerTransactionFromAlgodTransaction,
} from './transform'
import type { Arc28EventGroup, Arc28EventToProcess, EmittedArc28Event } from './types/arc-28'
import type { TransactionInBlock } from './types/block'
import {
  BlockMetadata,
  type BalanceChange,
  type NamedTransactionFilter,
  type SubscribedTransaction,
  type TransactionFilter,
  type TransactionSubscriptionParams,
  type TransactionSubscriptionResult,
} from './types/subscription'
import { chunkArray } from './utils'
import ABITupleType = algosdk.ABITupleType
import ABIValue = algosdk.ABIValue
import Algodv2 = algosdk.Algodv2
import Indexer = algosdk.Indexer
import TransactionType = algosdk.TransactionType
import OnApplicationComplete = algosdk.OnApplicationComplete

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
  algod: Algodv2,
  indexer?: Indexer,
): Promise<TransactionSubscriptionResult> {
  const { watermark, filters, maxRoundsToSync: _maxRoundsToSync, syncBehaviour: onMaxRounds, currentRound: _currentRound } = subscription
  const maxRoundsToSync = _maxRoundsToSync ?? 500
  const currentRound = _currentRound ?? ((await algod.status().do())['last-round'] as number)
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

  let indexerSyncToRoundNumber = 0
  let algodSyncFromRoundNumber = watermark + 1
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
        algodSyncFromRoundNumber = currentRound - maxRoundsToSync + 1
        startRound = algodSyncFromRoundNumber
        break
      case 'sync-oldest':
        endRound = algodSyncFromRoundNumber + maxRoundsToSync - 1
        break
      case 'sync-oldest-start-now':
        // When watermark is 0 same behaviour as skip-sync-newest
        if (watermark === 0) {
          algodSyncFromRoundNumber = currentRound - maxRoundsToSync + 1
          startRound = algodSyncFromRoundNumber
        } else {
          // Otherwise same behaviour as sync-oldest
          endRound = algodSyncFromRoundNumber + maxRoundsToSync - 1
        }
        break
      case 'catchup-with-indexer':
        if (!indexer) {
          throw new Error("Can't catch up using indexer since it's not provided")
        }

        // If we have more than `maxIndexerRoundsToSync` rounds to sync from indexer then we skip algod sync and just sync that many rounds from indexer
        indexerSyncToRoundNumber = currentRound - maxRoundsToSync
        if (subscription.maxIndexerRoundsToSync && indexerSyncToRoundNumber - startRound + 1 > subscription.maxIndexerRoundsToSync) {
          indexerSyncToRoundNumber = startRound + subscription.maxIndexerRoundsToSync - 1
          endRound = indexerSyncToRoundNumber
          skipAlgodSync = true
        } else {
          algodSyncFromRoundNumber = indexerSyncToRoundNumber + 1
        }

        algokit.Config.logger.debug(
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
                  (await algokit.searchTransactions(indexer, indexerPreFilter(f.filter, startRound, indexerSyncToRoundNumber))).transactions
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
          .sort((a, b) => a['confirmed-round']! - b['confirmed-round']! || a['intra-round-offset']! - b['intra-round-offset']!)
          // Collapse duplicate transactions
          .reduce(deduplicateSubscribedTransactionsReducer, [] as SubscribedTransaction[])

        algokit.Config.logger.debug(
          `Retrieved ${catchupTransactions.length} transactions from round ${startRound} to round ${
            algodSyncFromRoundNumber - 1
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
    const blockTransactions = blocks.flatMap((b) => getBlockTransactions(b.block))
    algodTransactions = filters
      .flatMap((f) =>
        blockTransactions
          .filter((t) => transactionFilter(f.filter, arc28Events, subscription.arc28Events ?? [])(t!))
          .map((t) => getIndexerTransactionFromAlgodTransaction(t, f.name)),
      )
      .reduce(deduplicateSubscribedTransactionsReducer, [])

    blockMetadata = blocks.map((b) => blockDataToBlockMetadata(b))

    algokit.Config.logger.debug(
      `Retrieved ${blockTransactions.length} transactions from algod via round(s) ${algodSyncFromRoundNumber}-${endRound} in ${
        (+new Date() - start) / 1000
      }s`,
    )
  } else {
    algokit.Config.logger.debug(
      `Skipping algod sync since we have more than ${subscription.maxIndexerRoundsToSync} rounds to sync from indexer.`,
    )
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

function transactionIsInArc28EventGroup(group: Arc28EventGroup, appId: number, transaction: () => TransactionResult) {
  return (
    (!group.processForAppIds || group.processForAppIds.includes(appId)) &&
    // Lazily evaluate transaction so it's only evaluated if needed since creating the transaction object may be expensive if from algod
    (!group.processTransaction || group.processTransaction(transaction()))
  )
}

function processExtraFields(
  transaction: TransactionResult | SubscribedTransaction,
  arc28Events: Arc28EventToProcess[],
  arc28Groups: Arc28EventGroup[],
): SubscribedTransaction {
  const groupsToApply =
    transaction['tx-type'] !== TransactionType.appl
      ? []
      : arc28Groups.filter((g) =>
          transactionIsInArc28EventGroup(
            g,
            transaction['created-application-index'] ?? transaction['application-transaction']?.['application-id'] ?? 0,
            () => transaction,
          ),
        )
  const eventsToApply = groupsToApply.length > 0 ? arc28Events.filter((e) => groupsToApply.some((g) => g.groupName === e.groupName)) : []
  return {
    ...transaction,
    arc28Events: extractArc28Events(
      transaction.id,
      (transaction.logs ?? []).map((l) => Buffer.from(l, 'base64')),
      eventsToApply,
      (groupName) => groupsToApply.find((g) => g.groupName === groupName)!.continueOnError ?? false,
    ),
    balanceChanges: extractBalanceChangesFromIndexerTransaction(transaction),
    'inner-txns': transaction['inner-txns']?.map((inner) => processExtraFields(inner, arc28Events, arc28Groups)),
  }
}

function hasEmittedMatchingArc28Event(
  logs: Uint8Array[],
  allEvents: Arc28EventToProcess[],
  eventGroups: Arc28EventGroup[],
  eventFilter: { groupName: string; eventName: string }[],
  appId: number,
  transaction: () => TransactionResult,
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
            const value = type.decode(Buffer.from(log.slice(4))) as any[]

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
  minRound: number,
  maxRound: number,
): (s: SearchForTransactions) => SearchForTransactions {
  return (s) => {
    // NOTE: everything in this method needs to be mirrored to `indexerPreFilterInMemory` below
    let filter = s
    if (subscription.sender && typeof subscription.sender === 'string') {
      filter = filter.address(subscription.sender).addressRole('sender')
    }
    if (subscription.receiver && typeof subscription.receiver === 'string') {
      filter = filter.address(subscription.receiver).addressRole('receiver')
    }
    if (subscription.type && typeof subscription.type === 'string') {
      filter = filter.txType(subscription.type.toString())
    }
    if (subscription.notePrefix) {
      filter = filter.notePrefix(Buffer.from(subscription.notePrefix).toString('base64'))
    }
    if (
      subscription.appId &&
      (typeof subscription.appId === 'number' || (typeof subscription.appId === 'bigint' && subscription.appId <= Number.MAX_SAFE_INTEGER))
    ) {
      filter = filter.applicationID(Number(subscription.appId))
    }
    if (
      subscription.assetId &&
      (typeof subscription.assetId === 'number' ||
        (typeof subscription.assetId === 'bigint' && subscription.assetId <= Number.MAX_SAFE_INTEGER))
    ) {
      filter = filter.assetID(Number(subscription.assetId))
    }

    // Indexer only supports minAmount and maxAmount for non-payments if an asset ID is provided so check
    //  we are looking for just payments, or we have provided asset ID before adding to pre-filter
    //  if they aren't added here they will be picked up in the in-memory pre-filter
    if (subscription.minAmount && (subscription.type === TransactionType.pay || subscription.assetId)) {
      // Indexer only supports numbers, but even though this is less precise the in-memory indexer pre-filter will remove any false positives
      filter = filter.currencyGreaterThan(
        subscription.minAmount > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : Number(subscription.minAmount) - 1,
      )
    }
    if (
      subscription.maxAmount &&
      subscription.maxAmount < Number.MAX_SAFE_INTEGER &&
      // Only let an asset currency max search work when there is also a min > 0 otherwise opt-ins aren't picked up by the pre-filter :(
      (subscription.type === TransactionType.pay || (subscription.assetId && (subscription?.minAmount ?? 0) > 0))
    ) {
      filter = filter.currencyLessThan(Number(subscription.maxAmount) + 1)
    }
    return filter.minRound(minRound).maxRound(maxRound)
  }
}

function indexerPreFilterInMemory(subscription: TransactionFilter): (t: TransactionResult) => boolean {
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
          (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction'].receiver === subscription.receiver) ||
          (!!t['payment-transaction'] && t['payment-transaction'].receiver === subscription.receiver)
      } else {
        result &&=
          (!!t['asset-transfer-transaction'] && subscription.receiver.includes(t['asset-transfer-transaction'].receiver)) ||
          (!!t['payment-transaction'] && subscription.receiver.includes(t['payment-transaction'].receiver))
      }
    }
    if (subscription.type) {
      if (typeof subscription.type === 'string') {
        result &&= t['tx-type'] === subscription.type
      } else {
        result &&= subscription.type.includes(t['tx-type'])
      }
    }
    if (subscription.notePrefix) {
      result &&= t.note ? Buffer.from(t.note, 'base64').toString('utf-8').startsWith(subscription.notePrefix) : false
    }
    if (subscription.appId) {
      if (typeof subscription.appId === 'number' || typeof subscription.appId === 'bigint') {
        result &&=
          t['created-application-index'] === Number(subscription.appId) ||
          (!!t['application-transaction'] && t['application-transaction']['application-id'] === Number(subscription.appId))
      } else {
        result &&=
          (t['created-application-index'] && subscription.appId.map((i) => Number(i)).includes(t['created-application-index'])) ||
          (!!t['application-transaction'] &&
            subscription.appId.map((i) => Number(i)).includes(t['application-transaction']['application-id']))
      }
    }
    if (subscription.assetId) {
      if (typeof subscription.assetId === 'number' || typeof subscription.assetId === 'bigint') {
        result &&=
          t['created-asset-index'] === subscription.assetId ||
          (!!t['asset-config-transaction'] && t['asset-config-transaction']['asset-id'] === subscription.assetId) ||
          (!!t['asset-freeze-transaction'] && t['asset-freeze-transaction']['asset-id'] === subscription.assetId) ||
          (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction']['asset-id'] === subscription.assetId)
      } else {
        result &&=
          (t['created-asset-index'] && subscription.assetId.map((i) => Number(i)).includes(t['created-asset-index'])) ||
          (!!t['asset-config-transaction'] &&
            subscription.assetId.map((i) => Number(i)).includes(t['asset-config-transaction']['asset-id'])) ||
          (!!t['asset-freeze-transaction'] &&
            subscription.assetId.map((i) => Number(i)).includes(t['asset-freeze-transaction']['asset-id'])) ||
          (!!t['asset-transfer-transaction'] &&
            subscription.assetId.map((i) => Number(i)).includes(t['asset-transfer-transaction']['asset-id']))
      }
    }

    if (subscription.minAmount) {
      result &&=
        (!!t['payment-transaction'] && t['payment-transaction'].amount >= subscription.minAmount) ||
        (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction'].amount >= subscription.minAmount)
    }
    if (subscription.maxAmount) {
      result &&=
        (!!t['payment-transaction'] && BigInt(t['payment-transaction'].amount) <= subscription.maxAmount) ||
        (!!t['asset-transfer-transaction'] && BigInt(t['asset-transfer-transaction'].amount) <= subscription.maxAmount)
    }

    return result
  }
}

function indexerPostFilter(
  subscription: TransactionFilter,
  arc28Events: Arc28EventToProcess[],
  arc28EventGroups: Arc28EventGroup[],
): (t: TransactionResult) => boolean {
  return (t) => {
    let result = true
    if (subscription.assetCreate) {
      result &&= !!t['created-asset-index']
    } else if (subscription.assetCreate === false) {
      result &&= !t['created-asset-index']
    }
    if (subscription.appCreate) {
      result &&= !!t['created-application-index']
    } else if (subscription.appCreate === false) {
      result &&= !t['created-application-index']
    }
    if (subscription.appOnComplete) {
      result &&=
        !!t['application-transaction'] &&
        (typeof subscription.appOnComplete === 'string' ? [subscription.appOnComplete] : subscription.appOnComplete).includes(
          t['application-transaction']['on-completion'],
        )
    }
    if (subscription.methodSignature) {
      if (typeof subscription.methodSignature === 'string') {
        result &&=
          !!t['application-transaction'] &&
          !!t['application-transaction']['application-args'] &&
          t['application-transaction']['application-args'][0] === getMethodSelectorBase64(subscription.methodSignature)
      } else {
        subscription.methodSignature.filter(
          (method) =>
            !!t['application-transaction'] &&
            !!t['application-transaction']['application-args'] &&
            t['application-transaction']['application-args'][0] === getMethodSelectorBase64(method),
        ).length > 0
          ? (result &&= true)
          : (result &&= false)
      }
    }
    if (subscription.appCallArgumentsMatch) {
      result &&=
        !!t['application-transaction'] &&
        subscription.appCallArgumentsMatch(t['application-transaction']['application-args']?.map((a) => Buffer.from(a, 'base64')))
    }
    if (subscription.arc28Events) {
      result &&=
        !!t['application-transaction'] &&
        !!t.logs &&
        hasEmittedMatchingArc28Event(
          t.logs.map((l) => Buffer.from(l, 'base64')),
          arc28Events,
          arc28EventGroups,
          subscription.arc28Events,
          t['created-application-index'] ?? t['application-transaction']?.['application-id'] ?? 0,
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
        result &&= !!t.from && algosdk.encodeAddress(t.from.publicKey) === subscription.sender
      } else {
        result &&= !!t.from && subscription.sender.includes(algosdk.encodeAddress(t.from.publicKey))
      }
    }
    if (subscription.receiver) {
      if (typeof subscription.receiver === 'string') {
        result &&= !!t.to && algosdk.encodeAddress(t.to.publicKey) === subscription.receiver
      } else {
        result &&= !!t.to && subscription.receiver.includes(algosdk.encodeAddress(t.to.publicKey))
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
      if (typeof subscription.appId === 'number' || typeof subscription.appId === 'bigint') {
        result &&= t.appIndex === Number(subscription.appId) || createdAppId === Number(subscription.appId)
      } else {
        result &&=
          (!!t.appIndex && subscription.appId.map((i) => Number(i)).includes(t.appIndex)) ||
          (!!createdAppId && subscription.appId.map((i) => Number(i)).includes(createdAppId))
      }
    }
    if (subscription.assetId) {
      if (typeof subscription.assetId === 'number' || typeof subscription.assetId === 'bigint') {
        result &&= t.assetIndex === subscription.assetId || createdAssetId === subscription.assetId
      } else {
        result &&=
          (!!t.assetIndex && subscription.assetId.map((i) => Number(i)).includes(t.assetIndex)) ||
          (!!createdAssetId && subscription.assetId.map((i) => Number(i)).includes(createdAssetId))
      }
    }
    if (subscription.minAmount) {
      result &&= !!t.type && [TransactionType.axfer, TransactionType.pay].includes(t.type) && (t.amount ?? 0) >= subscription.minAmount
    }
    if (subscription.maxAmount) {
      result &&= !!t.type && [TransactionType.axfer, TransactionType.pay].includes(t.type) && (t.amount ?? 0) <= subscription.maxAmount
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
        algodOnCompleteToIndexerOnComplete(t.appOnComplete ?? OnApplicationComplete.NoOpOC /* the '0' value comes through as undefined */),
      )
    }
    if (subscription.methodSignature) {
      if (typeof subscription.methodSignature === 'string') {
        result &&=
          !!t.appArgs && Buffer.from(t.appArgs[0] ?? []).toString('base64') === getMethodSelectorBase64(subscription.methodSignature)
      } else {
        subscription.methodSignature.filter(
          (method) => !!t.appArgs && Buffer.from(t.appArgs[0] ?? []).toString('base64') === getMethodSelectorBase64(method),
        ).length > 0
          ? (result &&= true)
          : (result &&= false)
      }
    }
    if (subscription.arc28Events) {
      result &&=
        t.type === TransactionType.appl &&
        !!logs &&
        hasEmittedMatchingArc28Event(logs, arc28Events, arc28EventGroups, subscription.arc28Events, createdAppId ?? t.appIndex ?? 0, () =>
          getIndexerTransactionFromAlgodTransaction(txn),
        )
    }
    if (subscription.appCallArgumentsMatch) {
      result &&= subscription.appCallArgumentsMatch(t.appArgs)
    }
    if (subscription.balanceChanges) {
      const balanceChanges = extractBalanceChangesFromBlockTransaction(txn.blockTransaction)
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
function getFilteredIndexerTransactions(transaction: TransactionResult, filter: NamedTransactionFilter): SubscribedTransaction[] {
  let parentOffset = 0
  const getParentOffset = () => parentOffset++

  const transactions = [
    { ...transaction, filtersMatched: [filter.name] } as SubscribedTransaction,
    ...getIndexerInnerTransactions(transaction, transaction, getParentOffset),
  ]
  return transactions.filter(indexerPreFilterInMemory(filter.filter))
}

/** Return a transaction and its inner transactions as an array of `SubscribedTransaction` objects. */
function getIndexerInnerTransactions(root: TransactionResult, parent: TransactionResult, offset: () => number): SubscribedTransaction[] {
  return (parent['inner-txns'] ?? []).flatMap((t) => {
    const parentOffset = offset()
    return [
      {
        ...t,
        parentTransactionId: root.id,
        id: `${root.id}/inner/${parentOffset + 1}`,
        'intra-round-offset': root['intra-round-offset']! + parentOffset + 1,
      },
      ...getIndexerInnerTransactions(root, t, offset),
    ] satisfies SubscribedTransaction[]
  })
}
