[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / BalanceChangeRole

# Enumeration: BalanceChangeRole

[types/subscription](../modules/types_subscription.md).BalanceChangeRole

The role that an account was playing for a given balance change.

## Table of contents

### Enumeration Members

- [CloseTo](types_subscription.BalanceChangeRole.md#closeto)
- [Receiver](types_subscription.BalanceChangeRole.md#receiver)
- [Sender](types_subscription.BalanceChangeRole.md#sender)

## Enumeration Members

### CloseTo

• **CloseTo** = ``2``

Account was having an asset amount closed to it

#### Defined in

[types/subscription.ts:66](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L66)

___

### Receiver

• **Receiver** = ``1``

Account was receiving a transaction

#### Defined in

[types/subscription.ts:64](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L64)

___

### Sender

• **Sender** = ``0``

Account was sending a transaction (sending asset and/or spending fee if asset `0`)

#### Defined in

[types/subscription.ts:62](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L62)
