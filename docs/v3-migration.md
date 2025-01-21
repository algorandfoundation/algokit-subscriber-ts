# v3 migration

This release updates the subscriber library to support `algosdk@3`. As a result the majority of the changes are to support the latest version of algosdk.

For further information about `algosdk@3`, see [migration guide for algosdk@3](https://github.com/algorand/js-algorand-sdk/blob/develop/v2_TO_v3_MIGRATION_GUIDE.md).

[The release details are available here](https://github.com/algorandfoundation/algokit-subscriber-ts/releases/tag/v3.0.0)

## Migrating

### Step 1 - Update transaction filters

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

### Step 2 - Update usages of SubscribedTransaction

Previously `SubscribedTransaction` extended `TransactionResult` from `@algorandfoundation/algokit-utils`, however now utils leverages the `algosdk@3` types directly. As a result `SubscribedTransaction` now extends `algosdk.indexerModels.Transaction` from `algosdk@3`. The changes needed to support this are described below.

1. Convert kebab cased fields to camel case

```typescript
/**** Before ****/
transactionResult['asset-transfer-transaction']

/**** After ****/
transactionResult.assetTransferTransaction
```

2. Convert the transaction type field `txType` to an optional string

TODO: Change the example

```typescript
/**** Before ****/
transactionResult['tx-type'] = TransactionType.axfer

/**** After ****/
transactionResult.txType = 'axfer'
```

3. Convert number fields to bigint

TODO: Change the example

```typescript
/**** Before ****/
transactionResult['created-application-index'] === 1196727051

/**** After ****/
transactionResult.createdApplicationIndex = 1196727051n
```

### Step 3 - Update usages of BlockData

Previously subscriber leveraged a custom `BlockData` type, as `algosdk@2` didn't export a suitable one. Now that `algosdk@3` does, `algosdk.BlockResponse` replaces `BlockData`, which ensure we follow the pattern of leveraging `algosdk` where applicable. The main changes needed to support this are described below.

1. `BlockData` uses short algod field names where as `BlockResponse` uses more user friendly field names. You will need to update the field names to match the new type.

```typescript
/**** Before ****/
interface Block {
  /** Genesis ID to which this block belongs. */
  gen: string
  /** Genesis hash to which this block belongs. */
  gh: Uint8Array
}

/**** After ****/
export declare class BlockHeader implements Encodable {
  /**
   * Genesis ID to which this block belongs.
   */
  genesisID: string
  /**
   * Genesis hash to which this block belongs.
   */
  genesisHash: Uint8Array
}
```

2. The `Block` type is now split into `header` and `payset`. The `payset` is the array of all the signed transactions in the block. The `header` contains the block header data such as the round, genesis ID, and genesis hash.

```typescript
/**** Before ****/
block.rnd
block.gen
block.txns
/**** After ****/
block.header.round
block.header.genesisID
block.payset
```

3. Similar to transaction types, you need to convert any number fields to bigint

```typescript
/**** Before ****/
block.rnd === 1196727051
/**** After ****/
blockHeader.round = 1196727051n
```

### Step 4 - Convert usages of BlockMetadata

Moving from subscriber-ts@1 to subscriber-ts@2, the type `BlockMetadata` hasn't changed much, you only need to convert number fields to bigint.

```typescript
/**** Before ****/
blockMetadata.round === 1196727051
/**** After ****/
blockMetadata.round = 1196727051n
```

### Step 5 - Handle bigint serialization

Since all number fields are now `bigint`, the default `JSON.stringify` will no longer work. You may have to create a custom JSON serializer to handle the bigint values. Below is an example of how to do this.

```typescript
export const asJson = (value: unknown) => JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)
```

- Document parentTransactionId fix. Describe new behaviour + give example of how to keep the same behaviour
- getBlockTransactions
- getIndexerTransactionFromAlgodTransaction
- blockDataToBlockMetadata. Should this be renamed to blockResponseToBlockMetadata
- extractBalanceChangesFromBlockTransaction
- extractBalanceChangesFromIndexerTransaction
- Others...
