[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / BlockRewards

# Interface: BlockRewards

[types/subscription](../modules/types_subscription.md).BlockRewards

## Table of contents

### Properties

- [feeSink](types_subscription.BlockRewards.md#feesink)
- [rewardsCalculationRound](types_subscription.BlockRewards.md#rewardscalculationround)
- [rewardsLevel](types_subscription.BlockRewards.md#rewardslevel)
- [rewardsPool](types_subscription.BlockRewards.md#rewardspool)
- [rewardsRate](types_subscription.BlockRewards.md#rewardsrate)
- [rewardsResidue](types_subscription.BlockRewards.md#rewardsresidue)

## Properties

### feeSink

• **feeSink**: `string`

FeeSink is an address that accepts transaction fees, it can only spend to the incentive pool.

#### Defined in

[types/subscription.ts:73](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L73)

___

### rewardsCalculationRound

• **rewardsCalculationRound**: `number`

number of leftover MicroAlgos after the distribution of rewards-rate MicroAlgos for every reward unit in the next round.

#### Defined in

[types/subscription.ts:75](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L75)

___

### rewardsLevel

• **rewardsLevel**: `number`

How many rewards, in MicroAlgos, have been distributed to each RewardUnit of MicroAlgos since genesis.

#### Defined in

[types/subscription.ts:77](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L77)

___

### rewardsPool

• **rewardsPool**: `string`

RewardsPool is an address that accepts periodic injections from the fee-sink and continually redistributes them as rewards.

#### Defined in

[types/subscription.ts:79](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L79)

___

### rewardsRate

• **rewardsRate**: `number`

Number of new MicroAlgos added to the participation stake from rewards at the next round.

#### Defined in

[types/subscription.ts:81](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L81)

___

### rewardsResidue

• **rewardsResidue**: `number` \| `bigint`

Number of leftover MicroAlgos after the distribution of RewardsRate/rewardUnits MicroAlgos for every reward unit in the next round.

#### Defined in

[types/subscription.ts:83](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L83)
