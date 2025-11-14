[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / ParticipationUpdates

# Interface: ParticipationUpdates

[types/subscription](../modules/types_subscription.md).ParticipationUpdates

## Table of contents

### Properties

- [absentParticipationAccounts](types_subscription.ParticipationUpdates.md#absentparticipationaccounts)
- [expiredParticipationAccounts](types_subscription.ParticipationUpdates.md#expiredparticipationaccounts)

## Properties

### absentParticipationAccounts

• `Optional` **absentParticipationAccounts**: `string`[]

(partupabs) a list of online accounts that need to be suspended.

#### Defined in

[src/types/subscription.ts:146](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L146)

___

### expiredParticipationAccounts

• `Optional` **expiredParticipationAccounts**: `string`[]

(partupdrmv) a list of online accounts that needs to be converted to offline
since their participation key expired.

#### Defined in

[src/types/subscription.ts:152](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L152)
