[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / BlockUpgradeVote

# Interface: BlockUpgradeVote

[types/subscription](../modules/types_subscription.md).BlockUpgradeVote

## Table of contents

### Properties

- [upgradeApprove](types_subscription.BlockUpgradeVote.md#upgradeapprove)
- [upgradeDelay](types_subscription.BlockUpgradeVote.md#upgradedelay)
- [upgradePropose](types_subscription.BlockUpgradeVote.md#upgradepropose)

## Properties

### upgradeApprove

• `Optional` **upgradeApprove**: `boolean`

(upgradeyes) Indicates a yes vote for the current proposal.

#### Defined in

[types/subscription.ts:129](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L129)

___

### upgradeDelay

• `Optional` **upgradeDelay**: `number` \| `bigint`

(upgradedelay) Indicates the time between acceptance and execution.

#### Defined in

[types/subscription.ts:134](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L134)

___

### upgradePropose

• `Optional` **upgradePropose**: `string`

(upgradeprop) Indicates a proposed upgrade.

#### Defined in

[types/subscription.ts:139](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L139)
