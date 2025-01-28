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

• `Optional` **appCallArgumentsMatch**: (`appCallArguments?`: readonly `Uint8Array`[]) => `boolean`

Filter to app transactions that meet the given app arguments predicate.

#### Type declaration

▸ (`appCallArguments?`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `appCallArguments?` | readonly `Uint8Array`[] |

##### Returns

`boolean`

#### Defined in

[src/types/subscription.ts:339](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L339)

___

### appCreate

• `Optional` **appCreate**: `boolean`

Filter to transactions that are creating an app.

#### Defined in

[src/types/subscription.ts:322](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L322)

___

### appId

• `Optional` **appId**: `bigint` \| `bigint`[]

Filter to transactions against the app with the given ID(s).

#### Defined in

[src/types/subscription.ts:320](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L320)

___

### appOnComplete

• `Optional` **appOnComplete**: `ApplicationOnComplete` \| `ApplicationOnComplete`[]

Filter to transactions that have given on complete(s).

#### Defined in

[src/types/subscription.ts:324](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L324)

___

### arc28Events

• `Optional` **arc28Events**: \{ `eventName`: `string` ; `groupName`: `string`  }[]

Filter to app transactions that emit the given ARC-28 events.
Note: the definitions for these events must be passed in to the subscription config via `arc28Events`.

#### Defined in

[src/types/subscription.ts:343](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L343)

___

### assetCreate

• `Optional` **assetCreate**: `boolean`

Filter to transactions that are creating an asset.

#### Defined in

[src/types/subscription.ts:328](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L328)

___

### assetId

• `Optional` **assetId**: `bigint` \| `bigint`[]

Filter to transactions against the asset with the given ID(s).

#### Defined in

[src/types/subscription.ts:326](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L326)

___

### balanceChanges

• `Optional` **balanceChanges**: \{ `address?`: `string` \| `string`[] ; `assetId?`: `bigint` \| `bigint`[] ; `maxAbsoluteAmount?`: `number` \| `bigint` ; `maxAmount?`: `number` \| `bigint` ; `minAbsoluteAmount?`: `number` \| `bigint` ; `minAmount?`: `number` \| `bigint` ; `role?`: [`BalanceChangeRole`](../enums/types_subscription.BalanceChangeRole.md) \| [`BalanceChangeRole`](../enums/types_subscription.BalanceChangeRole.md)[]  }[]

Filter to transactions that result in balance changes that match one or more of the given set of balance changes.

#### Defined in

[src/types/subscription.ts:345](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L345)

___

### customFilter

• `Optional` **customFilter**: (`transaction`: [`SubscribedTransaction`](../classes/types_subscription.SubscribedTransaction.md)) => `boolean`

Catch-all custom filter to filter for things that the rest of the filters don't provide.

#### Type declaration

▸ (`transaction`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `transaction` | [`SubscribedTransaction`](../classes/types_subscription.SubscribedTransaction.md) |

##### Returns

`boolean`

#### Defined in

[src/types/subscription.ts:362](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L362)

___

### maxAmount

• `Optional` **maxAmount**: `number` \| `bigint`

Filter to transactions where the amount being transferred is less than
or equal to the given maximum (microAlgos or decimal units of an ASA if type: axfer).

#### Defined in

[src/types/subscription.ts:334](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L334)

___

### methodSignature

• `Optional` **methodSignature**: `string` \| `string`[]

Filter to app transactions that have the given ARC-0004 method selector(s) for
the given method signature as the first app argument.

#### Defined in

[src/types/subscription.ts:337](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L337)

___

### minAmount

• `Optional` **minAmount**: `number` \| `bigint`

Filter to transactions where the amount being transferred is greater
than or equal to the given minimum (microAlgos or decimal units of an ASA if type: axfer).

#### Defined in

[src/types/subscription.ts:331](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L331)

___

### notePrefix

• `Optional` **notePrefix**: `string`

Filter to transactions with a note having the given prefix.

#### Defined in

[src/types/subscription.ts:318](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L318)

___

### receiver

• `Optional` **receiver**: `string` \| `string`[]

Filter to transactions being received by the specified address(es).

#### Defined in

[src/types/subscription.ts:316](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L316)

___

### sender

• `Optional` **sender**: `string` \| `string`[]

Filter to transactions sent from the specified address(es).

#### Defined in

[src/types/subscription.ts:314](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L314)

___

### type

• `Optional` **type**: `TransactionType` \| `TransactionType`[]

Filter based on the given transaction type(s).

#### Defined in

[src/types/subscription.ts:312](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L312)
