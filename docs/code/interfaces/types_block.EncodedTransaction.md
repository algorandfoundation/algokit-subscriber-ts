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

[src/types/block.ts:537](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L537)

___

### aclose

• `Optional` **aclose**: `Buffer`

closeRemainderTo (but for asset transfers)

#### Defined in

[src/types/block.ts:545](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L545)

___

### afrz

• `Optional` **afrz**: `boolean`

freezeState

#### Defined in

[src/types/block.ts:601](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L601)

___

### amt

• `Optional` **amt**: `bigint`

amount

#### Defined in

[src/types/block.ts:533](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L533)

___

### apaa

• `Optional` **apaa**: `Buffer`[]

appArgs

#### Defined in

[src/types/block.ts:649](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L649)

___

### apan

• `Optional` **apan**: `number`

appOnComplete

#### Defined in

[src/types/block.ts:621](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L621)

___

### apap

• `Optional` **apap**: `Buffer`

appApprovalProgram

#### Defined in

[src/types/block.ts:641](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L641)

___

### apar

• `Optional` **apar**: [`EncodedAssetParams`](types_block.EncodedAssetParams.md)

See EncodedAssetParams type

#### Defined in

[src/types/block.ts:613](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L613)

___

### apas

• `Optional` **apas**: `bigint`[]

appForeignAssets

#### Defined in

[src/types/block.ts:637](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L637)

___

### apat

• `Optional` **apat**: `Buffer`[]

appAccounts

#### Defined in

[src/types/block.ts:653](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L653)

___

### apbx

• `Optional` **apbx**: [`EncodedBoxReference`](types_block.EncodedBoxReference.md)[]

boxes

#### Defined in

[src/types/block.ts:661](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L661)

___

### apep

• `Optional` **apep**: `number`

extraPages

#### Defined in

[src/types/block.ts:657](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L657)

___

### apfa

• `Optional` **apfa**: `bigint`[]

appForeignApps

#### Defined in

[src/types/block.ts:633](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L633)

___

### apgs

• `Optional` **apgs**: [`EncodedGlobalStateSchema`](types_block.EncodedGlobalStateSchema.md)

See EncodedGlobalStateSchema type

#### Defined in

[src/types/block.ts:629](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L629)

___

### apid

• `Optional` **apid**: `bigint`

appIndex

#### Defined in

[src/types/block.ts:617](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L617)

___

### apls

• `Optional` **apls**: [`EncodedLocalStateSchema`](types_block.EncodedLocalStateSchema.md)

See EncodedLocalStateSchema type

#### Defined in

[src/types/block.ts:625](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L625)

___

### apsu

• `Optional` **apsu**: `Buffer`

appClearProgram

#### Defined in

[src/types/block.ts:645](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L645)

___

### arcv

• `Optional` **arcv**: `Buffer`

to (but for asset transfers)

#### Defined in

[src/types/block.ts:557](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L557)

___

### asnd

• `Optional` **asnd**: `Buffer`

assetRevocationTarget

#### Defined in

[src/types/block.ts:609](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L609)

___

### caid

• `Optional` **caid**: `bigint`

assetIndex

#### Defined in

[src/types/block.ts:589](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L589)

___

### close

• `Optional` **close**: `Buffer`

closeRemainderTo

#### Defined in

[src/types/block.ts:541](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L541)

___

### fadd

• `Optional` **fadd**: `Buffer`

freezeAccount

#### Defined in

[src/types/block.ts:605](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L605)

___

### faid

• `Optional` **faid**: `bigint`

assetIndex (but for asset freezing/unfreezing)

#### Defined in

[src/types/block.ts:597](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L597)

___

### fee

• **fee**: `bigint`

fee

#### Defined in

[src/types/block.ts:493](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L493)

___

### fv

• **fv**: `bigint`

firstRound

#### Defined in

[src/types/block.ts:497](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L497)

___

### gen

• `Optional` **gen**: `string`

genesisID

#### Defined in

[src/types/block.ts:517](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L517)

___

### gh

• `Optional` **gh**: `Buffer`

genesisHash

#### Defined in

[src/types/block.ts:521](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L521)

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

[src/types/block.ts:501](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L501)

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

[src/types/block.ts:585](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L585)

___

### note

• `Optional` **note**: `Buffer`

note

#### Defined in

[src/types/block.ts:505](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L505)

___

### rcv

• `Optional` **rcv**: `Buffer`

to

#### Defined in

[src/types/block.ts:553](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L553)

___

### rekey

• `Optional` **rekey**: `Buffer`

reKeyTo

#### Defined in

[src/types/block.ts:549](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L549)

___

### selkey

• `Optional` **selkey**: `Buffer`

selectionKey

#### Defined in

[src/types/block.ts:565](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L565)

___

### snd

• **snd**: `Buffer`

from

#### Defined in

[src/types/block.ts:509](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L509)

___

### sp

• `Optional` **sp**: [`EncodedStateProof`](types_block.EncodedStateProof.md)

stateProof

#### Defined in

[src/types/block.ts:671](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L671)

___

### spmsg

• `Optional` **spmsg**: [`EncodedStateProofMessage`](types_block.EncodedStateProofMessage.md)

stateProofMessage

#### Defined in

[src/types/block.ts:676](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L676)

___

### sprfkey

• `Optional` **sprfkey**: `Buffer`

stateProofKey

#### Defined in

[src/types/block.ts:569](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L569)

___

### sptype

• `Optional` **sptype**: `number`

stateProofType

#### Defined in

[src/types/block.ts:666](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L666)

___

### type

• **type**: `string`

type

#### Defined in

[src/types/block.ts:513](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L513)

___

### votefst

• `Optional` **votefst**: `bigint`

voteFirst

#### Defined in

[src/types/block.ts:573](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L573)

___

### votekd

• `Optional` **votekd**: `bigint`

voteKeyDilution

#### Defined in

[src/types/block.ts:581](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L581)

___

### votekey

• `Optional` **votekey**: `Buffer`

voteKey

#### Defined in

[src/types/block.ts:561](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L561)

___

### votelst

• `Optional` **votelst**: `bigint`

voteLast

#### Defined in

[src/types/block.ts:577](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L577)

___

### xaid

• `Optional` **xaid**: `bigint`

assetIndex (but for asset transfers)

#### Defined in

[src/types/block.ts:593](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L593)
