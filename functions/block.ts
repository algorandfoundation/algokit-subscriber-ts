import { ApplicationOnComplete, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import algosdk, { EncodedTransaction, OnApplicationComplete, Transaction, TransactionType } from 'algosdk'

export function getAlgodTransactionFromBlockTransaction(
  bt: BlockTransaction,
  b: Block,
):
  | {
      transaction: Transaction
      createdAssetId?: number
      createdAppId?: number
      assetCloseAmount?: number
      closeAmount?: number
      block: Block
      blockOffset: number
    }
  | undefined {
  const txn = bt.txn

  if (txn.type === 'stpf' || txn.type === 'keyreg') {
    return undefined
  }

  bt.txn.gh = Buffer.from(b.gh)
  bt.txn.gen = b.gen
  return {
    transaction: Transaction.from_obj_for_encoding(bt.txn),
    createdAssetId: bt.caid,
    createdAppId: bt.apid,
    assetCloseAmount: bt.aca,
    closeAmount: bt.ca,
    block: b,
    blockOffset: b.txns.indexOf(bt),
  }

  /*
  let t: Transaction
  switch (txn.type) {
    case 'pay':
      t = new Transaction({
        lease: txn.lx,
        type: TransactionType.pay,
        from: algosdk.encodeAddress(txn.snd),
        note: new Uint8Array(txn.note),
        reKeyTo: txn.rekey ? algosdk.encodeAddress(txn.rekey) : undefined,
        amount: txn.amt,
        to: algosdk.encodeAddress(txn.rcv),
        closeRemainderTo: txn.close ? algosdk.encodeAddress(txn.close) : undefined,
        fee: txn.fee ?? 0,
        flatFee: true,
        firstRound: txn.fv,
        lastRound: txn.lv,
        genesisID: b.gen,
        genesisHash: Buffer.from(b.gh).toString('base64'),
        suggestedParams: {
          fee: txn.fee ?? 0,
          flatFee: true,
          firstRound: txn.fv,
          lastRound: txn.lv,
          genesisID: b.gen,
          genesisHash: Buffer.from(b.gh).toString('base64'),
        },
      })
      break
    case 'axfer':
      t = new Transaction({
        lease: txn.lx,
        type: TransactionType.axfer,
        from: algosdk.encodeAddress(txn.snd),
        note: new Uint8Array(txn.note),
        reKeyTo: txn.rekey ? algosdk.encodeAddress(txn.rekey) : undefined,
        amount: txn.aamt,
        assetIndex: txn.xaid,
        to: algosdk.encodeAddress(txn.arcv),
        assetRevocationTarget: txn.asnd ? algosdk.encodeAddress(txn.asnd) : undefined,
        closeRemainderTo: txn.aclose ? algosdk.encodeAddress(txn.aclose) : undefined,
        fee: txn.fee ?? 0,
        flatFee: true,
        firstRound: txn.fv,
        lastRound: txn.lv,
        genesisID: b.gen,
        genesisHash: Buffer.from(b.gh).toString('base64'),
        suggestedParams: {
          fee: txn.fee ?? 0,
          flatFee: true,
          firstRound: txn.fv,
          lastRound: txn.lv,
          genesisID: b.gen,
          genesisHash: Buffer.from(b.gh).toString('base64'),
        },
      })
      break
    case 'afrz':
      t = new Transaction({
        lease: txn.lx,
        type: TransactionType.afrz,
        from: algosdk.encodeAddress(txn.snd),
        note: new Uint8Array(txn.note),
        reKeyTo: txn.rekey ? algosdk.encodeAddress(txn.rekey) : undefined,
        freezeAccount: algosdk.encodeAddress(txn.fadd),
        freezeState: txn.afrz,
        assetIndex: txn.faid,
        fee: txn.fee ?? 0,
        flatFee: true,
        firstRound: txn.fv,
        lastRound: txn.lv,
        genesisID: b.gen,
        genesisHash: Buffer.from(b.gh).toString('base64'),
        suggestedParams: {
          fee: txn.fee ?? 0,
          flatFee: true,
          firstRound: txn.fv,
          lastRound: txn.lv,
          genesisID: b.gen,
          genesisHash: Buffer.from(b.gh).toString('base64'),
        },
      })
      break
    case 'acfg':
      t = new Transaction({
        lease: txn.lx,
        type: TransactionType.acfg,
        from: algosdk.encodeAddress(txn.snd),
        note: new Uint8Array(txn.note),
        reKeyTo: txn.rekey ? algosdk.encodeAddress(txn.rekey) : undefined,
        assetDecimals: txn.apar?.dc ?? 0,
        assetTotal: txn.apar?.t ?? 0,
        assetDefaultFrozen: txn.apar?.df ?? false,
        assetMetadataHash: txn.apar?.am ? new Uint8Array(txn.apar.am) : undefined,
        assetName: txn.apar?.an,
        assetURL: txn.apar?.au,
        assetUnitName: txn.apar?.un,
        assetManager: txn.apar?.m ? algosdk.encodeAddress(txn.apar.m) : undefined,
        assetReserve: txn.apar?.r ? algosdk.encodeAddress(txn.apar.r) : undefined,
        assetClawback: txn.apar?.c ? algosdk.encodeAddress(txn.apar.c) : undefined,
        assetFreeze: txn.apar?.f ? algosdk.encodeAddress(txn.apar.f) : undefined,
        assetIndex: txn.caid,
        fee: txn.fee ?? 0,
        flatFee: true,
        firstRound: txn.fv,
        lastRound: txn.lv,
        genesisID: b.gen,
        genesisHash: Buffer.from(b.gh).toString('base64'),
        suggestedParams: {
          fee: txn.fee ?? 0,
          flatFee: true,
          firstRound: txn.fv,
          lastRound: txn.lv,
          genesisID: b.gen,
          genesisHash: Buffer.from(b.gh).toString('base64'),
        },
      })
      break
    case 'appl':
      t = new Transaction({
        lease: txn.lx,
        type: TransactionType.appl,
        from: algosdk.encodeAddress(txn.snd),
        note: new Uint8Array(txn.note),
        reKeyTo: txn.rekey ? algosdk.encodeAddress(txn.rekey) : undefined,
        appApprovalProgram: txn.apap,
        appClearProgram: txn.apsu,
        appGlobalByteSlices: txn.apgs?.nbs,
        appGlobalInts: txn.apgs?.nui,
        appIndex: txn.apid,
        appLocalByteSlices: txn.apls?.nbs,
        appLocalInts: txn.apls?.nui,
        appOnComplete: txn.apan,
        appAccounts: txn.apat?.map((a) => algosdk.encodeAddress(a)),
        appArgs: txn.apaa,
        appForeignApps: txn.apfa,
        appForeignAssets: txn.apas,
        boxes: txn.apbx?.map((b) => ({ appIndex: b.i ?? 0, name: b.n })),
        extraPages: txn.apep,
        fee: txn.fee ?? 0,
        flatFee: true,
        firstRound: txn.fv,
        lastRound: txn.lv,
        genesisID: b.gen,
        genesisHash: Buffer.from(b.gh).toString('base64'),
        suggestedParams: {
          fee: txn.fee ?? 0,
          flatFee: true,
          firstRound: txn.fv,
          lastRound: txn.lv,
          genesisID: b.gen,
          genesisHash: Buffer.from(b.gh).toString('base64'),
        },
      })
      break
    case 'keyreg':
    case 'stpf':
      return undefined
    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`Unsupported block transaction type ${(txn as any).type} in block ${b.rnd}`)
  }
  if (txn.grp) {
    t.group = Buffer.from(txn.grp)
  }

  return { transaction: t, createdAssetId: bt.caid, createdAppId: bt.apid, block: b }
  */
}

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

export function getIndexerTransactionFromAlgodTransaction(
  transaction: Transaction,
  block: Block,
  blockOffset: number,
  createdAssetId?: number,
  createdAppId?: number,
  assetCloseAmount?: number,
  closeAmount?: number,
): TransactionResult {
  if (!transaction.type) {
    throw new Error(`Received no transaction type for transaction ${transaction.txID()}`)
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  return {
    id: transaction.txID(),
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
                  'name-b64': encoder.encode(Buffer.from(transaction.assetName).toString('base64')),
                  'unit-name': transaction.assetUnitName,
                  'unit-name-b64': encoder.encode(Buffer.from(transaction.assetUnitName).toString('base64')),
                  url: transaction.assetURL,
                  'url-b64': encoder.encode(Buffer.from(transaction.assetURL).toString('base64')),
                  manager: transaction.assetManager ? algosdk.encodeAddress(transaction.assetManager.publicKey) : undefined,
                  reserve: transaction.assetReserve ? algosdk.encodeAddress(transaction.assetReserve.publicKey) : undefined,
                  clawback: transaction.assetClawback ? algosdk.encodeAddress(transaction.assetClawback.publicKey) : undefined,
                  freeze: transaction.assetFreeze ? algosdk.encodeAddress(transaction.assetFreeze.publicKey) : undefined,
                }
              : 'apar' in block.txns[blockOffset].txn
              ? {
                  manager: transaction.assetManager ? algosdk.encodeAddress(transaction.assetManager.publicKey) : undefined,
                  reserve: transaction.assetReserve ? algosdk.encodeAddress(transaction.assetReserve.publicKey) : undefined,
                  clawback: transaction.assetClawback ? algosdk.encodeAddress(transaction.assetClawback.publicKey) : undefined,
                  freeze: transaction.assetFreeze ? algosdk.encodeAddress(transaction.assetFreeze.publicKey) : undefined,
                }
              : undefined,
          }
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ({} as any),
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
            'application-args': transaction.appArgs?.map((a) => decoder.decode(a)),
            'extra-program-pages': transaction.extraPages,
            'foreign-apps': transaction.appForeignApps,
            'foreign-assets': transaction.appForeignAssets,
            'global-state-schema': block.txns[blockOffset].txn.apgs
              ? {
                  'num-byte-slice': transaction.appGlobalByteSlices,
                  'num-uint': transaction.appGlobalInts,
                }
              : undefined,
            'local-state-schema': block.txns[blockOffset].txn.apls
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
            'close-remainder-to': transaction.closeRemainderTo ? algosdk.encodeAddress(transaction.closeRemainderTo.publicKey) : undefined,
          }
        : undefined,
    'first-valid': transaction.firstRound,
    'last-valid': transaction.lastRound,
    'tx-type': transaction.type,
    fee: transaction.fee,
    sender: algosdk.encodeAddress(transaction.from.publicKey),
    'confirmed-round': block.rnd,
    'round-time': block.ts,
    'intra-round-offset': blockOffset,
    'created-asset-index': createdAssetId,
    'genesis-hash': Buffer.from(transaction.genesisHash).toString('base64'),
    'genesis-id': transaction.genesisID,
    group: transaction.group ? Buffer.from(transaction.group).toString('base64') : undefined,
    note: transaction.note ? Buffer.from(transaction.note).toString('utf-8') : undefined,
    lease: transaction.lease ? Buffer.from(transaction.lease).toString('base64') : undefined,
    'rekey-to': transaction.reKeyTo ? algosdk.encodeAddress(transaction.reKeyTo.publicKey) : undefined,
    'closing-amount': closeAmount,
    'created-application-index': createdAppId,
    // todo: do we need any of these?
    //"auth-addr"
    //"close-rewards"
    //"global-state-delta"
    //"inner-txns"
    //"keyreg-transaction"
    //"local-state-delta"
    //"receiver-rewards"
    //"sender-rewards"
    //logs
    //signature
  }
}

