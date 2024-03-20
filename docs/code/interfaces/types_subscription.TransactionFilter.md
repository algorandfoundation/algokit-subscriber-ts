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

[types/subscription.ts:191](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L191)

___

### appCreate

• `Optional` **appCreate**: `boolean`

Filter to transactions that are creating an app.

#### Defined in

[types/subscription.ts:172](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L172)

___

### appId

• `Optional` **appId**: `number`

Filter to transactions against the app with the given ID.

#### Defined in

[types/subscription.ts:170](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L170)

___

### appOnComplete

• `Optional` **appOnComplete**: `ApplicationOnComplete` \| `ApplicationOnComplete`[]

Filter to transactions that have given on complete(s).

#### Defined in

[types/subscription.ts:174](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L174)

___

### arc28Events

• `Optional` **arc28Events**: \{ `eventName`: `string` ; `groupName`: `string`  }[]

Filter to app transactions that emit the given ARC-28 events.
Note: the definitions for these events must be passed in to the subscription config via `arc28Events`.

#### Defined in

[types/subscription.ts:195](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L195)

___

### assetCreate

• `Optional` **assetCreate**: `boolean`

Filter to transactions that are creating an asset.

#### Defined in

[types/subscription.ts:178](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L178)

___

### assetId

• `Optional` **assetId**: `number`

Filter to transactions against the asset with the given ID.

#### Defined in

[types/subscription.ts:176](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L176)

___

### maxAmount

• `Optional` **maxAmount**: `number`

Filter to transactions where the amount being transferred is less than
or equal to the given maximum (microAlgos or decimal units of an ASA if type: axfer).

#### Defined in

[types/subscription.ts:184](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L184)

___

### methodSignature

• `Optional` **methodSignature**: `string`

Filter to app transactions that have the given ARC-0004 method selector for
the given method signature as the first app argument.

#### Defined in

[types/subscription.ts:187](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L187)

___

### methodSignatures

• `Optional` **methodSignatures**: `string`[]

Filter to app transactions that match one of the given ARC-0004 method selectors as the first app argument.

#### Defined in

[types/subscription.ts:189](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L189)

___

### minAmount

• `Optional` **minAmount**: `number`

Filter to transactions where the amount being transferred is greater
than or equal to the given minimum (microAlgos or decimal units of an ASA if type: axfer).

#### Defined in

[types/subscription.ts:181](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L181)

___

### notePrefix

• `Optional` **notePrefix**: `string`

Filter to transactions with a note having the given prefix.

#### Defined in

[types/subscription.ts:168](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L168)

___

### receiver

• `Optional` **receiver**: `string`

Filter to transactions being received by the specified address.

#### Defined in

[types/subscription.ts:166](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L166)

___

### sender

• `Optional` **sender**: `string`

Filter to transactions sent from the specified address.

#### Defined in

[types/subscription.ts:164](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L164)

___

### type

• `Optional` **type**: `TransactionType`

Filter based on the given transaction type.

#### Defined in

[types/subscription.ts:162](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L162)
