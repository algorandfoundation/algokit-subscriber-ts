[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / SubscribedTransaction

# Class: SubscribedTransaction

[types/subscription](../modules/types_subscription.md).SubscribedTransaction

The common model used to expose a transaction that is returned from a subscription.

Substantively, based on the Indexer  [`TransactionResult` model](https://developer.algorand.org/docs/rest-apis/indexer/#transaction) format with some modifications to:
* Add the `parentTransactionId` field so inner transactions have a reference to their parent
* Override the type of `inner-txns` to be `SubscribedTransaction[]` so inner transactions (recursively) get these extra fields too
* Add emitted ARC-28 events via `arc28Events`
* Balance changes in algo or assets

## Hierarchy

- `Transaction`

  ↳ **`SubscribedTransaction`**

## Table of contents

### Constructors

- [constructor](types_subscription.SubscribedTransaction.md#constructor)

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
- [createdApplicationIndex](types_subscription.SubscribedTransaction.md#createdapplicationindex)
- [createdAssetIndex](types_subscription.SubscribedTransaction.md#createdassetindex)
- [fee](types_subscription.SubscribedTransaction.md#fee)
- [filtersMatched](types_subscription.SubscribedTransaction.md#filtersmatched)
- [firstValid](types_subscription.SubscribedTransaction.md#firstvalid)
- [genesisHash](types_subscription.SubscribedTransaction.md#genesishash)
- [genesisId](types_subscription.SubscribedTransaction.md#genesisid)
- [globalStateDelta](types_subscription.SubscribedTransaction.md#globalstatedelta)
- [group](types_subscription.SubscribedTransaction.md#group)
- [id](types_subscription.SubscribedTransaction.md#id)
- [innerTxns](types_subscription.SubscribedTransaction.md#innertxns)
- [intraRoundOffset](types_subscription.SubscribedTransaction.md#intraroundoffset)
- [keyregTransaction](types_subscription.SubscribedTransaction.md#keyregtransaction)
- [lastValid](types_subscription.SubscribedTransaction.md#lastvalid)
- [lease](types_subscription.SubscribedTransaction.md#lease)
- [localStateDelta](types_subscription.SubscribedTransaction.md#localstatedelta)
- [logs](types_subscription.SubscribedTransaction.md#logs)
- [note](types_subscription.SubscribedTransaction.md#note)
- [parentTransactionId](types_subscription.SubscribedTransaction.md#parenttransactionid)
- [paymentTransaction](types_subscription.SubscribedTransaction.md#paymenttransaction)
- [receiverRewards](types_subscription.SubscribedTransaction.md#receiverrewards)
- [rekeyTo](types_subscription.SubscribedTransaction.md#rekeyto)
- [rootIntraRoundOffset](types_subscription.SubscribedTransaction.md#rootintraroundoffset)
- [rootTransactionId](types_subscription.SubscribedTransaction.md#roottransactionid)
- [roundTime](types_subscription.SubscribedTransaction.md#roundtime)
- [sender](types_subscription.SubscribedTransaction.md#sender)
- [senderRewards](types_subscription.SubscribedTransaction.md#senderrewards)
- [signature](types_subscription.SubscribedTransaction.md#signature)
- [stateProofTransaction](types_subscription.SubscribedTransaction.md#stateprooftransaction)
- [txType](types_subscription.SubscribedTransaction.md#txtype)

### Accessors

- [encodingSchema](types_subscription.SubscribedTransaction.md#encodingschema)

### Methods

- [getEncodingSchema](types_subscription.SubscribedTransaction.md#getencodingschema)
- [toEncodingData](types_subscription.SubscribedTransaction.md#toencodingdata)
- [fromEncodingData](types_subscription.SubscribedTransaction.md#fromencodingdata)

## Constructors

### constructor

• **new SubscribedTransaction**(`«destructured»`): [`SubscribedTransaction`](types_subscription.SubscribedTransaction.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Omit`\<[`SubscribedTransaction`](types_subscription.SubscribedTransaction.md), ``"getEncodingSchema"`` \| ``"toEncodingData"``\> |

#### Returns

[`SubscribedTransaction`](types_subscription.SubscribedTransaction.md)

#### Overrides

algosdk.indexerModels.Transaction.constructor

#### Defined in

[src/types/subscription.ts:179](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L179)

## Properties

### applicationTransaction

• `Optional` **applicationTransaction**: `TransactionApplication`

Fields for application transactions.
Definition:
data/transactions/application.go : ApplicationCallTxnFields

#### Inherited from

algosdk.indexerModels.Transaction.applicationTransaction

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2094

___

### arc28Events

• `Optional` **arc28Events**: [`EmittedArc28Event`](../interfaces/types_arc_28.EmittedArc28Event.md)[]

Any ARC-28 events emitted from an app call.

#### Defined in

[src/types/subscription.ts:173](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L173)

___

### assetConfigTransaction

• `Optional` **assetConfigTransaction**: `TransactionAssetConfig`

Fields for asset allocation, re-configuration, and destruction.
A zero value for asset-id indicates asset creation.
A zero value for the params indicates asset destruction.
Definition:
data/transactions/asset.go : AssetConfigTxnFields

#### Inherited from

algosdk.indexerModels.Transaction.assetConfigTransaction

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2102

___

### assetFreezeTransaction

• `Optional` **assetFreezeTransaction**: `TransactionAssetFreeze`

Fields for an asset freeze transaction.
Definition:
data/transactions/asset.go : AssetFreezeTxnFields

#### Inherited from

algosdk.indexerModels.Transaction.assetFreezeTransaction

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2108

___

### assetTransferTransaction

• `Optional` **assetTransferTransaction**: `TransactionAssetTransfer`

Fields for an asset transfer transaction.
Definition:
data/transactions/asset.go : AssetTransferTxnFields

#### Inherited from

algosdk.indexerModels.Transaction.assetTransferTransaction

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2114

___

### authAddr

• `Optional` **authAddr**: `Address`

(sgnr) this is included with signed transactions when the signing address does
not equal the sender. The backend can use this to ensure that auth addr is equal
to the accounts auth addr.

#### Inherited from

algosdk.indexerModels.Transaction.authAddr

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2120

___

### balanceChanges

• `Optional` **balanceChanges**: [`BalanceChange`](../interfaces/types_subscription.BalanceChange.md)[]

The balance changes in the transaction.

#### Defined in

[src/types/subscription.ts:177](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L177)

___

### closeRewards

• `Optional` **closeRewards**: `bigint`

(rc) rewards applied to close-remainder-to account.

#### Inherited from

algosdk.indexerModels.Transaction.closeRewards

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2124

___

### closingAmount

• `Optional` **closingAmount**: `bigint`

(ca) closing amount for transaction.

#### Inherited from

algosdk.indexerModels.Transaction.closingAmount

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2128

___

### confirmedRound

• `Optional` **confirmedRound**: `bigint`

Round when the transaction was confirmed.

#### Inherited from

algosdk.indexerModels.Transaction.confirmedRound

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2132

___

### createdApplicationIndex

• `Optional` **createdApplicationIndex**: `bigint`

Specifies an application index (ID) if an application was created with this
transaction.

#### Inherited from

algosdk.indexerModels.Transaction.createdApplicationIndex

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2137

___

### createdAssetIndex

• `Optional` **createdAssetIndex**: `bigint`

Specifies an asset index (ID) if an asset was created with this transaction.

#### Inherited from

algosdk.indexerModels.Transaction.createdAssetIndex

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2141

___

### fee

• **fee**: `bigint`

(fee) Transaction fee.

#### Inherited from

algosdk.indexerModels.Transaction.fee

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2076

___

### filtersMatched

• `Optional` **filtersMatched**: `string`[]

The names of any filters that matched the given transaction to result in it being 'subscribed'.

#### Defined in

[src/types/subscription.ts:175](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L175)

___

### firstValid

• **firstValid**: `bigint`

(fv) First valid round for this transaction.

#### Inherited from

algosdk.indexerModels.Transaction.firstValid

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2080

___

### genesisHash

• `Optional` **genesisHash**: `Uint8Array`

(gh) Hash of genesis block.

#### Inherited from

algosdk.indexerModels.Transaction.genesisHash

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2145

___

### genesisId

• `Optional` **genesisId**: `string`

(gen) genesis block ID.

#### Inherited from

algosdk.indexerModels.Transaction.genesisId

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2149

___

### globalStateDelta

• `Optional` **globalStateDelta**: `EvalDeltaKeyValue`[]

(gd) Global state key/value changes for the application being executed by this
transaction.

#### Inherited from

algosdk.indexerModels.Transaction.globalStateDelta

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2154

___

### group

• `Optional` **group**: `Uint8Array`

(grp) Base64 encoded byte array of a sha512/256 digest. When present indicates
that this transaction is part of a transaction group and the value is the
sha512/256 hash of the transactions in that group.

#### Inherited from

algosdk.indexerModels.Transaction.group

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2160

___

### id

• `Optional` **id**: `string`

Transaction ID

#### Inherited from

algosdk.indexerModels.Transaction.id

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2164

___

### innerTxns

• `Optional` **innerTxns**: [`SubscribedTransaction`](types_subscription.SubscribedTransaction.md)[]

Inner transactions produced by application execution.

#### Overrides

algosdk.indexerModels.Transaction.innerTxns

#### Defined in

[src/types/subscription.ts:171](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L171)

___

### intraRoundOffset

• `Optional` **intraRoundOffset**: `number`

Offset into the round where this transaction was confirmed.

#### Inherited from

algosdk.indexerModels.Transaction.intraRoundOffset

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2172

___

### keyregTransaction

• `Optional` **keyregTransaction**: `TransactionKeyreg`

Fields for a keyreg transaction.
Definition:
data/transactions/keyreg.go : KeyregTxnFields

#### Inherited from

algosdk.indexerModels.Transaction.keyregTransaction

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2178

___

### lastValid

• **lastValid**: `bigint`

(lv) Last valid round for this transaction.

#### Inherited from

algosdk.indexerModels.Transaction.lastValid

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2084

___

### lease

• `Optional` **lease**: `Uint8Array`

(lx) Base64 encoded 32-byte array. Lease enforces mutual exclusion of
transactions. If this field is nonzero, then once the transaction is confirmed,
it acquires the lease identified by the (Sender, Lease) pair of the transaction
until the LastValid round passes. While this transaction possesses the lease, no
other transaction specifying this lease can be confirmed.

#### Inherited from

algosdk.indexerModels.Transaction.lease

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2186

___

### localStateDelta

• `Optional` **localStateDelta**: `AccountStateDelta`[]

(ld) Local state key/value changes for the application being executed by this
transaction.

#### Inherited from

algosdk.indexerModels.Transaction.localStateDelta

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2191

___

### logs

• `Optional` **logs**: `Uint8Array`[]

(lg) Logs for the application being executed by this transaction.

#### Inherited from

algosdk.indexerModels.Transaction.logs

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2195

___

### note

• `Optional` **note**: `Uint8Array`

(note) Free form data.

#### Inherited from

algosdk.indexerModels.Transaction.note

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2199

___

### parentTransactionId

• `Optional` **parentTransactionId**: `string`

The transaction ID of the parent of this transaction (if it's an inner transaction).

#### Defined in

[src/types/subscription.ts:169](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L169)

___

### paymentTransaction

• `Optional` **paymentTransaction**: `TransactionPayment`

Fields for a payment transaction.
Definition:
data/transactions/payment.go : PaymentTxnFields

#### Inherited from

algosdk.indexerModels.Transaction.paymentTransaction

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2205

___

### receiverRewards

• `Optional` **receiverRewards**: `bigint`

(rr) rewards applied to receiver account.

#### Inherited from

algosdk.indexerModels.Transaction.receiverRewards

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2209

___

### rekeyTo

• `Optional` **rekeyTo**: `Address`

(rekey) when included in a valid transaction, the accounts auth addr will be
updated with this value and future signatures must be signed with the key
represented by this address.

#### Inherited from

algosdk.indexerModels.Transaction.rekeyTo

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2215

___

### rootIntraRoundOffset

• `Optional` **rootIntraRoundOffset**: `number`

The intra-round offset of the root transaction of this transaction (if it's an inner transaction).

#### Defined in

[src/types/subscription.ts:167](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L167)

___

### rootTransactionId

• `Optional` **rootTransactionId**: `string`

The transaction ID of the root transaction of this transaction (if it's an inner transaction).

#### Defined in

[src/types/subscription.ts:165](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L165)

___

### roundTime

• `Optional` **roundTime**: `number`

Time when the block this transaction is in was confirmed.

#### Inherited from

algosdk.indexerModels.Transaction.roundTime

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2219

___

### sender

• **sender**: `string`

(snd) Sender's address.

#### Inherited from

algosdk.indexerModels.Transaction.sender

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2088

___

### senderRewards

• `Optional` **senderRewards**: `bigint`

(rs) rewards applied to sender account.

#### Inherited from

algosdk.indexerModels.Transaction.senderRewards

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2223

___

### signature

• `Optional` **signature**: `TransactionSignature`

Validation signature associated with some data. Only one of the signatures
should be provided.

#### Inherited from

algosdk.indexerModels.Transaction.signature

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2228

___

### stateProofTransaction

• `Optional` **stateProofTransaction**: `TransactionStateProof`

Fields for a state proof transaction.
Definition:
data/transactions/stateproof.go : StateProofTxnFields

#### Inherited from

algosdk.indexerModels.Transaction.stateProofTransaction

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2234

___

### txType

• `Optional` **txType**: `string`

(type) Indicates what type of transaction this is. Different types have
different fields.
Valid types, and where their fields are stored:
* (pay) payment-transaction
* (keyreg) keyreg-transaction
* (acfg) asset-config-transaction
* (axfer) asset-transfer-transaction
* (afrz) asset-freeze-transaction
* (appl) application-transaction
* (stpf) state-proof-transaction

#### Inherited from

algosdk.indexerModels.Transaction.txType

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2247

## Accessors

### encodingSchema

• `get` **encodingSchema**(): `Schema`

#### Returns

`Schema`

#### Inherited from

algosdk.indexerModels.Transaction.encodingSchema

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2072

## Methods

### getEncodingSchema

▸ **getEncodingSchema**(): `Schema`

#### Returns

`Schema`

#### Inherited from

algosdk.indexerModels.Transaction.getEncodingSchema

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2360

___

### toEncodingData

▸ **toEncodingData**(): `Map`\<`string`, `unknown`\>

#### Returns

`Map`\<`string`, `unknown`\>

#### Inherited from

algosdk.indexerModels.Transaction.toEncodingData

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2361

___

### fromEncodingData

▸ **fromEncodingData**(`data`): `Transaction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `unknown` |

#### Returns

`Transaction`

#### Inherited from

algosdk.indexerModels.Transaction.fromEncodingData

#### Defined in

node_modules/algosdk/dist/types/client/v2/indexer/models/types.d.ts:2362