export interface Block {
  earn: number
  fees: Uint8Array
  frac: number
  gen: string
  gh: Uint8Array
  prev: Uint8Array
  proto: string
  rate: number
  /** Round number */
  rnd: number
  rwcalr: number
  rwd: Uint8Array
  seed: Uint8Array
  tc: number
  /** Round time (unix timestamp) */
  ts: number
  txn: Uint8Array
  txns: BlockTransaction[]
}

export interface BlockTransaction {
  //txn: BlockTransactionData
  txn: EncodedTransaction
  /** Asset ID when an asset is created by the transaction */
  caid?: number
  /** App ID when an app is created by the transaction */
  apid?: number
  /** Asset closing amount in decimal units */
  aca?: number
  /** Algo closing amount in microAlgos */
  ca?: number
  /** Has genesis id */
  hgi: boolean
}

// https://developer.algorand.org/docs/get-details/transactions/transactions/

export type BlockTransactionData =
  | BlockPaymentTransaction
  | BlockAssetConfigTransaction
  | BlockAssetTransferTransaction
  | BlockAssetFreezeTransaction
  | BlockApplicationCallTransaction
  | BlockKeyRegTransaction
  | BlockStateProofTransaction

export interface BlockPaymentTransaction extends BlockTransactionBase {
  /** TxType: Specifies the type of transaction. */
  type: 'pay'
  /** Receiver: The address of the account that receives the amount. */
  rcv: Uint8Array
  /** AssetAmount: The amount of the asset to be transferred. A zero amount transferred to self allocates that asset in the account's Asset map. */
  amt: number
  /** CloseRemainderTo: When set, it indicates that the transaction is requesting that the Sender account should be closed, and all remaining funds, after the fee and amount are paid, be transferred to this address. */
  close?: Uint8Array
}

