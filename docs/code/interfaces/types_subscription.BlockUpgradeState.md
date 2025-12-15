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

[src/types/subscription.ts:90](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L90)

---

### nextProtocol

• `Optional` **nextProtocol**: `string`

The next proposed protocol version.

#### Defined in

[src/types/subscription.ts:92](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L92)

---

### nextProtocolApprovals

• `Optional` **nextProtocolApprovals**: `bigint`

Number of blocks which approved the protocol upgrade.

#### Defined in

[src/types/subscription.ts:94](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L94)

---

### nextProtocolSwitchOn

• `Optional` **nextProtocolSwitchOn**: `bigint`

Round on which the protocol upgrade will take effect.

#### Defined in

[src/types/subscription.ts:98](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L98)

---

### nextProtocolVoteBefore

• `Optional` **nextProtocolVoteBefore**: `bigint`

Deadline round for this protocol upgrade (No votes will be consider after this round).

#### Defined in

[src/types/subscription.ts:96](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L96)
