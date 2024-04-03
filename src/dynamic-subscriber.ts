import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'
import { AlgorandSubscriber } from './subscriber'
import {
  getAlgodSubscribedTransactions,
  getArc28EventsToProcess,
  getIndexerCatchupTransactions,
  prepareSubscriptionPoll,
  processExtraSubscriptionTransactionFields,
} from './subscriptions'
import type {
  DynamicAlgorandSubscriberConfig,
  NamedTransactionFilter,
  SubscribedTransaction,
  TransactionSubscriptionResult,
} from './types/subscription'
import Algodv2 = algosdk.Algodv2
import Indexer = algosdk.Indexer

export class DynamicAlgorandSubscriber<T> extends AlgorandSubscriber {
  private pendingStateChanges: { action: 'append' | 'delete' | 'set'; stateChange: Partial<T> }[] = []
  private dynamicConfig: DynamicAlgorandSubscriberConfig<T>

  constructor(config: DynamicAlgorandSubscriberConfig<T>, algod: Algodv2, indexer?: Indexer) {
    super(
      {
        filters: [],
        ...config,
      },
      algod,
      indexer,
    )
    this.dynamicConfig = config
  }

  protected override async _pollOnce(watermark: number): Promise<TransactionSubscriptionResult> {
    let subscribedTransactions: SubscribedTransaction[] = []
    let filterState: T = await this.dynamicConfig.filterStatePersistence.get()

    const subscribe = async (filters: NamedTransactionFilter[]) => {
      if (filters.length === 0) return []
      const catchupTransactions = await getIndexerCatchupTransactions(filters, pollMetadata, arc28EventsToProcess, this.indexer)
      const algodTransactions = await getAlgodSubscribedTransactions(filters, pollMetadata, arc28EventsToProcess)
      const subscribedTransactions = catchupTransactions
        .concat(algodTransactions)
        .map((t) => processExtraSubscriptionTransactionFields(t, arc28EventsToProcess, this.config.arc28Events ?? []))
      await this._processFilters({ subscribedTransactions, ...pollMetadata })
      return subscribedTransactions
    }

    const filters = await this.dynamicConfig.dynamicFilters(filterState, 0, watermark)
    this.filterNames = filters
      .map((f) => f.name)
      .filter((value, index, self) => {
        // Remove duplicates
        return self.findIndex((x) => x === value) === index
      })
    const pollMetadata = await prepareSubscriptionPoll({ ...this.config, watermark, filters }, this.algod)
    const arc28EventsToProcess = getArc28EventsToProcess(this.config.arc28Events ?? [])

    subscribedTransactions = await subscribe(filters)

    let pollLevel = 0
    while (this.pendingStateChanges.length > 0) {
      const stateChangeCount = this.pendingStateChanges.length
      let filterStateToProcess = { ...filterState }
      for (const change of this.pendingStateChanges) {
        switch (change.action) {
          case 'append':
            for (const key of Object.keys(change.stateChange)) {
              const k = key as keyof T
              if (!filterState[k] || !Array.isArray(filterState[k])) {
                filterState[k] = change.stateChange[k]!
              } else {
                filterState[k] = (filterState[k] as unknown[]).concat(change.stateChange[k]) as T[keyof T]
              }
            }
            filterStateToProcess = { ...filterStateToProcess, ...change.stateChange }
            break
          case 'delete':
            for (const key of Object.keys(change.stateChange)) {
              const k = key as keyof T
              delete filterState[k]
              delete filterStateToProcess[k]
            }
            break
          case 'set':
            filterState = { ...filterState, ...change.stateChange }
            filterStateToProcess = { ...filterState, ...change.stateChange }
            break
        }
      }
      this.pendingStateChanges = []
      const newFilters = await this.dynamicConfig.dynamicFilters(filterStateToProcess, ++pollLevel, watermark)
      this.filterNames = newFilters
        .map((f) => f.name)
        .filter((value, index, self) => {
          // Remove duplicates
          return self.findIndex((x) => x === value) === index
        })

      algokit.Config.logger.debug(
        `Poll level ${pollLevel}: Found ${stateChangeCount} pending state changes and applied them to get ${newFilters.length} filters; syncing...`,
      )

      subscribedTransactions = subscribedTransactions.concat(await subscribe(newFilters))
    }

    await this.dynamicConfig.filterStatePersistence.set(filterState)

    return {
      syncedRoundRange: pollMetadata.syncedRoundRange,
      newWatermark: pollMetadata.newWatermark,
      currentRound: pollMetadata.currentRound,
      blockMetadata: pollMetadata.blockMetadata,
      subscribedTransactions: subscribedTransactions.sort(
        (a, b) => a['confirmed-round']! - b['confirmed-round']! || a['intra-round-offset']! - b['intra-round-offset']!,
      ),
    }
  }

  appendFilterState(stateChange: Partial<T>) {
    this.pendingStateChanges.push({ action: 'append', stateChange })
  }

  deleteFilterState(stateChange: (keyof T)[]) {
    this.pendingStateChanges.push({
      action: 'delete',
      stateChange: stateChange.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Partial<T>),
    })
  }

  setFilterState(stateChange: Partial<T>) {
    this.pendingStateChanges.push({ action: 'set', stateChange })
  }
}
