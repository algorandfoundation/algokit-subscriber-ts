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
- [arc28Events](types_subscription.TransactionFilter.md#arc28events)
- [assetCreate](types_subscription.TransactionFilter.md#assetcreate)
- [assetId](types_subscription.TransactionFilter.md#assetid)
- [balanceChanges](types_subscription.TransactionFilter.md#balancechanges)
- [customFilter](types_subscription.TransactionFilter.md#customfilter)
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

Filter to app transactions that meet the given app arguments predicate.

#### Type declaration

▸ (`appCallArguments?`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `appCallArguments?` | `Uint8Array`[] |

##### Returns

`boolean`

#### Defined in

[types/subscription.ts:254](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L254)

___

### appCreate

• `Optional` **appCreate**: `boolean`

Filter to transactions that are creating an app.

#### Defined in

[types/subscription.ts:237](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L237)

___

### appId

• `Optional` **appId**: `number` \| `bigint` \| `number`[] \| `bigint`[]

Filter to transactions against the app with the given ID(s).

#### Defined in

[types/subscription.ts:235](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L235)

___

### appOnComplete

• `Optional` **appOnComplete**: `ApplicationOnComplete` \| `ApplicationOnComplete`[]

Filter to transactions that have given on complete(s).

#### Defined in

[types/subscription.ts:239](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L239)

___

### arc28Events

• `Optional` **arc28Events**: \{ `eventName`: `string` ; `groupName`: `string`  }[]

Filter to app transactions that emit the given ARC-28 events.
Note: the definitions for these events must be passed in to the subscription config via `arc28Events`.

#### Defined in

[types/subscription.ts:258](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L258)

___

### assetCreate

• `Optional` **assetCreate**: `boolean`

Filter to transactions that are creating an asset.

#### Defined in

[types/subscription.ts:243](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L243)

___

### assetId

• `Optional` **assetId**: `number` \| `bigint` \| `number`[] \| `bigint`[]

Filter to transactions against the asset with the given ID(s).

#### Defined in

[types/subscription.ts:241](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L241)

___

### balanceChanges

• `Optional` **balanceChanges**: \{ `address?`: `string` \| `string`[] ; `assetId?`: `number` \| `bigint` \| `number`[] \| `bigint`[] ; `maxAbsoluteAmount?`: `number` \| `bigint` ; `maxAmount?`: `number` \| `bigint` ; `minAbsoluteAmount?`: `number` \| `bigint` ; `minAmount?`: `number` \| `bigint` ; `role?`: [`BalanceChangeRole`](../enums/types_subscription.BalanceChangeRole.md) \| [`BalanceChangeRole`](../enums/types_subscription.BalanceChangeRole.md)[]  }[]

Filter to transactions that result in balance changes that match one or more of the given set of balance changes.

#### Defined in

[types/subscription.ts:260](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L260)

___

### customFilter

• `Optional` **customFilter**: (`transaction`: [`SubscribedTransaction`](../modules/types_subscription.md#subscribedtransaction)) => `boolean`

Catch-all custom filter to filter for things that the rest of the filters don't provide.

#### Type declaration

▸ (`transaction`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `transaction` | [`SubscribedTransaction`](../modules/types_subscription.md#subscribedtransaction) |

##### Returns

`boolean`

#### Defined in

[types/subscription.ts:277](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L277)

___

### maxAmount

• `Optional` **maxAmount**: `number` \| `bigint`

Filter to transactions where the amount being transferred is less than
or equal to the given maximum (microAlgos or decimal units of an ASA if type: axfer).

#### Defined in

[types/subscription.ts:249](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L249)

___

### methodSignature

• `Optional` **methodSignature**: `string` \| `string`[]

Filter to app transactions that have the given ARC-0004 method selector(s) for
the given method signature as the first app argument.

#### Defined in

[types/subscription.ts:252](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L252)

___

### minAmount

• `Optional` **minAmount**: `number` \| `bigint`

Filter to transactions where the amount being transferred is greater
than or equal to the given minimum (microAlgos or decimal units of an ASA if type: axfer).

#### Defined in

[types/subscription.ts:246](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L246)

___

### notePrefix

• `Optional` **notePrefix**: `string`

Filter to transactions with a note having the given prefix.

#### Defined in

[types/subscription.ts:233](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L233)

___

### receiver

• `Optional` **receiver**: `string` \| `string`[]

Filter to transactions being received by the specified address(es).

#### Defined in

[types/subscription.ts:231](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L231)

___

### sender

• `Optional` **sender**: `string` \| `string`[]

Filter to transactions sent from the specified address(es).

#### Defined in

[types/subscription.ts:229](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L229)

___

### type

• `Optional` **type**: `TransactionType` \| `TransactionType`[]

Filter based on the given transaction type(s).

#### Defined in

[types/subscription.ts:227](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L227)
