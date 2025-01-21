# v3 migration

This release updates the subscriber library to support `algosdk@3`. As a result the majority of the changes are to support the latest version of algosdk.

For further information about `algosdk@3`, see [migration guide for algosdk@3](https://github.com/algorand/js-algorand-sdk/blob/develop/v2_TO_v3_MIGRATION_GUIDE.md).

[The release details are available here](https://github.com/algorandfoundation/algokit-subscriber-ts/releases/tag/v3.0.0)

## Migrating

### Step 1 - Update usages of `AlgorandSubscriber`

Since the types exported are now aligned with `algosdk@3`, relevant `number` fields are now `bigint`. As a result, any transaction filter that passes a `number` should now use a `bigint`.

```typescript
/**** Before ****/
const subscriber = new AlgorandSubscriber(
  {
    filters: [
      {
        name: 'usdc',
        filter: {
          type: TransactionType.axfer,
          assetId: 31566704,
          minAmount: 1_000_000,
        },
      },
    ],
    // ...
  },
  algorand.client.algod,
)

/**** After ****/
const subscriber = new AlgorandSubscriber(
  {
    filters: [
      {
        name: 'usdc',
        filter: {
          type: TransactionType.axfer,
          assetId: 31566704n, // Is now a bigint
          minAmount: 1_000_000n, // Is now a bigint
        },
      },
    ],
    // ...
  },
  algorand.client.algod,
)
```

The output of the methods in this class were changed significantly. They are now referencing a new `SubscribedTransaction` type. We will discuss it in the next step.

### Step 2 - Update usages of `SubscribedTransaction`

Previously `SubscribedTransaction` extended `TransactionResult` from `@algorandfoundation/algokit-utils`, however now `@algorandfoundation/algokit-utils` leverages the `algosdk@3` types directly. As a result `SubscribedTransaction` now extends `algosdk.indexerModels.Transaction` from `algosdk@3`. The changes needed to support this are described below.

- Convert kebab cased fields to camel case
- Convert the transaction type field `txType` to an optional string
- Convert number fields to bigint

```typescript
// The example below attemps to access data from an asset transfer transaction

/**** Before ****/
if ((transactionResult['tx-type'] = TransactionType.axfer)) {
  console.log('assetId', transactionResult['asset-transfer-transaction']['asset-id'])
}
// Result:
//   assetId: 31566704

/**** After ****/
if ((transactionResult.txType = 'axfer')) {
  console.log('assetId', transactionResult.assetTransferTransaction.assetId)
}
// Result:
//  assetId: 31566704n <- this is a bigint
```

### Step 3 - Update usages of `getBlockTransactions`

This function takes a block from `algod` and returns an array of `TransactionInBlock`. Both the input and output types have changed.

- Previously, the input type was a custom `BlockData` type, as `algosdk@2` didn't export a suitable one. Now that `algosdk@3` does, `algosdk.BlockResponse` replaces `BlockData`, which ensure we follow the pattern of leveraging `algosdk` where applicable. In `algosdk@3`, you can get the `algosdk.BlockResponse` directly from `algod` as below.

```typescript
/**** Before ****/
const blockData = {
  block: {
    rnd: 1196727051,
    gen: 'mainnet-v1.0',
    gh: new Uint8Array([1, 2, 3, 4, ...]),
    ...
  },
}
const blockTransactions = getBlockTransactions(blockData)


/**** After ****/
const block = algorand.client.algod.block(round).do()
const blockTransactions = getBlockTransactions(block)
```

- The output type is an array of `TransactionInBlock`. There were some changes to this type:
  - The `intraRoundOffset` field is the offset of the transaction within the round including inner transactions.
  - The `rootIntraRoundOffset` field is the intra-round offset of the root transaction if this is an inner transaction.
  - The `rootTransactionId` field is the ID of the root transaction if this is an inner transaction.
  - The `parentTransactionId` field is the ID of the parent transaction if this is an inner transaction.
    - In this release, we made a fix to this field, previously, it was the ID of the root transaction, now it is the ID of the immediate parent transaction.
  - The `blockTransaction` field is replaced with `signedTxnWithAD`. This is a part of the efford to align with `algosdk@3`. We will get into more details in the next step.

### Step 4 - Update usages of `BlockTransaction`

The type `BlockTransaction` was removed. It is replaced by `SignedTxnWithAD` from `algosdk@3`. The shape of `BlockTransaction` is what `algod` returns, while `SignedTxnWithAD` is processed by `algosdk@3`.

```typescript
// To get the created asset ID from a block transaction

/**** Before ****/
console.log('created asset ID', blockTransaction.caid)
// Result:
//   created asset ID: 31566704

/**** After ****/
console.log('created asset ID', signedTxnWithAD.applyData.configAsset)
// Result:
// created asset ID: 31566704n <- this is a bigint
```

```typescript
// To access the transaction sender

/**** Before ****/
console.log('transaction sender', blockTransaction.txn.snd)
// Result:
// transaction sender: 25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE

/**** After ****/
// The sender now has `Address` type
console.log('transaction sender', signedTxnWithAD.signedTxn.txn.sender.toString())
// Result:
// transaction sender: 25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE
```

### Step 5 - Update usages of `getIndexerTransactionFromAlgodTransaction`

This method takes a `TransactionInBlock` and returns a `SubscribedTransaction`. The changes needed to support this are described in Step 2 and Step 3.

### Step 4 - Update usages of `blockDataToBlockMetadata`

This method was renamed to `blockResponseToBlockMetadata`. It takes a `BlockResponse` and returns a `BlockMetadata`. The changes needed to support this are described below.

- Refer to step 3 for the changes to `BlockResponse`.
- The `BlockMetadata` has not changed much, except for some fields that were `number` previously are now `bigint`.

### Step 5 - Update usages of `extractBalanceChangesFromBlockTransaction`

This method takes a `SignedTxnWithAD` and returns an array of `BalanceChange`.

- The `SignedTxnWithAD` is taken from `algosdk@3`.
- The `BalanceChange` type has not changed much, except for some fields that were `number` previously are now `bigint`.

### Step 6 - Update usages of `extractBalanceChangesFromIndexerTransaction`

This method takes a `SubscribedTransaction` and returns an array of `BalanceChange`.

- The `SubscribedTransaction` is based on `algosdk.indexerModels.Transaction`.
- The `BalanceChange` type has not changed much, except for some fields that were `number` previously are now `bigint`.

### Step 7 - Handle bigint serialization

Since all number fields are now `bigint`, the default `JSON.stringify` will no longer work. You may have to create a custom JSON serializer to handle the bigint values. Below is an example of how to do this.

```typescript
export const asJson = (value: unknown) => JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)
```
