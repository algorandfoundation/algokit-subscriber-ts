[@algorandfoundation/algokit-subscriber](../README.md) / [types/block](../modules/types_block.md) / EncodedTransaction

# Interface: EncodedTransaction

[types/block](../modules/types_block.md).EncodedTransaction

A rough structure for the encoded transaction object. Every property is labelled with its associated Transaction type property

## Table of contents

### Properties

- [aamt](types_block.EncodedTransaction.md#aamt)
- [aclose](types_block.EncodedTransaction.md#aclose)
- [afrz](types_block.EncodedTransaction.md#afrz)
- [amt](types_block.EncodedTransaction.md#amt)
- [apaa](types_block.EncodedTransaction.md#apaa)
- [apan](types_block.EncodedTransaction.md#apan)
- [apap](types_block.EncodedTransaction.md#apap)
- [apar](types_block.EncodedTransaction.md#apar)
- [apas](types_block.EncodedTransaction.md#apas)
- [apat](types_block.EncodedTransaction.md#apat)
- [apbx](types_block.EncodedTransaction.md#apbx)
- [apep](types_block.EncodedTransaction.md#apep)
- [apfa](types_block.EncodedTransaction.md#apfa)
- [apgs](types_block.EncodedTransaction.md#apgs)
- [apid](types_block.EncodedTransaction.md#apid)
- [apls](types_block.EncodedTransaction.md#apls)
- [apsu](types_block.EncodedTransaction.md#apsu)
- [arcv](types_block.EncodedTransaction.md#arcv)
- [asnd](types_block.EncodedTransaction.md#asnd)
- [caid](types_block.EncodedTransaction.md#caid)
- [close](types_block.EncodedTransaction.md#close)
- [fadd](types_block.EncodedTransaction.md#fadd)
- [faid](types_block.EncodedTransaction.md#faid)
- [fee](types_block.EncodedTransaction.md#fee)
- [fv](types_block.EncodedTransaction.md#fv)
- [gen](types_block.EncodedTransaction.md#gen)
- [gh](types_block.EncodedTransaction.md#gh)
- [grp](types_block.EncodedTransaction.md#grp)
- [lv](types_block.EncodedTransaction.md#lv)
- [lx](types_block.EncodedTransaction.md#lx)
- [nonpart](types_block.EncodedTransaction.md#nonpart)
- [note](types_block.EncodedTransaction.md#note)
- [rcv](types_block.EncodedTransaction.md#rcv)
- [rekey](types_block.EncodedTransaction.md#rekey)
- [selkey](types_block.EncodedTransaction.md#selkey)
- [snd](types_block.EncodedTransaction.md#snd)
- [sp](types_block.EncodedTransaction.md#sp)
- [spmsg](types_block.EncodedTransaction.md#spmsg)
- [sprfkey](types_block.EncodedTransaction.md#sprfkey)
- [sptype](types_block.EncodedTransaction.md#sptype)
- [type](types_block.EncodedTransaction.md#type)
- [votefst](types_block.EncodedTransaction.md#votefst)
- [votekd](types_block.EncodedTransaction.md#votekd)
- [votekey](types_block.EncodedTransaction.md#votekey)
- [votelst](types_block.EncodedTransaction.md#votelst)
- [xaid](types_block.EncodedTransaction.md#xaid)

## Properties

### aamt

• `Optional` **aamt**: `bigint`

amount (but for asset transfers)

#### Defined in

[src/types/block.ts:539](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L539)

___

### aclose

• `Optional` **aclose**: `Buffer`

closeRemainderTo (but for asset transfers)

#### Defined in

[src/types/block.ts:549](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L549)

___

### afrz

• `Optional` **afrz**: `boolean`

freezeState

#### Defined in

[src/types/block.ts:619](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L619)

___

### amt

• `Optional` **amt**: `bigint`

amount

#### Defined in

[src/types/block.ts:534](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L534)

___

### apaa

• `Optional` **apaa**: `Buffer`[]

appArgs

#### Defined in

[src/types/block.ts:679](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L679)

___

### apan

• `Optional` **apan**: `bigint`

appOnComplete

#### Defined in

[src/types/block.ts:644](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L644)

___

### apap

• `Optional` **apap**: `Buffer`

appApprovalProgram

#### Defined in

[src/types/block.ts:669](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L669)

___

### apar

• `Optional` **apar**: [`EncodedAssetParams`](types_block.EncodedAssetParams.md)

See EncodedAssetParams type

#### Defined in

[src/types/block.ts:634](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L634)

___

### apas

• `Optional` **apas**: `bigint`[]

appForeignAssets

#### Defined in

[src/types/block.ts:664](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L664)

___

### apat

• `Optional` **apat**: `Buffer`[]

appAccounts

#### Defined in

[src/types/block.ts:684](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L684)

___

### apbx

• `Optional` **apbx**: [`EncodedBoxReference`](types_block.EncodedBoxReference.md)[]

boxes

#### Defined in

[src/types/block.ts:694](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L694)

___

### apep

• `Optional` **apep**: `bigint`

extraPages

#### Defined in

[src/types/block.ts:689](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L689)

___

### apfa

• `Optional` **apfa**: `bigint`[]

appForeignApps

#### Defined in

[src/types/block.ts:659](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L659)

___

### apgs

• `Optional` **apgs**: [`EncodedGlobalStateSchema`](types_block.EncodedGlobalStateSchema.md)

See EncodedGlobalStateSchema type

#### Defined in

[src/types/block.ts:654](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L654)

___

### apid

• `Optional` **apid**: `bigint`

appIndex

#### Defined in

[src/types/block.ts:639](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L639)

___

### apls

• `Optional` **apls**: [`EncodedLocalStateSchema`](types_block.EncodedLocalStateSchema.md)

See EncodedLocalStateSchema type

#### Defined in

[src/types/block.ts:649](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L649)

___

### apsu

• `Optional` **apsu**: `Buffer`

appClearProgram

#### Defined in

[src/types/block.ts:674](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L674)

___

### arcv

• `Optional` **arcv**: `Buffer`

to (but for asset transfers)

#### Defined in

[src/types/block.ts:564](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L564)

___

### asnd

• `Optional` **asnd**: `Buffer`

assetRevocationTarget

#### Defined in

[src/types/block.ts:629](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L629)

___

### caid

• `Optional` **caid**: `bigint`

assetIndex

#### Defined in

[src/types/block.ts:604](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L604)

___

### close

• `Optional` **close**: `Buffer`

closeRemainderTo

#### Defined in

[src/types/block.ts:544](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L544)

___

### fadd

• `Optional` **fadd**: `Buffer`

freezeAccount

#### Defined in

[src/types/block.ts:624](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L624)

___

### faid

• `Optional` **faid**: `bigint`

assetIndex (but for asset freezing/unfreezing)

#### Defined in

[src/types/block.ts:614](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L614)

___

### fee

• `Optional` **fee**: `bigint`

fee

#### Defined in

[src/types/block.ts:484](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L484)

___

### fv

• `Optional` **fv**: `bigint`

firstRound

#### Defined in

[src/types/block.ts:489](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L489)

___

### gen

• **gen**: `string`

genesisID

#### Defined in

[src/types/block.ts:514](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L514)

___

### gh

• **gh**: `Buffer`

genesisHash

#### Defined in

[src/types/block.ts:519](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L519)

___

### grp

• `Optional` **grp**: `Buffer`

group

#### Defined in

[src/types/block.ts:529](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L529)

___

### lv

• **lv**: `bigint`

lastRound

#### Defined in

[src/types/block.ts:494](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L494)

___

### lx

• `Optional` **lx**: `Buffer`

lease

#### Defined in

[src/types/block.ts:524](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L524)

___

### nonpart

• `Optional` **nonpart**: `boolean`

nonParticipation

#### Defined in

[src/types/block.ts:599](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L599)

___

### note

• `Optional` **note**: `Buffer`

note

#### Defined in

[src/types/block.ts:499](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L499)

___

### rcv

• `Optional` **rcv**: `Buffer`

to

#### Defined in

[src/types/block.ts:559](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L559)

___

### rekey

• `Optional` **rekey**: `Buffer`

reKeyTo

#### Defined in

[src/types/block.ts:554](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L554)

___

### selkey

• `Optional` **selkey**: `Buffer`

selectionKey

#### Defined in

[src/types/block.ts:574](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L574)

___

### snd

• **snd**: `Buffer`

from

#### Defined in

[src/types/block.ts:504](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L504)

___

### sp

• `Optional` **sp**: [`EncodedStateProof`](types_block.EncodedStateProof.md)

stateProof

#### Defined in

[src/types/block.ts:704](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L704)

___

### spmsg

• `Optional` **spmsg**: [`EncodedStateProofMessage`](types_block.EncodedStateProofMessage.md)

stateProofMessage

#### Defined in

[src/types/block.ts:709](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L709)

___

### sprfkey

• `Optional` **sprfkey**: `Buffer`

stateProofKey

#### Defined in

[src/types/block.ts:579](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L579)

___

### sptype

• `Optional` **sptype**: `bigint`

#### Defined in

[src/types/block.ts:699](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L699)

___

### type

• **type**: `string`

type

#### Defined in

[src/types/block.ts:509](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L509)

___

### votefst

• `Optional` **votefst**: `bigint`

voteFirst

#### Defined in

[src/types/block.ts:584](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L584)

___

### votekd

• `Optional` **votekd**: `bigint`

voteKeyDilution

#### Defined in

[src/types/block.ts:594](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L594)

___

### votekey

• `Optional` **votekey**: `Buffer`

voteKey

#### Defined in

[src/types/block.ts:569](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L569)

___

### votelst

• `Optional` **votelst**: `bigint`

voteLast

#### Defined in

[src/types/block.ts:589](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L589)

___

### xaid

• `Optional` **xaid**: `bigint`

assetIndex (but for asset transfers)

#### Defined in

[src/types/block.ts:609](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L609)
