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

[src/types/block.ts:552](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L552)

___

### aclose

• `Optional` **aclose**: `Buffer`

closeRemainderTo (but for asset transfers)

#### Defined in

[src/types/block.ts:562](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L562)

___

### afrz

• `Optional` **afrz**: `boolean`

freezeState

#### Defined in

[src/types/block.ts:632](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L632)

___

### amt

• `Optional` **amt**: `bigint`

amount

#### Defined in

[src/types/block.ts:547](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L547)

___

### apaa

• `Optional` **apaa**: `Buffer`[]

appArgs

#### Defined in

[src/types/block.ts:692](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L692)

___

### apan

• `Optional` **apan**: `bigint`

appOnComplete

#### Defined in

[src/types/block.ts:657](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L657)

___

### apap

• `Optional` **apap**: `Buffer`

appApprovalProgram

#### Defined in

[src/types/block.ts:682](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L682)

___

### apar

• `Optional` **apar**: [`EncodedAssetParams`](types_block.EncodedAssetParams.md)

See EncodedAssetParams type

#### Defined in

[src/types/block.ts:647](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L647)

___

### apas

• `Optional` **apas**: `bigint`[]

appForeignAssets

#### Defined in

[src/types/block.ts:677](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L677)

___

### apat

• `Optional` **apat**: `Buffer`[]

appAccounts

#### Defined in

[src/types/block.ts:697](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L697)

___

### apbx

• `Optional` **apbx**: [`EncodedBoxReference`](types_block.EncodedBoxReference.md)[]

boxes

#### Defined in

[src/types/block.ts:707](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L707)

___

### apep

• `Optional` **apep**: `bigint`

extraPages

#### Defined in

[src/types/block.ts:702](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L702)

___

### apfa

• `Optional` **apfa**: `bigint`[]

appForeignApps

#### Defined in

[src/types/block.ts:672](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L672)

___

### apgs

• `Optional` **apgs**: [`EncodedGlobalStateSchema`](types_block.EncodedGlobalStateSchema.md)

See EncodedGlobalStateSchema type

#### Defined in

[src/types/block.ts:667](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L667)

___

### apid

• `Optional` **apid**: `bigint`

appIndex

#### Defined in

[src/types/block.ts:652](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L652)

___

### apls

• `Optional` **apls**: [`EncodedLocalStateSchema`](types_block.EncodedLocalStateSchema.md)

See EncodedLocalStateSchema type

#### Defined in

[src/types/block.ts:662](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L662)

___

### apsu

• `Optional` **apsu**: `Buffer`

appClearProgram

#### Defined in

[src/types/block.ts:687](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L687)

___

### arcv

• `Optional` **arcv**: `Buffer`

to (but for asset transfers)

#### Defined in

[src/types/block.ts:577](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L577)

___

### asnd

• `Optional` **asnd**: `Buffer`

assetRevocationTarget

#### Defined in

[src/types/block.ts:642](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L642)

___

### caid

• `Optional` **caid**: `bigint`

assetIndex

#### Defined in

[src/types/block.ts:617](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L617)

___

### close

• `Optional` **close**: `Buffer`

closeRemainderTo

#### Defined in

[src/types/block.ts:557](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L557)

___

### fadd

• `Optional` **fadd**: `Buffer`

freezeAccount

#### Defined in

[src/types/block.ts:637](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L637)

___

### faid

• `Optional` **faid**: `bigint`

assetIndex (but for asset freezing/unfreezing)

#### Defined in

[src/types/block.ts:627](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L627)

___

### fee

• `Optional` **fee**: `bigint`

fee

#### Defined in

[src/types/block.ts:497](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L497)

___

### fv

• `Optional` **fv**: `bigint`

firstRound

#### Defined in

[src/types/block.ts:502](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L502)

___

### gen

• **gen**: `string`

genesisID

#### Defined in

[src/types/block.ts:527](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L527)

___

### gh

• **gh**: `Buffer`

genesisHash

#### Defined in

[src/types/block.ts:532](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L532)

___

### grp

• `Optional` **grp**: `Buffer`

group

#### Defined in

[src/types/block.ts:542](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L542)

___

### lv

• **lv**: `bigint`

lastRound

#### Defined in

[src/types/block.ts:507](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L507)

___

### lx

• `Optional` **lx**: `Buffer`

lease

#### Defined in

[src/types/block.ts:537](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L537)

___

### nonpart

• `Optional` **nonpart**: `boolean`

nonParticipation

#### Defined in

[src/types/block.ts:612](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L612)

___

### note

• `Optional` **note**: `Buffer`

note

#### Defined in

[src/types/block.ts:512](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L512)

___

### rcv

• `Optional` **rcv**: `Buffer`

to

#### Defined in

[src/types/block.ts:572](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L572)

___

### rekey

• `Optional` **rekey**: `Buffer`

reKeyTo

#### Defined in

[src/types/block.ts:567](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L567)

___

### selkey

• `Optional` **selkey**: `Buffer`

selectionKey

#### Defined in

[src/types/block.ts:587](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L587)

___

### snd

• **snd**: `Buffer`

from

#### Defined in

[src/types/block.ts:517](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L517)

___

### sp

• `Optional` **sp**: [`EncodedStateProof`](types_block.EncodedStateProof.md)

stateProof

#### Defined in

[src/types/block.ts:717](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L717)

___

### spmsg

• `Optional` **spmsg**: [`EncodedStateProofMessage`](types_block.EncodedStateProofMessage.md)

stateProofMessage

#### Defined in

[src/types/block.ts:722](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L722)

___

### sprfkey

• `Optional` **sprfkey**: `Buffer`

stateProofKey

#### Defined in

[src/types/block.ts:592](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L592)

___

### sptype

• `Optional` **sptype**: `bigint`

#### Defined in

[src/types/block.ts:712](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L712)

___

### type

• **type**: `string`

type

#### Defined in

[src/types/block.ts:522](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L522)

___

### votefst

• `Optional` **votefst**: `bigint`

voteFirst

#### Defined in

[src/types/block.ts:597](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L597)

___

### votekd

• `Optional` **votekd**: `bigint`

voteKeyDilution

#### Defined in

[src/types/block.ts:607](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L607)

___

### votekey

• `Optional` **votekey**: `Buffer`

voteKey

#### Defined in

[src/types/block.ts:582](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L582)

___

### votelst

• `Optional` **votelst**: `bigint`

voteLast

#### Defined in

[src/types/block.ts:602](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L602)

___

### xaid

• `Optional` **xaid**: `bigint`

assetIndex (but for asset transfers)

#### Defined in

[src/types/block.ts:622](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L622)
