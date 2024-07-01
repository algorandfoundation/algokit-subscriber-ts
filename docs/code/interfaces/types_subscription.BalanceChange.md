[@algorandfoundation/algokit-subscriber](../README.md) / [types/subscription](../modules/types_subscription.md) / BalanceChange

# Interface: BalanceChange

[types/subscription](../modules/types_subscription.md).BalanceChange

Represents a balance change effect for a transaction.

## Table of contents

### Properties

- [address](types_subscription.BalanceChange.md#address)
- [amount](types_subscription.BalanceChange.md#amount)
- [assetId](types_subscription.BalanceChange.md#assetid)
- [roles](types_subscription.BalanceChange.md#roles)

## Properties

### address

• **address**: `string`

The address that the balance change is for.

#### Defined in

[types/subscription.ts:77](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L77)

---

### amount

• **amount**: `bigint`

The amount of the balance change in smallest divisible unit or microAlgos.

#### Defined in

[types/subscription.ts:81](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L81)

---

### assetId

• **assetId**: `number`

The asset ID of the balance change, or 0 for Algos.

#### Defined in

[types/subscription.ts:79](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L79)

---

### roles

• **roles**: [`BalanceChangeRole`](../enums/types_subscription.BalanceChangeRole.md)[]

The roles the account was playing that led to the balance change

#### Defined in

[types/subscription.ts:83](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/subscription.ts#L83)