export interface BlockAssetConfigTransaction extends BlockTransactionBase {
  /** TxType: Specifies the type of transaction. */
  type: 'acfg'
  /** ConfigAsset: For re-configure or destroy transactions, this is the unique asset ID. On asset creation, the ID is set to zero. */
  caid: number
  /** AssetParams: For destroy transactions this is not present. */
  apar?: {
    /** Total: The total number of base units of the asset to create. This number cannot be changed. */
    t: number
    /** Decimal: The number of digits to use after the decimal point when displaying the asset. */
    dc: number
    /** True to freeze holdings for this asset by default. */
    df: boolean
    /** UnitName: The name of a unit of this asset. Supplied on creation. Max size is 8 bytes. */
    un?: string
    /** AssetName: The name of the asset. Supplied on creation. Max size is 32 bytes. */
    an?: string
    /** URL: Specifies a URL where more information about the asset can be retrieved. Max size is 96 bytes. */
    au?: string
    /** MetaDataHash: This field is intended to be a 32-byte hash of some metadata that is relevant to your asset and/or asset holders. */
    am?: Buffer
    /** ManagerAddr: The address of the account that can manage the configuration of the asset and destroy it. */
    m?: Uint8Array
    /** ReserveAddr: The address of the account that holds the reserve (non-minted) units of the asset. This address has no specific authority in the protocol itself. */
    r?: Uint8Array
    /** FreezeAddr: The address of the account used to freeze holdings of this asset. If empty, freezing is not permitted. */
    f?: Uint8Array
    /** ClawbackAddr: The address of the account that can clawback holdings of this asset. If empty, clawback is not permitted. */
    c?: Uint8Array
  }
}

