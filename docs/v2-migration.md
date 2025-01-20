# v2 migration

This release updates subscriber to support algosdk@3. As a result the majority of the changes are to support this library. For further information about algosdk@3, see migration guide for algosdk@3.

View the release details here -->

Steps:

### Step 1 - Update transaction filters

Since type typings in subscriber-ts@2 are now aligned with algosdk@3, all number fields are now `bigint`. As a result, any transaction filter that passes a number must be converted to a bigint.

```typescript
/**** Before ****/
      filters: [
        {
          name: 'usdc',
          filter: {
            type: TransactionType.axfer,
            assetId: 31566704, // MainNet: USDC
            minAmount: 1_000_000, // $1
          },
        },
      ],
/**** After ****/
      filters: [
        {
          name: 'usdc',
          filter: {
            type: TransactionType.axfer,
            assetId: 31566704n, // MainNet: USDC
            minAmount: 1_000_000n, // $1
          },
        },
      ],
```

### Step 2 - Update usages on SubscribedTransaction

In subscriber-ts@1, the type `SubscribedTransaction` extends the `TransactionResult` from algokit-utils-ts. In subscriber-ts@2, the type `SubscribedTransaction` extends the type `algosdk.indexerModels.Transaction` from algosdk@3. There are some changes you need to make to your code to support this change.

1. Convert kebab cased fields to camel case

```typescript
/**** Before ****/
transactionResult['asset-transfer-transaction']
/**** After ****/
transactionResult.assetTransferTransaction
```

2. Convert the transaction type field `txType` to optional string

```typescript
/**** Before ****/
transactionResult['tx-type'] = TransactionType.axfer
/**** After ****/
transactionResult.txType = 'axfer'
```

3. Convert number fields to bigint

```typescript
/**** Before ****/
transactionResult['created-application-index'] === 1196727051
/**** After ****/
transactionResult.createdApplicationIndex = 1196727051n
```

### Step 3 - Convert usages for BlockData

In subscriber-ts@2, the type `BlockData` is now replaced by `algosdk.BlockResponse`. All the types under it are replaced by their equivalent algosdk@3 types. If you are using the `BlockData` type in your code, you will need to update it to use `algosdk.BlockResponse`. There are some notable changes you need to make.

1. `BlockData` uses short field names where `BlockResponse` uses user friendly field names. You will need to update the field names to match the new type.

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

2. The type `Block` is now split into `header` and `payset`. The `payset` is the array of all the signed transactions in the block. The `header` contains the block header data such as the round, genesis ID, and genesis hash.

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
