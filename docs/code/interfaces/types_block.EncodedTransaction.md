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

[src/types/block.ts:540](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L540)

___

### aclose

• `Optional` **aclose**: `Buffer`

closeRemainderTo (but for asset transfers)

#### Defined in

[src/types/block.ts:550](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L550)

___

### afrz

• `Optional` **afrz**: `boolean`

freezeState

#### Defined in

[src/types/block.ts:620](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L620)

___

### amt

• `Optional` **amt**: `bigint`

amount

#### Defined in

[src/types/block.ts:535](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L535)

___

### apaa

• `Optional` **apaa**: `Buffer`[]

appArgs

#### Defined in

[src/types/block.ts:680](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L680)

___

### apan

• `Optional` **apan**: `bigint`

appOnComplete

#### Defined in

[src/types/block.ts:645](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L645)

___

### apap

• `Optional` **apap**: `Buffer`

appApprovalProgram

#### Defined in

[src/types/block.ts:670](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L670)

___

### apar

• `Optional` **apar**: [`EncodedAssetParams`](types_block.EncodedAssetParams.md)

See EncodedAssetParams type

#### Defined in

[src/types/block.ts:635](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L635)

___

### apas

• `Optional` **apas**: `bigint`[]

appForeignAssets

#### Defined in

[src/types/block.ts:665](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L665)

___

### apat

• `Optional` **apat**: `Buffer`[]

appAccounts

#### Defined in

[src/types/block.ts:685](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L685)

___

### apbx

• `Optional` **apbx**: [`EncodedBoxReference`](types_block.EncodedBoxReference.md)[]

boxes

#### Defined in

[src/types/block.ts:695](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L695)

___

### apep

• `Optional` **apep**: `bigint`

extraPages

#### Defined in

[src/types/block.ts:690](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L690)

___

### apfa

• `Optional` **apfa**: `bigint`[]

appForeignApps

#### Defined in

[src/types/block.ts:660](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L660)

___

### apgs

• `Optional` **apgs**: [`EncodedGlobalStateSchema`](types_block.EncodedGlobalStateSchema.md)

See EncodedGlobalStateSchema type

#### Defined in

[src/types/block.ts:655](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L655)

___

### apid

• `Optional` **apid**: `bigint`

appIndex

#### Defined in

[src/types/block.ts:640](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L640)

___

### apls

• `Optional` **apls**: [`EncodedLocalStateSchema`](types_block.EncodedLocalStateSchema.md)

See EncodedLocalStateSchema type

#### Defined in

[src/types/block.ts:650](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L650)

___

### apsu

• `Optional` **apsu**: `Buffer`

appClearProgram

#### Defined in

[src/types/block.ts:675](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L675)

___

### arcv

• `Optional` **arcv**: `Buffer`

to (but for asset transfers)

#### Defined in

[src/types/block.ts:565](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L565)

___

### asnd

• `Optional` **asnd**: `Buffer`

assetRevocationTarget

#### Defined in

[src/types/block.ts:630](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L630)

___

### caid

• `Optional` **caid**: `bigint`

assetIndex

#### Defined in

[src/types/block.ts:605](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L605)

___

### close

• `Optional` **close**: `Buffer`

closeRemainderTo

#### Defined in

[src/types/block.ts:545](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L545)

___

### fadd

• `Optional` **fadd**: `Buffer`

freezeAccount

#### Defined in

[src/types/block.ts:625](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L625)

___

### faid

• `Optional` **faid**: `bigint`

assetIndex (but for asset freezing/unfreezing)

#### Defined in

[src/types/block.ts:615](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L615)

___

### fee

• `Optional` **fee**: `bigint`

fee

#### Defined in

[src/types/block.ts:485](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L485)

___

### fv

• `Optional` **fv**: `bigint`

firstRound

#### Defined in

[src/types/block.ts:490](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L490)

___

### gen

• **gen**: `string`

genesisID

#### Defined in

[src/types/block.ts:515](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L515)

___

### gh

• **gh**: `Buffer`

genesisHash

#### Defined in

[src/types/block.ts:520](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L520)

___

### grp

• `Optional` **grp**: `Buffer`

group

#### Defined in

[src/types/block.ts:530](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L530)

___

### lv

• **lv**: `bigint`

lastRound

#### Defined in

[src/types/block.ts:495](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L495)

___

### lx

• `Optional` **lx**: `Buffer`

lease

#### Defined in

[src/types/block.ts:525](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L525)

___

### nonpart

• `Optional` **nonpart**: `boolean`

nonParticipation

#### Defined in

[src/types/block.ts:600](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L600)

___

### note

• `Optional` **note**: `Buffer`

note

#### Defined in

[src/types/block.ts:500](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L500)

___

### rcv

• `Optional` **rcv**: `Buffer`

to

#### Defined in

[src/types/block.ts:560](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L560)

___

### rekey

• `Optional` **rekey**: `Buffer`

reKeyTo

#### Defined in

[src/types/block.ts:555](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L555)

___

### selkey

• `Optional` **selkey**: `Buffer`

selectionKey

#### Defined in

[src/types/block.ts:575](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L575)

___

### snd

• **snd**: `Buffer`

from

#### Defined in

[src/types/block.ts:505](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L505)

___

### sp

• `Optional` **sp**: [`EncodedStateProof`](types_block.EncodedStateProof.md)

stateProof

#### Defined in

[src/types/block.ts:705](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L705)

___

### spmsg

• `Optional` **spmsg**: [`EncodedStateProofMessage`](types_block.EncodedStateProofMessage.md)

stateProofMessage

#### Defined in

[src/types/block.ts:710](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L710)

___

### sprfkey

• `Optional` **sprfkey**: `Buffer`

stateProofKey

#### Defined in

[src/types/block.ts:580](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L580)

___

### sptype

• `Optional` **sptype**: `bigint`

#### Defined in

[src/types/block.ts:700](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L700)

___

### type

• **type**: `string`

type

#### Defined in

[src/types/block.ts:510](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L510)

___

### votefst

• `Optional` **votefst**: `bigint`

voteFirst

#### Defined in

[src/types/block.ts:585](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L585)

___

### votekd

• `Optional` **votekd**: `bigint`

voteKeyDilution

#### Defined in

[src/types/block.ts:595](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L595)

___

### votekey

• `Optional` **votekey**: `Buffer`

voteKey

#### Defined in

[src/types/block.ts:570](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L570)

___

### votelst

• `Optional` **votelst**: `bigint`

voteLast

#### Defined in

[src/types/block.ts:590](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L590)

___

### xaid

• `Optional` **xaid**: `bigint`

assetIndex (but for asset transfers)

#### Defined in

[src/types/block.ts:610](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L610)
