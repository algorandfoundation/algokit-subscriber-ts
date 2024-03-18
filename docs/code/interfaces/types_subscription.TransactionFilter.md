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
- [maxAmount](types_subscription.TransactionFilter.md#maxamount)
- [methodSignature](types_subscription.TransactionFilter.md#methodsignature)
- [methodSignatures](types_subscription.TransactionFilter.md#methodsignatures)
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

[types/subscription.ts:153](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L153)

___

### appCreate

• `Optional` **appCreate**: `boolean`

Filter to transactions that are creating an app.

#### Defined in

[types/subscription.ts:134](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L134)

___

### appId

• `Optional` **appId**: `number`

Filter to transactions against the app with the given ID.

#### Defined in

[types/subscription.ts:132](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L132)

___

### appOnComplete

• `Optional` **appOnComplete**: `ApplicationOnComplete` \| `ApplicationOnComplete`[]

Filter to transactions that have given on complete(s).

#### Defined in

[types/subscription.ts:136](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L136)

___

### arc28Events

• `Optional` **arc28Events**: \{ `eventName`: `string` ; `groupName`: `string`  }[]

Filter to app transactions that emit the given ARC-28 events.
Note: the definitions for these events must be passed in to the subscription config via `arc28Events`.

#### Defined in

[types/subscription.ts:157](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L157)

___

### assetCreate

• `Optional` **assetCreate**: `boolean`

Filter to transactions that are creating an asset.

#### Defined in

[types/subscription.ts:140](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L140)

___

### assetId

• `Optional` **assetId**: `number`

Filter to transactions against the asset with the given ID.

#### Defined in

[types/subscription.ts:138](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L138)

___

### maxAmount

• `Optional` **maxAmount**: `number`

Filter to transactions where the amount being transferred is less than
or equal to the given maximum (microAlgos or decimal units of an ASA if type: axfer).

#### Defined in

[types/subscription.ts:146](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L146)

___

### methodSignature

• `Optional` **methodSignature**: `string`

Filter to app transactions that have the given ARC-0004 method selector for
the given method signature as the first app argument.

#### Defined in

[types/subscription.ts:149](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L149)

___

### methodSignatures

• `Optional` **methodSignatures**: `string`[]

Filter to app transactions that match one of the given ARC-0004 method selectors as the first app argument.

#### Defined in

[types/subscription.ts:151](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L151)

___

### minAmount

• `Optional` **minAmount**: `number`

Filter to transactions where the amount being transferred is greater
than or equal to the given minimum (microAlgos or decimal units of an ASA if type: axfer).

#### Defined in

[types/subscription.ts:143](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L143)

___

### notePrefix

• `Optional` **notePrefix**: `string`

Filter to transactions with a note having the given prefix.

#### Defined in

[types/subscription.ts:130](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L130)

___

### receiver

• `Optional` **receiver**: `string`

Filter to transactions being received by the specified address.

#### Defined in

[types/subscription.ts:128](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L128)

___

### sender

• `Optional` **sender**: `string`

Filter to transactions sent from the specified address.

#### Defined in

[types/subscription.ts:126](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L126)

___

### type

• `Optional` **type**: `TransactionType`

Filter based on the given transaction type.

#### Defined in

[types/subscription.ts:124](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L124)
