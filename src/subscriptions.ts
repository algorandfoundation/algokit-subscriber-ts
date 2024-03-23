import * as algokit from '@algorandfoundation/algokit-utils'
import type { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import * as msgpack from 'algorand-msgpack'
import algosdk from 'algosdk'
import type SearchForTransactions from 'algosdk/dist/types/client/v2/indexer/searchForTransactions'
import sha512, { sha512_256 } from 'js-sha512'
import {
  TransactionInBlock,
  algodOnCompleteToIndexerOnComplete,
  getBlockTransactions,
  getIndexerTransactionFromAlgodTransaction,
} from './transform'
import type { Arc28EventGroup, Arc28EventToProcess, EmittedArc28Event } from './types/arc-28'
import type { Block, BlockInnerTransaction, BlockTransaction } from './types/block'
import {
  BalanceChangeRole,
  type BalanceChange,
  type NamedTransactionFilter,
  type SubscribedTransaction,
  type TransactionFilter,
  type TransactionSubscriptionParams,
  type TransactionSubscriptionResult,
} from './types/subscription'
import { chunkArray, range } from './utils'
import ABITupleType = algosdk.ABITupleType
import ABIValue = algosdk.ABIValue
import Algodv2 = algosdk.Algodv2
import Indexer = algosdk.Indexer
import TransactionType = algosdk.TransactionType

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
  const { watermark, filters, maxRoundsToSync: _maxRoundsToSync, syncBehaviour: onMaxRounds } = subscription
  const maxRoundsToSync = _maxRoundsToSync ?? 500
  const currentRound = (await algod.status().do())['last-round'] as number

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

  // If we are less than `maxRoundstoSync` from the tip of the chain then we consult the `syncBehaviour` to determine what to do
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
    newWatermark: endRound,
    currentRound,
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
  if (!arc28Events || transaction['tx-type'] !== TransactionType.appl) return transaction
  const groupsToApply = arc28Groups.filter((g) =>
    transactionIsInArc28EventGroup(
      g,
      transaction['created-application-index'] ?? transaction['application-transaction']?.['application-id'] ?? 0,
      () => transaction,
    ),
  )
  if (groupsToApply.length === 0) return transaction
  const eventsToApply = arc28Events.filter((e) => groupsToApply.some((g) => g.groupName === e.groupName))
  return {
    ...transaction,
    arc28Events: extractArc28Events(
      transaction.id,
      (transaction.logs ?? []).map((l) => Buffer.from(l, 'base64')),
      eventsToApply,
      (groupName) => groupsToApply.find((g) => g.groupName === groupName)!.continueOnError ?? false,
    ),
    balanceChanges: extractBalanceChanges(transaction),
    'inner-txns': transaction['inner-txns']
      ? transaction['inner-txns'].map((inner) => processExtraFields(inner, arc28Events, arc28Groups))
      : undefined,
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
): EmittedArc28Event[] {
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

function extractBalanceChangesFromBlock(transaction: BlockTransaction | BlockInnerTransaction): BalanceChange[] {
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
      {
        address: algosdk.encodeAddress(transaction.txn.rcv!),
        amount: BigInt(transaction.txn.amt ?? 0),
        roles: [BalanceChangeRole.Receiver],
        assetId: 0,
      },
      ...(transaction.ca
        ? [
            {
              address: algosdk.encodeAddress(transaction.txn.close!),
              amount: BigInt(transaction.ca),
              roles: [BalanceChangeRole.CloseTo],
              assetId: 0,
            },
            {
              address: algosdk.encodeAddress(transaction.txn.snd),
              amount: -1n * BigInt(transaction.ca),
              roles: [BalanceChangeRole.Sender],
              assetId: 0,
            },
          ]
        : []),
    )
  }

  if (transaction.txn.type === TransactionType.axfer) {
    balanceChanges.push(
      {
        address: algosdk.encodeAddress(transaction.txn.snd),
        assetId: transaction.txn.xaid!,
        amount: -1n * BigInt(transaction.txn.aamt ?? 0),
        roles: [BalanceChangeRole.Sender],
      },
      {
        address: algosdk.encodeAddress(transaction.txn.arcv!),
        assetId: transaction.txn.xaid!,
        amount: BigInt(transaction.txn.aamt ?? 0),
        roles: [BalanceChangeRole.Receiver],
      },
      ...(transaction.aca
        ? [
            {
              address: algosdk.encodeAddress(transaction.txn.aclose!),
              assetId: transaction.txn.xaid!,
              amount: BigInt(transaction.aca),
              roles: [BalanceChangeRole.CloseTo],
            },
            {
              address: algosdk.encodeAddress(transaction.txn.snd),
              assetId: transaction.txn.xaid!,
              amount: -1n * BigInt(transaction.aca),
              roles: [BalanceChangeRole.Sender],
            },
          ]
        : []),
    )
  }

  return balanceChanges
    .reduce((changes, change) => {
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
    .filter((c) => c.amount !== 0n)
}

function extractBalanceChanges(transaction: TransactionResult): BalanceChange[] {
  const balanceChanges: BalanceChange[] = []

  if (transaction.fee > 0) {
    balanceChanges.push({
      address: transaction.sender,
      amount: -1n * BigInt(transaction.fee),
      roles: [BalanceChangeRole.Sender],
      assetId: 0,
    })
  }

  if (transaction['tx-type'] === TransactionType.pay) {
    balanceChanges.push(
      {
        address: transaction.sender,
        amount: -1n * BigInt(transaction['payment-transaction']!.amount),
        roles: [BalanceChangeRole.Sender],
        assetId: 0,
      },
      {
        address: transaction['payment-transaction']!.receiver,
        amount: BigInt(transaction['payment-transaction']!.amount),
        roles: [BalanceChangeRole.Receiver],
        assetId: 0,
      },
      ...(transaction['payment-transaction']!['close-amount']
        ? [
            {
              address: transaction['payment-transaction']!['close-remainder-to']!,
              amount: BigInt(transaction['payment-transaction']!['close-amount']),
              roles: [BalanceChangeRole.CloseTo],
              assetId: 0,
            },
            {
              address: transaction.sender,
              amount: -1n * BigInt(transaction['payment-transaction']!['close-amount']),
              roles: [BalanceChangeRole.Sender],
              assetId: 0,
            },
          ]
        : []),
    )
  }

  if (transaction['tx-type'] === TransactionType.axfer) {
    balanceChanges.push(
      {
        address: transaction['asset-transfer-transaction']!.sender!,
        assetId: transaction['asset-transfer-transaction']!['asset-id'],
        amount: -1n * BigInt(transaction['asset-transfer-transaction']!.amount),
        roles: [BalanceChangeRole.Sender],
      },
      {
        address: transaction['asset-transfer-transaction']!.receiver,
        assetId: transaction['asset-transfer-transaction']!['asset-id'],
        amount: BigInt(transaction['asset-transfer-transaction']!.amount),
        roles: [BalanceChangeRole.Receiver],
      },
      ...(transaction['asset-transfer-transaction']!['close-amount']
        ? [
            {
              address: transaction['asset-transfer-transaction']!['close-to']!,
              assetId: transaction['asset-transfer-transaction']!['asset-id'],
              amount: BigInt(transaction['asset-transfer-transaction']!['close-amount']),
              roles: [BalanceChangeRole.CloseTo],
            },
            {
              address: transaction['asset-transfer-transaction']!.sender!,
              assetId: transaction['asset-transfer-transaction']!['asset-id'],
              amount: -1n * BigInt(transaction['asset-transfer-transaction']!['close-amount']),
              roles: [BalanceChangeRole.Sender],
            },
          ]
        : []),
    )
  }

  return balanceChanges
    .reduce((changes, change) => {
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
    .filter((c) => c.amount !== 0n)
}

function indexerPreFilter(
  subscription: TransactionFilter,
  minRound: number,
  maxRound: number,
): (s: SearchForTransactions) => SearchForTransactions {
  return (s) => {
    // NOTE: everything in this method needs to be mirrored to `indexerPreFilterInMemory` below
    let filter = s
    if (subscription.sender) {
      filter = filter.address(subscription.sender).addressRole('sender')
    }
    if (subscription.receiver) {
      filter = filter.address(subscription.receiver).addressRole('receiver')
    }
    if (subscription.type) {
      filter = filter.txType(subscription.type.toString())
    }
    if (subscription.notePrefix) {
      filter = filter.notePrefix(Buffer.from(subscription.notePrefix).toString('base64'))
    }
    if (subscription.appId) {
      filter = filter.applicationID(subscription.appId)
    }
    if (subscription.assetId) {
      filter = filter.assetID(subscription.assetId)
    }
    if (subscription.minAmount) {
      filter = filter.currencyGreaterThan(subscription.minAmount - 1)
    }
    if (subscription.maxAmount) {
      filter = filter.currencyLessThan(subscription.maxAmount + 1)
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
      result &&= t.sender === subscription.sender
    }
    if (subscription.receiver) {
      result &&=
        (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction'].receiver === subscription.receiver) ||
        (!!t['payment-transaction'] && t['payment-transaction'].receiver === subscription.receiver)
    }
    if (subscription.type) {
      result &&= t['tx-type'] === subscription.type
    }
    if (subscription.notePrefix) {
      result &&= t.note ? Buffer.from(t.note, 'base64').toString('utf-8').startsWith(subscription.notePrefix) : false
    }
    if (subscription.appId) {
      result &&=
        t['created-application-index'] === subscription.appId ||
        (!!t['application-transaction'] && t['application-transaction']['application-id'] === subscription.appId)
    }
    if (subscription.assetId) {
      result &&=
        t['created-asset-index'] === subscription.assetId ||
        (!!t['asset-config-transaction'] && t['asset-config-transaction']['asset-id'] === subscription.assetId) ||
        (!!t['asset-freeze-transaction'] && t['asset-freeze-transaction']['asset-id'] === subscription.assetId) ||
        (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction']['asset-id'] === subscription.assetId)
    }

    if (subscription.minAmount) {
      result &&=
        (!!t['payment-transaction'] && t['payment-transaction'].amount >= subscription.minAmount) ||
        (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction'].amount >= subscription.minAmount)
    }
    if (subscription.maxAmount) {
      result &&=
        (!!t['payment-transaction'] && t['payment-transaction'].amount <= subscription.maxAmount) ||
        (!!t['asset-transfer-transaction'] && t['asset-transfer-transaction'].amount <= subscription.maxAmount)
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
      result &&=
        !!t['application-transaction'] &&
        !!t['application-transaction']['application-args'] &&
        t['application-transaction']['application-args'][0] === getMethodSelectorBase64(subscription.methodSignature)
    }
    if (subscription.methodSignatures) {
      subscription.methodSignatures.filter(
        (method) =>
          !!t['application-transaction'] &&
          !!t['application-transaction']['application-args'] &&
          t['application-transaction']['application-args'][0] === getMethodSelectorBase64(method),
      ).length > 0
        ? (result &&= true)
        : (result &&= false)
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
      result &&= subscription.balanceChanges.some((balanceChange) =>
        extractBalanceChanges(t).some(
          (change) =>
            (!balanceChange.address || change.address === balanceChange.address) &&
            (!balanceChange.minAmount || change.amount >= balanceChange.minAmount) &&
            (!balanceChange.maxAmount || change.amount <= balanceChange.maxAmount) &&
            (!balanceChange.assetId || balanceChange.assetId.length === 0 || balanceChange.assetId.includes(change.assetId)) &&
            (!balanceChange.roles || balanceChange.roles.length === 0 || balanceChange.roles.some((r) => change.roles.includes(r))),
        ),
      )
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
      result &&= !!t.from && algosdk.encodeAddress(t.from.publicKey) === subscription.sender
    }
    if (subscription.receiver) {
      result &&= !!t.to && algosdk.encodeAddress(t.to.publicKey) === subscription.receiver
    }
    if (subscription.type) {
      result &&= t.type === subscription.type
    }
    if (subscription.notePrefix) {
      result &&= !!t.note && new TextDecoder().decode(t.note).startsWith(subscription.notePrefix)
    }
    if (subscription.appId) {
      result &&= t.appIndex === subscription.appId || createdAppId === subscription.appId
    }
    if (subscription.assetId) {
      result &&= t.assetIndex === subscription.assetId || createdAssetId === subscription.assetId
    }
    if (subscription.minAmount) {
      result &&= t.amount >= subscription.minAmount
    }
    if (subscription.maxAmount) {
      result &&= t.amount <= subscription.maxAmount
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
        algodOnCompleteToIndexerOnComplete(t.appOnComplete),
      )
    }
    if (subscription.methodSignature) {
      result &&= !!t.appArgs && Buffer.from(t.appArgs[0] ?? []).toString('base64') === getMethodSelectorBase64(subscription.methodSignature)
    }
    if (subscription.methodSignatures) {
      subscription.methodSignatures.filter(
        (method) => !!t.appArgs && Buffer.from(t.appArgs[0] ?? []).toString('base64') === getMethodSelectorBase64(method),
      ).length > 0
        ? (result &&= true)
        : (result &&= false)
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
      result &&= subscription.balanceChanges.some((balanceChange) =>
        extractBalanceChangesFromBlock(txn.blockTransaction).some(
          (change) =>
            (!balanceChange.address || change.address === balanceChange.address) &&
            (!balanceChange.minAmount || change.amount >= balanceChange.minAmount) &&
            (!balanceChange.maxAmount || change.amount <= balanceChange.maxAmount) &&
            (!balanceChange.assetId || balanceChange.assetId.length === 0 || balanceChange.assetId.includes(change.assetId)) &&
            (!balanceChange.roles || balanceChange.roles.length === 0 || balanceChange.roles.some((r) => change.roles.includes(r))),
        ),
      )
    }
    return result
  }
}

/**
 * Retrieves blocks in bulk (30 at a time) between the given round numbers.
 * @param context The blocks to retrieve
 * @param client The algod client
 * @returns The blocks
 */
export async function getBlocksBulk(context: { startRound: number; maxRound: number }, client: Algodv2) {
  // Grab 30 at a time in parallel to not overload the node
  const blockChunks = chunkArray(range(context.startRound, context.maxRound), 30)
  let blocks: { block: Block }[] = []
  for (const chunk of blockChunks) {
    algokit.Config.logger.info(`Retrieving ${chunk.length} blocks from round ${chunk[0]} via algod`)
    const start = +new Date()
    blocks = blocks.concat(
      await Promise.all(
        chunk.map(async (round) => {
          const response = await client.c.get(`/v2/blocks/${round}`, { format: 'msgpack' }, undefined, undefined, false)
          const body = response.body as Uint8Array
          const decodedWithMap = msgpack.decode(body, {
            intMode: msgpack.IntMode.AS_ENCODED,
            useMap: true,
            rawBinaryStringValues: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as Map<any, any>
          const decoded = blockMapToObject(decodedWithMap) as {
            block: Block
          }
          return decoded
        }),
      ),
    )
    algokit.Config.logger.debug(`Retrieved ${chunk.length} blocks from round ${chunk[0]} via algod in ${(+new Date() - start) / 1000}s`)
  }
  return blocks
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blockMapToObject(object: Map<any, any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: { [key: string]: any } = {}
  const decoder = new TextDecoder()
  for (const [key, value] of object) {
    if (key === 'r' && value instanceof Map) {
      // State proof transactions have a property `r` with a map with numeric keys that must stay intact
      const rMap = new Map()
      for (const [k, v] of value) {
        rMap.set(k, v instanceof Map ? blockMapToObject(v) : v)
      }
      result[key] = rMap
    } else if (value instanceof Map) {
      result[key] = blockMapToObject(value)
    } else if (value instanceof Uint8Array) {
      // The following have UTF-8 values
      result[key] = ['gen', 'proto', 'txn256', 'type', 'an', 'un', 'au'].includes(key) ? decoder.decode(value) : value
    } else if (value instanceof Array) {
      result[key] = value.map((v) => (v instanceof Map ? blockMapToObject(v) : v))
    } else {
      result[key] = value
    }
  }
  return result
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
