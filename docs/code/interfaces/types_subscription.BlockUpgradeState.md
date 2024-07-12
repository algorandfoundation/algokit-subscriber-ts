[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / BlockUpgradeState

# Interface: BlockUpgradeState

[types/subscription](../modules/types_subscription.md).BlockUpgradeState

## Table of contents

### Properties

- [currentProtocol](types_subscription.BlockUpgradeState.md#currentprotocol)
- [nextProtocol](types_subscription.BlockUpgradeState.md#nextprotocol)
- [nextProtocolApprovals](types_subscription.BlockUpgradeState.md#nextprotocolapprovals)
- [nextProtocolSwitchOn](types_subscription.BlockUpgradeState.md#nextprotocolswitchon)
- [nextProtocolVoteBefore](types_subscription.BlockUpgradeState.md#nextprotocolvotebefore)

## Properties

### currentProtocol

• **currentProtocol**: `string`

Current protocol version

#### Defined in

[types/subscription.ts:88](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L88)

___

### nextProtocol

• `Optional` **nextProtocol**: `string`

The next proposed protocol version.

#### Defined in

[types/subscription.ts:90](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L90)

___

### nextProtocolApprovals

• `Optional` **nextProtocolApprovals**: `number`

Number of blocks which approved the protocol upgrade.

#### Defined in

[types/subscription.ts:92](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L92)

___

### nextProtocolSwitchOn

• `Optional` **nextProtocolSwitchOn**: `number`

Round on which the protocol upgrade will take effect.

#### Defined in

[types/subscription.ts:96](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L96)

___

### nextProtocolVoteBefore

• `Optional` **nextProtocolVoteBefore**: `number`

Deadline round for this protocol upgrade (No votes will be consider after this round).

#### Defined in

[types/subscription.ts:94](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L94)
