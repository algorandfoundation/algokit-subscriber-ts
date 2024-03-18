[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / Block

# Interface: Block

[types/block](../modules/types_block.md).Block

Data that is returned in a raw Algorand block

**`See`**

https://github.com/algorand/go-algorand/blob/master/data/bookkeeping/block.go#L32

## Table of contents

### Properties

- [earn](types_block.Block.md#earn)
- [fees](types_block.Block.md#fees)
- [frac](types_block.Block.md#frac)
- [gen](types_block.Block.md#gen)
- [gh](types_block.Block.md#gh)
- [prev](types_block.Block.md#prev)
- [proto](types_block.Block.md#proto)
- [rate](types_block.Block.md#rate)
- [rnd](types_block.Block.md#rnd)
- [rwcalr](types_block.Block.md#rwcalr)
- [rwd](types_block.Block.md#rwd)
- [seed](types_block.Block.md#seed)
- [tc](types_block.Block.md#tc)
- [ts](types_block.Block.md#ts)
- [txn](types_block.Block.md#txn)
- [txn256](types_block.Block.md#txn256)
- [txns](types_block.Block.md#txns)

## Properties

### earn

• **earn**: `number`

RewardsLevel specifies how many rewards, in MicroAlgos, have
been distributed to each config.Protocol.RewardUnit of MicroAlgos
since genesis.

#### Defined in

[types/block.ts:12](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L12)

___

### fees

• **fees**: `Uint8Array`

The FeeSink accepts transaction fees. It can only spend to the incentive pool.

#### Defined in

[types/block.ts:14](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L14)

___

### frac

• **frac**: `number`

The number of leftover MicroAlgos after the distribution of RewardsRate/rewardUnits
MicroAlgos for every reward unit in the next round.

#### Defined in

[types/block.ts:18](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L18)

___

### gen

• **gen**: `string`

Genesis ID to which this block belongs.

#### Defined in

[types/block.ts:20](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L20)

___

### gh

• **gh**: `Uint8Array`

Genesis hash to which this block belongs.

#### Defined in

[types/block.ts:22](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L22)

___

### prev

• **prev**: `Uint8Array`

The hash of the previous block

#### Defined in

[types/block.ts:24](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L24)

___

### proto

• **proto**: `string`

UpgradeState tracks the protocol upgrade state machine; proto is the current protocol.

#### Defined in

[types/block.ts:26](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L26)

___

### rate

• **rate**: `number`

The number of new MicroAlgos added to the participation stake from rewards at the next round.

#### Defined in

[types/block.ts:28](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L28)

___

### rnd

• **rnd**: `number`

Round number.

#### Defined in

[types/block.ts:30](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L30)

___

### rwcalr

• **rwcalr**: `number`

The round at which the RewardsRate will be recalculated.

#### Defined in

[types/block.ts:32](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L32)

___

### rwd

• **rwd**: `Uint8Array`

The RewardsPool accepts periodic injections from the
FeeSink and continually redistributes them to addresses as rewards.

#### Defined in

[types/block.ts:36](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L36)

___

### seed

• **seed**: `Uint8Array`

Sortition seed

#### Defined in

[types/block.ts:38](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L38)

___

### tc

• **tc**: `number`

TxnCounter is the number of the next transaction that will be
committed after this block.  Genesis blocks can start at either
0 or 1000, depending on a consensus parameter (AppForbidLowResources).

#### Defined in

[types/block.ts:43](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L43)

___

### ts

• **ts**: `number`

Round time (unix timestamp)

#### Defined in

[types/block.ts:45](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L45)

___

### txn

• **txn**: `Uint8Array`

Root of transaction merkle tree using SHA512_256 hash function.
This commitment is computed based on the PaysetCommit type specified in the block's consensus protocol.

#### Defined in

[types/block.ts:49](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L49)

___

### txn256

• **txn256**: `string`

Root of transaction vector commitment merkle tree using SHA256 hash function.

#### Defined in

[types/block.ts:53](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L53)

___

### txns

• `Optional` **txns**: [`BlockTransaction`](types_block.BlockTransaction.md)[]

The transactions within the block.

#### Defined in

[types/block.ts:55](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L55)
