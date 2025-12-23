[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / BalanceChangeRole

# Enumeration: BalanceChangeRole

[types/subscription](../modules/types_subscription.md).BalanceChangeRole

The role that an account was playing for a given balance change.

## Table of contents

### Enumeration Members

- [AssetCreator](types_subscription.BalanceChangeRole.md#assetcreator)
- [AssetDestroyer](types_subscription.BalanceChangeRole.md#assetdestroyer)
- [CloseTo](types_subscription.BalanceChangeRole.md#closeto)
- [Receiver](types_subscription.BalanceChangeRole.md#receiver)
- [Sender](types_subscription.BalanceChangeRole.md#sender)

## Enumeration Members

### AssetCreator

• **AssetCreator** = ``"AssetCreator"``

Account was creating an asset and holds the full asset supply

#### Defined in

[src/types/subscription.ts:201](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L201)

___

### AssetDestroyer

• **AssetDestroyer** = ``"AssetDestroyer"``

Account was destroying an asset and has removed the full asset supply from circulation.
A balance change with this role will always have a 0 amount and use the asset manager address.

#### Defined in

[src/types/subscription.ts:205](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L205)

___

### CloseTo

• **CloseTo** = ``"CloseTo"``

Account was having an asset amount closed to it

#### Defined in

[src/types/subscription.ts:199](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L199)

___

### Receiver

• **Receiver** = ``"Receiver"``

Account was receiving a transaction

#### Defined in

[src/types/subscription.ts:197](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L197)

___

### Sender

• **Sender** = ``"Sender"``

Account was sending a transaction (sending asset and/or spending fee if asset `0`)

#### Defined in

[src/types/subscription.ts:195](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L195)
