[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / TransactionFilter

# Interface: TransactionFilter

[types/subscription](../modules/types_subscription.md).TransactionFilter

Specify a filter to apply to find transactions of interest.

## Table of contents

### Properties

- [appCallArgumentsMatch](types_subscription.TransactionFilter.md#appcallargumentsmatch)
- [appCreate](types_subscription.TransactionFilter.md#appcreate)
- [appId](types_subscription.TransactionFilter.md#appid)
- [appOnComplete](types_subscription.TransactionFilter.md#apponcomplete)
- [assetCreate](types_subscription.TransactionFilter.md#assetcreate)
- [assetId](types_subscription.TransactionFilter.md#assetid)
- [maxAmount](types_subscription.TransactionFilter.md#maxamount)
- [methodSignature](types_subscription.TransactionFilter.md#methodsignature)
- [minAmount](types_subscription.TransactionFilter.md#minamount)
- [notePrefix](types_subscription.TransactionFilter.md#noteprefix)
- [receiver](types_subscription.TransactionFilter.md#receiver)
- [sender](types_subscription.TransactionFilter.md#sender)
- [type](types_subscription.TransactionFilter.md#type)

## Properties

### appCallArgumentsMatch

• `Optional` **appCallArgumentsMatch**: (`appCallArguments?`: `Uint8Array`[]) => `boolean`

#### Type declaration

▸ (`appCallArguments?`): `boolean`

Filter to app transactions that meet the given app arguments predicate.

##### Parameters

| Name | Type |
| :------ | :------ |
| `appCallArguments?` | `Uint8Array`[] |

##### Returns

`boolean`

#### Defined in

[types/subscription.ts:76](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L76)

___

### appCreate

• `Optional` **appCreate**: `boolean`

Filter to transactions that are creating an app.

#### Defined in

[types/subscription.ts:59](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L59)

___

### appId

• `Optional` **appId**: `number`

Filter to transactions against the app with the given ID.

#### Defined in

[types/subscription.ts:57](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L57)

___

### appOnComplete

• `Optional` **appOnComplete**: `ApplicationOnComplete` \| `ApplicationOnComplete`[]

Filter to transactions that have given on complete(s).

#### Defined in

[types/subscription.ts:61](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L61)

___

### assetCreate

• `Optional` **assetCreate**: `boolean`

Filter to transactions that are creating an asset.

#### Defined in

[types/subscription.ts:65](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L65)

___

### assetId

• `Optional` **assetId**: `number`

Filter to transactions against the asset with the given ID.

#### Defined in

[types/subscription.ts:63](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L63)

___

### maxAmount

• `Optional` **maxAmount**: `number`

Filter to transactions where the amount being transferred is less than
or equal to the given maximum (microAlgos or decimal units of an ASA).

#### Defined in

[types/subscription.ts:71](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L71)

___

### methodSignature

• `Optional` **methodSignature**: `string`

Filter to app transactions that have the given ARC-0004 method selector for
the given method signature as the first app argument.

#### Defined in

[types/subscription.ts:74](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L74)

___

### minAmount

• `Optional` **minAmount**: `number`

Filter to transactions where the amount being transferred is greater
than or equal to the given minimum (microAlgos or decimal units of an ASA).

#### Defined in

[types/subscription.ts:68](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L68)

___

### notePrefix

• `Optional` **notePrefix**: `string`

Filter to transactions with a note having the given prefix.

#### Defined in

[types/subscription.ts:55](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L55)

___

### receiver

• `Optional` **receiver**: `string`

Filter to transactions being received by the specified address.

#### Defined in

[types/subscription.ts:53](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L53)

___

### sender

• `Optional` **sender**: `string`

Filter to transactions sent from the specified address.

#### Defined in

[types/subscription.ts:51](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L51)

___

### type

• `Optional` **type**: `TransactionType`

Filter based on the given transaction type.

#### Defined in

[types/subscription.ts:49](https://github.com/MakerXStudio/algorand-indexer-poc/blob/main/src/types/subscription.ts#L49)
