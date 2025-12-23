[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / SubscribedTransaction

# Interface: SubscribedTransaction

[types/subscription](../modules/types_subscription.md).SubscribedTransaction

The common model used to expose a transaction that is returned from a subscription.

Substantively, based on the Indexer  [`TransactionResult` model](https://dev.algorand.co/reference/rest-apis/indexer#transaction) format with some modifications to:
* Add the `parentTransactionId` field so inner transactions have a reference to their parent
* Override the type of `inner-txns` to be `SubscribedTransaction[]` so inner transactions (recursively) get these extra fields too
* Add emitted ARC-28 events via `arc28Events`
* Balance changes in algo or assets

## Hierarchy

- `Transaction`

  ↳ **`SubscribedTransaction`**

## Table of contents

### Properties

- [applicationTransaction](types_subscription.SubscribedTransaction.md#applicationtransaction)
- [arc28Events](types_subscription.SubscribedTransaction.md#arc28events)
- [assetConfigTransaction](types_subscription.SubscribedTransaction.md#assetconfigtransaction)
- [assetFreezeTransaction](types_subscription.SubscribedTransaction.md#assetfreezetransaction)
- [assetTransferTransaction](types_subscription.SubscribedTransaction.md#assettransfertransaction)
- [authAddr](types_subscription.SubscribedTransaction.md#authaddr)
- [balanceChanges](types_subscription.SubscribedTransaction.md#balancechanges)
- [closeRewards](types_subscription.SubscribedTransaction.md#closerewards)
- [closingAmount](types_subscription.SubscribedTransaction.md#closingamount)
- [confirmedRound](types_subscription.SubscribedTransaction.md#confirmedround)
- [createdAppId](types_subscription.SubscribedTransaction.md#createdappid)
- [createdAssetId](types_subscription.SubscribedTransaction.md#createdassetid)
- [fee](types_subscription.SubscribedTransaction.md#fee)
- [filtersMatched](types_subscription.SubscribedTransaction.md#filtersmatched)
- [firstValid](types_subscription.SubscribedTransaction.md#firstvalid)
- [genesisHash](types_subscription.SubscribedTransaction.md#genesishash)
- [genesisId](types_subscription.SubscribedTransaction.md#genesisid)
- [globalStateDelta](types_subscription.SubscribedTransaction.md#globalstatedelta)
- [group](types_subscription.SubscribedTransaction.md#group)
- [heartbeatTransaction](types_subscription.SubscribedTransaction.md#heartbeattransaction)
- [id](types_subscription.SubscribedTransaction.md#id)
- [innerTxns](types_subscription.SubscribedTransaction.md#innertxns)
- [intraRoundOffset](types_subscription.SubscribedTransaction.md#intraroundoffset)
- [keyregTransaction](types_subscription.SubscribedTransaction.md#keyregtransaction)
- [lastValid](types_subscription.SubscribedTransaction.md#lastvalid)
- [lease](types_subscription.SubscribedTransaction.md#lease)
- [localStateDelta](types_subscription.SubscribedTransaction.md#localstatedelta)
- [logs](types_subscription.SubscribedTransaction.md#logs)
- [note](types_subscription.SubscribedTransaction.md#note)
- [parentIntraRoundOffset](types_subscription.SubscribedTransaction.md#parentintraroundoffset)
- [parentTransactionId](types_subscription.SubscribedTransaction.md#parenttransactionid)
- [paymentTransaction](types_subscription.SubscribedTransaction.md#paymenttransaction)
- [receiverRewards](types_subscription.SubscribedTransaction.md#receiverrewards)
- [rekeyTo](types_subscription.SubscribedTransaction.md#rekeyto)
- [roundTime](types_subscription.SubscribedTransaction.md#roundtime)
- [sender](types_subscription.SubscribedTransaction.md#sender)
- [senderRewards](types_subscription.SubscribedTransaction.md#senderrewards)
- [signature](types_subscription.SubscribedTransaction.md#signature)
- [stateProofTransaction](types_subscription.SubscribedTransaction.md#stateprooftransaction)
- [txType](types_subscription.SubscribedTransaction.md#txtype)

## Properties

### applicationTransaction

• `Optional` **applicationTransaction**: `TransactionApplication`

#### Inherited from

IndexerTransaction.applicationTransaction

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:24

___

### arc28Events

• `Optional` **arc28Events**: [`EmittedArc28Event`](types_arc_28.EmittedArc28Event.md)[]

Any ARC-28 events emitted from an app call.

#### Defined in

[src/types/subscription.ts:173](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L173)

___

### assetConfigTransaction

• `Optional` **assetConfigTransaction**: `TransactionAssetConfig`

#### Inherited from

IndexerTransaction.assetConfigTransaction

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:25

___

### assetFreezeTransaction

• `Optional` **assetFreezeTransaction**: `TransactionAssetFreeze`

#### Inherited from

IndexerTransaction.assetFreezeTransaction

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:26

___

### assetTransferTransaction

• `Optional` **assetTransferTransaction**: `TransactionAssetTransfer`

#### Inherited from

IndexerTransaction.assetTransferTransaction

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:27

___

### authAddr

• `Optional` **authAddr**: `Address`

\[sgnr\] this is included with signed transactions when the signing address does not equal the sender. The backend can use this to ensure that auth addr is equal to the accounts auth addr.

#### Inherited from

IndexerTransaction.authAddr

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:33

___

### balanceChanges

• `Optional` **balanceChanges**: [`BalanceChange`](types_subscription.BalanceChange.md)[]

The balance changes in the transaction.

#### Defined in

[src/types/subscription.ts:177](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L177)

___

### closeRewards

• `Optional` **closeRewards**: `bigint`

\[rc\] rewards applied to close-remainder-to account.

#### Inherited from

IndexerTransaction.closeRewards

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:37

___

### closingAmount

• `Optional` **closingAmount**: `bigint`

\[ca\] closing amount for transaction.

#### Inherited from

IndexerTransaction.closingAmount

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:41

___

### confirmedRound

• `Optional` **confirmedRound**: `bigint`

Round when the transaction was confirmed.

#### Inherited from

IndexerTransaction.confirmedRound

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:45

___

### createdAppId

• `Optional` **createdAppId**: `bigint`

Specifies an application index (ID) if an application was created with this transaction.

#### Inherited from

IndexerTransaction.createdAppId

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:49

___

### createdAssetId

• `Optional` **createdAssetId**: `bigint`

Specifies an asset index (ID) if an asset was created with this transaction.

#### Inherited from

IndexerTransaction.createdAssetId

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:53

___

### fee

• **fee**: `bigint`

\[fee\] Transaction fee.

#### Inherited from

IndexerTransaction.fee

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:57

___

### filtersMatched

• `Optional` **filtersMatched**: `string`[]

The names of any filters that matched the given transaction to result in it being 'subscribed'.

#### Defined in

[src/types/subscription.ts:175](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L175)

___

### firstValid

• **firstValid**: `bigint`

\[fv\] First valid round for this transaction.

#### Inherited from

IndexerTransaction.firstValid

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:61

___

### genesisHash

• `Optional` **genesisHash**: `Uint8Array`

\[gh\] Hash of genesis block.

#### Inherited from

IndexerTransaction.genesisHash

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:65

___

### genesisId

• `Optional` **genesisId**: `string`

\[gen\] genesis block ID.

#### Inherited from

IndexerTransaction.genesisId

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:69

___

### globalStateDelta

• `Optional` **globalStateDelta**: `StateDelta`

#### Inherited from

IndexerTransaction.globalStateDelta

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:135

___

### group

• `Optional` **group**: `Uint8Array`

\[grp\] Base64 encoded byte array of a sha512/256 digest. When present indicates that this transaction is part of a transaction group and the value is the sha512/256 hash of the transactions in that group.

#### Inherited from

IndexerTransaction.group

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:73

___

### heartbeatTransaction

• `Optional` **heartbeatTransaction**: `TransactionHeartbeat`

#### Inherited from

IndexerTransaction.heartbeatTransaction

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:29

___

### id

• **id**: `string`

Transaction ID

#### Overrides

IndexerTransaction.id

#### Defined in

[src/types/subscription.ts:165](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L165)

___

### innerTxns

• `Optional` **innerTxns**: [`SubscribedTransaction`](types_subscription.SubscribedTransaction.md)[]

Inner transactions produced by application execution.

#### Overrides

IndexerTransaction.innerTxns

#### Defined in

[src/types/subscription.ts:171](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L171)

___

### intraRoundOffset

• `Optional` **intraRoundOffset**: `number`

Offset into the round where this transaction was confirmed.

#### Inherited from

IndexerTransaction.intraRoundOffset

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:81

___

### keyregTransaction

• `Optional` **keyregTransaction**: `TransactionKeyreg`

#### Inherited from

IndexerTransaction.keyregTransaction

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:82

___

### lastValid

• **lastValid**: `bigint`

\[lv\] Last valid round for this transaction.

#### Inherited from

IndexerTransaction.lastValid

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:86

___

### lease

• `Optional` **lease**: `Uint8Array`

\[lx\] Base64 encoded 32-byte array. Lease enforces mutual exclusion of transactions.  If this field is nonzero, then once the transaction is confirmed, it acquires the lease identified by the (Sender, Lease) pair of the transaction until the LastValid round passes.  While this transaction possesses the lease, no other transaction specifying this lease can be confirmed.

#### Inherited from

IndexerTransaction.lease

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:90

___

### localStateDelta

• `Optional` **localStateDelta**: `AccountStateDelta`[]

\[ld\] Local state key/value changes for the application being executed by this transaction.

#### Inherited from

IndexerTransaction.localStateDelta

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:134

___

### logs

• `Optional` **logs**: `Uint8Array`[]

\[lg\] Logs for the application being executed by this transaction.

#### Inherited from

IndexerTransaction.logs

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:139

___

### note

• `Optional` **note**: `Uint8Array`

\[note\] Free form data.

#### Inherited from

IndexerTransaction.note

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:94

___

### parentIntraRoundOffset

• `Optional` **parentIntraRoundOffset**: `number`

The intra-round offset of the parent of this transaction (if it's an inner transaction).

#### Defined in

[src/types/subscription.ts:167](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L167)

___

### parentTransactionId

• `Optional` **parentTransactionId**: `string`

The transaction ID of the parent of this transaction (if it's an inner transaction).

#### Defined in

[src/types/subscription.ts:169](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L169)

___

### paymentTransaction

• `Optional` **paymentTransaction**: `TransactionPayment`

#### Inherited from

IndexerTransaction.paymentTransaction

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:95

___

### receiverRewards

• `Optional` **receiverRewards**: `bigint`

\[rr\] rewards applied to receiver account.

#### Inherited from

IndexerTransaction.receiverRewards

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:99

___

### rekeyTo

• `Optional` **rekeyTo**: `Address`

\[rekey\] when included in a valid transaction, the accounts auth addr will be updated with this value and future signatures must be signed with the key represented by this address.

#### Inherited from

IndexerTransaction.rekeyTo

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:103

___

### roundTime

• `Optional` **roundTime**: `number`

Time when the block this transaction is in was confirmed.

#### Inherited from

IndexerTransaction.roundTime

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:107

___

### sender

• **sender**: `string`

\[snd\] Sender's address.

#### Inherited from

IndexerTransaction.sender

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:111

___

### senderRewards

• `Optional` **senderRewards**: `bigint`

\[rs\] rewards applied to sender account.

#### Inherited from

IndexerTransaction.senderRewards

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:115

___

### signature

• `Optional` **signature**: `TransactionSignature`

#### Inherited from

IndexerTransaction.signature

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:116

___

### stateProofTransaction

• `Optional` **stateProofTransaction**: `TransactionStateProof`

#### Inherited from

IndexerTransaction.stateProofTransaction

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:28

___

### txType

• **txType**: ``"pay"`` \| ``"keyreg"`` \| ``"acfg"`` \| ``"axfer"`` \| ``"afrz"`` \| ``"appl"`` \| ``"stpf"`` \| ``"hb"``

\[type\] Indicates what type of transaction this is. Different types have different fields.

Valid types, and where their fields are stored:
* \[pay\] payment-transaction
* \[keyreg\] keyreg-transaction
* \[acfg\] asset-config-transaction
* \[axfer\] asset-transfer-transaction
* \[afrz\] asset-freeze-transaction
* \[appl\] application-transaction
* \[stpf\] state-proof-transaction
* \[hb\] heartbeat-transaction

#### Inherited from

IndexerTransaction.txType

#### Defined in

node_modules/@algorandfoundation/algokit-utils/packages/indexer_client/src/models/transaction.d.ts:130
