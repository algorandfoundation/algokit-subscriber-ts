[@algorandfoundation/algokit-subscriber](../README.md) / types/subscription

# Module: types/subscription

## Table of contents

### Interfaces

- [SubscriptionConfig](../interfaces/types_subscription.SubscriptionConfig.md)
- [SubscriptionConfigEvent](../interfaces/types_subscription.SubscriptionConfigEvent.md)
- [TransactionFilter](../interfaces/types_subscription.TransactionFilter.md)
- [TransactionSubscriptionParams](../interfaces/types_subscription.TransactionSubscriptionParams.md)
- [TransactionSubscriptionResult](../interfaces/types_subscription.TransactionSubscriptionResult.md)

### Type Aliases

- [SubscribedTransaction](types_subscription.md#subscribedtransaction)
- [TypedAsyncEventListener](types_subscription.md#typedasynceventlistener)

## Type Aliases

### SubscribedTransaction

Ƭ **SubscribedTransaction**: `TransactionResult` & \{ `parentTransactionId?`: `string` ; `state-proof-transaction?`: \{ `message`: \{ `block-headers-commitment`: `string` ; `first-attested-round`: `number` ; `latest-attested-round`: `number` ; `ln-proven-weight`: `number` ; `voters-commitment`: `string`  } ; `state-proof`: \{ `part-proofs`: \{ `hash-factory`: \{ `hash-type`: `number`  } ; `path`: `string`[] ; `tree-depth`: `number`  } ; `positions-to-reveal`: `number`[] ; `reveals`: \{ `participant`: \{ `verifier`: \{ `commitment`: `string` ; `key-lifetime`: `number`  } ; `weight`: `number`  } ; `position`: `number` ; `sig-slot`: \{ `lower-sig-weight`: `number` ; `signature`: \{ `falcon-signature`: `string` ; `merkle-array-index`: `number` ; `proof`: \{ `hash-factory`: \{ `hash-type`: `number`  } ; `path`: `string`[] ; `tree-depth`: `number`  } ; `verifying-key`: `string`  }  }  }[] ; `salt-version`: `number` ; `sig-commit`: `string` ; `sig-proofs`: \{ `hash-factory`: \{ `hash-type`: `number`  } ; `path`: `string`[] ; `tree-depth`: `number`  } ; `signed-weight`: `number`  } ; `state-proof-type`: `number`  }  }

#### Defined in

[types/subscription.ts:4](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L4)

___

### TypedAsyncEventListener

Ƭ **TypedAsyncEventListener**\<`T`\>: (`event`: `T`, `eventName`: `string` \| `symbol`) => `Promise`\<`void`\> \| `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`event`, `eventName`): `Promise`\<`void`\> \| `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `eventName` | `string` \| `symbol` |

##### Returns

`Promise`\<`void`\> \| `void`

#### Defined in

[types/subscription.ts:192](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L192)
