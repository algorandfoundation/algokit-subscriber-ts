import type { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk from 'algosdk'
import ABIValue = algosdk.ABIValue

/**
 * The definition of metadata for an ARC-28 event per https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0028.md#event.
 */
export interface Arc28Event {
  /** The name of the event */
  name: string
  /** Optional, user-friendly description for the event */
  desc?: string
  /** The arguments of the event, in order */
  args: Array<{
    /** The type of the argument */
    type: string
    /** Optional, user-friendly name for the argument */
    name?: string
    /** Optional, user-friendly description for the argument */
    desc?: string
  }>
}

/** An ARC-28 event to be processed */
export interface Arc28EventToProcess {
  /** The name of the ARC-28 event group the event belongs to */
  groupName: string
  /** The name of the ARC-28 event that was triggered */
  eventName: string
  /** The signature of the event e.g. `EventName(type1,type2)` */
  eventSignature: string
  /** The 4-byte hex prefix for the event */
  eventPrefix: string
  /** The ARC-28 definition of the event */
  eventDefinition: Arc28Event
}

/** An emitted ARC-28 event extracted from an app call log. */
export interface EmittedArc28Event extends Arc28EventToProcess {
  /** The ordered arguments extracted from the event that was emitted */
  args: ABIValue[]
  /** The named arguments extracted from the event that was emitted (where the arguments had a name defined) */
  argsByName: Record<string, ABIValue>
}

/** Specifies a group of ARC-28 event definitions along with instructions for when to attempt to process the events. */
export interface Arc28EventGroup {
  /** The name to designate for this group of events. */
  groupName: string
  /** Optional list of app IDs that this event should apply to */
  processForAppIds?: number[]
  /** Optional predicate to indicate if these ARC-28 events should be processed for the given transaction */
  processTransaction?: (transaction: TransactionResult) => boolean
  /** Whether or not to silently (with warning log) continue if an error is encountered processing the ARC-28 event data; default = false */
  continueOnError?: boolean
  /** The list of ARC-28 event definitions */
  events: Arc28Event[]
}