export interface BlockAssetTransferTransaction extends BlockTransactionBase {
  /** TxType: Specifies the type of transaction. */
  type: 'axfer'
  /** XferAsset: The unique ID of the asset to be transferred. */
  xaid: number
  /** AssetAmount: The amount of the asset to be transferred. A zero amount transferred to self allocates that asset in the account's Asset map. */
  aamt: number
  /** AssetSender: The sender of the transfer. The regular sender field should be used and this one set to the zero value for regular transfers between accounts. If this value is nonzero, it indicates a clawback transaction where the sender is the asset's clawback address and the asset sender is the address from which the funds will be withdrawn. */
  asnd: Uint8Array
  /** AssetReceiver: The recipient of the asset transfer. */
  arcv: Uint8Array
  /** AssetCloseTo: Specify this field to remove the asset holding from the sender account and reduce the account's minimum balance (i.e. opt-out of the asset).  */
  aclose?: Uint8Array
}

export interface BlockAssetFreezeTransaction extends BlockTransactionBase {
  /** TxType: Specifies the type of transaction. */
  type: 'afrz'
  /** FreezeAccount: The address of the account whose asset slot is being frozen or un-frozen. */
  fadd: Uint8Array
  /** FreezeAsset: The asset ID being frozen or un-frozen. */
  faid: number
  /** AssetFrozen: The new frozen value */
  afrz: boolean
}

