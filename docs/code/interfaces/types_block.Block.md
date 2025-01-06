[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / Block

# Interface: Block

[types/block](../modules/types_block.md).Block

Data that is returned in a raw Algorand block.

**`See`**

https://github.com/algorand/go-algorand/blob/master/data/bookkeeping/block.go#L32

## Table of contents

### Properties

- [earn](types_block.Block.md#earn)
- [fees](types_block.Block.md#fees)
- [frac](types_block.Block.md#frac)
- [gen](types_block.Block.md#gen)
- [gh](types_block.Block.md#gh)
- [nextbefore](types_block.Block.md#nextbefore)
- [nextproto](types_block.Block.md#nextproto)
- [nextswitch](types_block.Block.md#nextswitch)
- [nextyes](types_block.Block.md#nextyes)
- [partupdabs](types_block.Block.md#partupdabs)
- [partupdrmv](types_block.Block.md#partupdrmv)
- [prev](types_block.Block.md#prev)
- [proto](types_block.Block.md#proto)
- [prp](types_block.Block.md#prp)
- [rate](types_block.Block.md#rate)
- [rnd](types_block.Block.md#rnd)
- [rwcalr](types_block.Block.md#rwcalr)
- [rwd](types_block.Block.md#rwd)
- [seed](types_block.Block.md#seed)
- [spt](types_block.Block.md#spt)
- [tc](types_block.Block.md#tc)
- [ts](types_block.Block.md#ts)
- [txn](types_block.Block.md#txn)
- [txn256](types_block.Block.md#txn256)
- [txns](types_block.Block.md#txns)
- [upgradedelay](types_block.Block.md#upgradedelay)
- [upgradeprop](types_block.Block.md#upgradeprop)
- [upgradeyes](types_block.Block.md#upgradeyes)

## Properties

### earn

• **earn**: `number`

RewardsLevel specifies how many rewards, in MicroAlgos, have
been distributed to each config.Protocol.RewardUnit of MicroAlgos
since genesis.

#### Defined in

[src/types/block.ts:86](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L86)

___

### fees

• **fees**: `Uint8Array`

The FeeSink accepts transaction fees. It can only spend to the incentive pool.

#### Defined in

[src/types/block.ts:88](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L88)

___

### frac

• **frac**: `number` \| `bigint`

The number of leftover MicroAlgos after the distribution of RewardsRate/rewardUnits
MicroAlgos for every reward unit in the next round.

#### Defined in

[src/types/block.ts:92](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L92)

___

### gen

• **gen**: `string`

Genesis ID to which this block belongs.

#### Defined in

[src/types/block.ts:94](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L94)

___

### gh

• **gh**: `Uint8Array`

Genesis hash to which this block belongs.

#### Defined in

[src/types/block.ts:96](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L96)

___

### nextbefore

• `Optional` **nextbefore**: `number`

Deadline round for this protocol upgrade (No votes will be considered after this round).

#### Defined in

[src/types/block.ts:140](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L140)

___

### nextproto

• `Optional` **nextproto**: `string`

The next proposed protocol version.

#### Defined in

[src/types/block.ts:132](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L132)

___

### nextswitch

• `Optional` **nextswitch**: `number`

Round on which the protocol upgrade will take effect.

#### Defined in

[src/types/block.ts:144](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L144)

___

### nextyes

• `Optional` **nextyes**: `number`

Number of blocks which approved the protocol upgrade.

#### Defined in

[src/types/block.ts:136](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L136)

___

### partupdabs

• `Optional` **partupdabs**: `Uint8Array`[]

AbsentParticipationAccounts contains a list of online accounts that
needs to be converted to offline since they are not proposing.

#### Defined in

[src/types/block.ts:153](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L153)

___

### partupdrmv

• `Optional` **partupdrmv**: `Uint8Array`[]

ExpiredParticipationAccounts contains a list of online accounts that needs to be
converted to offline since their participation key expired.

#### Defined in

[src/types/block.ts:158](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L158)

___

### prev

• `Optional` **prev**: `Uint8Array`

The hash of the previous block

#### Defined in

[src/types/block.ts:98](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L98)

___

### proto

• **proto**: `string`

UpgradeState tracks the protocol upgrade state machine; proto is the current protocol.

#### Defined in

[src/types/block.ts:100](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L100)

___

### prp

• `Optional` **prp**: `Uint8Array`

Proposer is the proposer of this block.

#### Defined in

[src/types/block.ts:176](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L176)

___

### rate

• `Optional` **rate**: `number`

The number of new MicroAlgos added to the participation stake from rewards at the next round.

#### Defined in

[src/types/block.ts:102](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L102)

___

### rnd

• **rnd**: `number` \| `bigint`

Round number.

#### Defined in

[src/types/block.ts:104](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L104)

___

### rwcalr

• **rwcalr**: `number`

The round at which the RewardsRate will be recalculated.

#### Defined in

[src/types/block.ts:106](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L106)

___

### rwd

• **rwd**: `Uint8Array`

The RewardsPool accepts periodic injections from the
FeeSink and continually redistributes them to addresses as rewards.

#### Defined in

[src/types/block.ts:110](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L110)

___

### seed

• **seed**: `Uint8Array`

Sortition seed

#### Defined in

[src/types/block.ts:112](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L112)

___

### spt

• `Optional` **spt**: `Record`\<`number`, [`StateProofTracking`](types_block.StateProofTracking.md)\>

#### Defined in

[src/types/block.ts:172](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L172)

___

### tc

• **tc**: `number`

TxnCounter is the number of the next transaction that will be
committed after this block.  Genesis blocks can start at either
0 or 1000, depending on a consensus parameter (AppForbidLowResources).

#### Defined in

[src/types/block.ts:117](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L117)

___

### ts

• **ts**: `number`

Round time (unix timestamp)

#### Defined in

[src/types/block.ts:119](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L119)

___

### txn

• `Optional` **txn**: `Uint8Array`

Root of transaction merkle tree using SHA512_256 hash function.
This commitment is computed based on the PaysetCommit type specified in the block's consensus protocol.
This value is only set when there are transactions in the block.

#### Defined in

[src/types/block.ts:124](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L124)

___

### txn256

• **txn256**: `string`

Root of transaction vector commitment merkle tree using SHA256 hash function.

#### Defined in

[src/types/block.ts:128](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L128)

___

### txns

• `Optional` **txns**: [`BlockTransaction`](types_block.BlockTransaction.md)[]

The transactions within the block.

#### Defined in

[src/types/block.ts:148](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L148)

___

### upgradedelay

• `Optional` **upgradedelay**: `number`

UpgradeDelay indicates the time between acceptance and execution

#### Defined in

[src/types/block.ts:166](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L166)

___

### upgradeprop

• `Optional` **upgradeprop**: `string`

UpgradePropose indicates a proposed upgrade

#### Defined in

[src/types/block.ts:170](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L170)

___

### upgradeyes

• `Optional` **upgradeyes**: `boolean`

UpgradeApprove indicates a yes vote for the current proposal

#### Defined in

[src/types/block.ts:162](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L162)
