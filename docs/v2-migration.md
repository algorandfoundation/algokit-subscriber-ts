# v2 migration

This release updates subscriber to support algosdk@3. As a result the majority of the changes are to support this library. For further information about algosdk@3, see migration guide for algosdk@3.

View the release details here -->

Steps:

### Step 1 - Update transaction filters

1. Any transaction filter that passes a number, convert a bigint

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

A side affect of this change is that the default `JSON.stringify` will no longer work. You may have to create a custom JSON serializer to handle the bigint values.

```typescript
export const asJson = (value: unknown) => JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)
```

### Step 3 - Convert usages for BlockData

Type `BlockData` is now replaced by `algosdk.BlockResponse`. All the types under it are replaced by their equivalent algosdk@3 types.

1. Replace short-hand field names with user friendly field names

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

2. The type `Block` is now split into `header` and `payset`

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

3. Convert number fields to bigint

```typescript
/**** Before ****/
block.rnd === 1196727051
/**** After ****/
blockHeader.round = 1196727051n
```

### Step 4 - Convert usages of BlockMetadata

1. Convert number fields to bigint

```typescript
/**** Before ****/
blockMetadata.round === 1196727051
/**** After ****/
blockMetadata.round = 1196727051n
```