export interface BlockTransactionBase {
  /** TxType: Specifies the type of transaction. This value is automatically generated using any of the developer tools. */
  type: string
  /** Fee: Paid by the sender to the FeeSink to prevent denial-of-service. The minimum fee on Algorand is currently 1000 microAlgos. */
  fee: number
  /** FirstValid: The first round for when the transaction is valid. If the transaction is sent prior to this round it will be rejected by the network. */
  fv: number
  /** GenesisHash: The hash of the genesis block of the network for which the transaction is valid. */
  gh: Uint8Array
  /** LastValid: The ending round for which the transaction is valid. After this round, the transaction will be rejected by the network. */
  lv: number
  /** Sender: The address of the account that pays the fee and amount. */
  snd: Uint8Array
  /** GenesisID: The human-readable string that identifies the network for the transaction. The genesis ID is found in the genesis block. */
  gen: string
  /** Group: The group specifies that the transaction is part of a group and, if so, specifies the hash of the transaction group. */
  grp: Uint8Array
  /** Lease: 	A lease enforces mutual exclusion of transactions. If this field is nonzero, then once the transaction is confirmed, it acquires the lease identified by the (Sender, Lease) pair of the transaction until the LastValid round passes. */
  lx?: Uint8Array
  /** Note: Any data up to 1000 bytes. */
  note: Uint8Array
  /** RekeyTo: Specifies the authorized address. This address will be used to authorize all future transactions. */
  rekey?: Uint8Array
}

export interface BlockApplicationCallTransaction extends BlockTransactionBase {
  /** TxType: Specifies the type of transaction. */
  type: 'appl'
  /** Application ID: ID of the application being configured or empty if creating. */
  apid: number
  /** OnComplete: Defines what additional actions occur with the transaction. See the OnComplete section of the TEAL spec for details. */
  apan: number
  /** Accounts: List of accounts in addition to the sender that may be accessed from the application's approval-program and clear-state-program. */
  apat?: Uint8Array[]
  /** Approval Program: Logic executed for every application transaction, except when on-completion is set to "clear". It can read and write global state for the application, as well as account-specific local state. Approval programs may reject the transaction. */
  apap?: Uint8Array
  /** App Arguments: Transaction specific arguments accessed from the application's approval-program and clear-state-program. */
  apaa?: Uint8Array[]
  /** Clear State Program: Logic executed for application transactions with on-completion set to "clear". It can read and write global state for the application, as well as account-specific local state. Clear state programs cannot reject the transaction. */
  apsu?: Uint8Array
  /** Foreign Apps: Lists the applications in addition to the application-id whose global states may be accessed by this application's approval-program and clear-state-program. The access is read-only. */
  apfa?: number[]
  /** Foreign Assets: Lists the applications in addition to the application-id whose global states may be accessed by this application's approval-program and clear-state-program. The access is read-only. */
  apas?: number[]
  /** GlobalStateSchema: Holds the maximum number of global state values defined within a StateSchema object. */
  apgs?: {
    /** Number Ints: Maximum number of integer values that may be stored in the [global || local] application key/value store. Immutable. */
    nui: number
    /** Number ByteSlices: Maximum number of byte slices values that may be stored in the [global || local] application key/value store. Immutable. */
    nbs: number
  }
  /** LocalStateSchema: Holds the maximum number of local state values defined within a StateSchema object. */
  apls?: {
    /** Number Ints: Maximum number of integer values that may be stored in the [global || local] application key/value store. Immutable. */
    nui: number
    /** Number ByteSlices: Maximum number of byte slices values that may be stored in the [global || local] application key/value store. Immutable. */
    nbs: number
  }
  /** ExtraProgramPages: Number of additional pages allocated to the application's approval and clear state programs. Each ExtraProgramPages is 2048 bytes. The sum of ApprovalProgram and ClearStateProgram may not exceed 2048*(1+ExtraProgramPages) bytes. */
  apep?: number
  /** Boxes: The boxes that should be made available for the runtime of the program. */
  apbx?: {
    /**
     * Index of the app ID in the foreign apps array
     */
    i: number

    /**
     * Box name
     */
    n: Uint8Array
  }[]
}

export interface BlockKeyRegTransaction extends BlockTransactionBase {
  /** TxType: Specifies the type of transaction. */
  type: 'keyreg'
  // todo: Add key reg fields
}

export interface BlockStateProofTransaction extends BlockTransactionBase {
  /** TxType: Specifies the type of transaction. */
  type: 'stpf'
  // todo: Add key reg fields
}
