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

• `Optional` **aamt**: `number` \| `bigint`

amount (but for asset transfers)

#### Defined in

[src/types/block.ts:548](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L548)

___

### aclose

• `Optional` **aclose**: `Buffer`

closeRemainderTo (but for asset transfers)

#### Defined in

[src/types/block.ts:558](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L558)

___

### afrz

• `Optional` **afrz**: `boolean`

freezeState

#### Defined in

[src/types/block.ts:628](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L628)

___

### amt

• `Optional` **amt**: `number` \| `bigint`

amount

#### Defined in

[src/types/block.ts:543](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L543)

___

### apaa

• `Optional` **apaa**: `Buffer`[]

appArgs

#### Defined in

[src/types/block.ts:688](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L688)

___

### apan

• `Optional` **apan**: `number`

appOnComplete

#### Defined in

[src/types/block.ts:653](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L653)

___

### apap

• `Optional` **apap**: `Buffer`

appApprovalProgram

#### Defined in

[src/types/block.ts:678](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L678)

___

### apar

• `Optional` **apar**: [`EncodedAssetParams`](types_block.EncodedAssetParams.md)

See EncodedAssetParams type

#### Defined in

[src/types/block.ts:643](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L643)

___

### apas

• `Optional` **apas**: `number`[]

appForeignAssets

#### Defined in

[src/types/block.ts:673](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L673)

___

### apat

• `Optional` **apat**: `Buffer`[]

appAccounts

#### Defined in

[src/types/block.ts:693](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L693)

___

### apbx

• `Optional` **apbx**: [`EncodedBoxReference`](types_block.EncodedBoxReference.md)[]

boxes

#### Defined in

[src/types/block.ts:703](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L703)

___

### apep

• `Optional` **apep**: `number`

extraPages

#### Defined in

[src/types/block.ts:698](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L698)

___

### apfa

• `Optional` **apfa**: `number`[]

appForeignApps

#### Defined in

[src/types/block.ts:668](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L668)

___

### apgs

• `Optional` **apgs**: [`EncodedGlobalStateSchema`](types_block.EncodedGlobalStateSchema.md)

See EncodedGlobalStateSchema type

#### Defined in

[src/types/block.ts:663](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L663)

___

### apid

• `Optional` **apid**: `number`

appIndex

#### Defined in

[src/types/block.ts:648](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L648)

___

### apls

• `Optional` **apls**: [`EncodedLocalStateSchema`](types_block.EncodedLocalStateSchema.md)

See EncodedLocalStateSchema type

#### Defined in

[src/types/block.ts:658](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L658)

___

### apsu

• `Optional` **apsu**: `Buffer`

appClearProgram

#### Defined in

[src/types/block.ts:683](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L683)

___

### arcv

• `Optional` **arcv**: `Buffer`

to (but for asset transfers)

#### Defined in

[src/types/block.ts:573](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L573)

___

### asnd

• `Optional` **asnd**: `Buffer`

assetRevocationTarget

#### Defined in

[src/types/block.ts:638](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L638)

___

### caid

• `Optional` **caid**: `number`

assetIndex

#### Defined in

[src/types/block.ts:613](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L613)

___

### close

• `Optional` **close**: `Buffer`

closeRemainderTo

#### Defined in

[src/types/block.ts:553](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L553)

___

### fadd

• `Optional` **fadd**: `Buffer`

freezeAccount

#### Defined in

[src/types/block.ts:633](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L633)

___

### faid

• `Optional` **faid**: `number`

assetIndex (but for asset freezing/unfreezing)

#### Defined in

[src/types/block.ts:623](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L623)

___

### fee

• `Optional` **fee**: `number`

fee

#### Defined in

[src/types/block.ts:493](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L493)

___

### fv

• `Optional` **fv**: `number` \| `bigint`

firstRound

#### Defined in

[src/types/block.ts:498](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L498)

___

### gen

• **gen**: `string`

genesisID

#### Defined in

[src/types/block.ts:523](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L523)

___

### gh

• **gh**: `Buffer`

genesisHash

#### Defined in

[src/types/block.ts:528](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L528)

___

### grp

• `Optional` **grp**: `Buffer`

group

#### Defined in

[src/types/block.ts:538](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L538)

___

### lv

• **lv**: `number` \| `bigint`

lastRound

#### Defined in

[src/types/block.ts:503](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L503)

___

### lx

• `Optional` **lx**: `Buffer`

lease

#### Defined in

[src/types/block.ts:533](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L533)

___

### nonpart

• `Optional` **nonpart**: `boolean`

nonParticipation

#### Defined in

[src/types/block.ts:608](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L608)

___

### note

• `Optional` **note**: `Buffer`

note

#### Defined in

[src/types/block.ts:508](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L508)

___

### rcv

• `Optional` **rcv**: `Buffer`

to

#### Defined in

[src/types/block.ts:568](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L568)

___

### rekey

• `Optional` **rekey**: `Buffer`

reKeyTo

#### Defined in

[src/types/block.ts:563](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L563)

___

### selkey

• `Optional` **selkey**: `Buffer`

selectionKey

#### Defined in

[src/types/block.ts:583](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L583)

___

### snd

• **snd**: `Buffer`

from

#### Defined in

[src/types/block.ts:513](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L513)

___

### sp

• `Optional` **sp**: [`EncodedStateProof`](types_block.EncodedStateProof.md)

stateProof

#### Defined in

[src/types/block.ts:713](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L713)

___

### spmsg

• `Optional` **spmsg**: [`EncodedStateProofMessage`](types_block.EncodedStateProofMessage.md)

stateProofMessage

#### Defined in

[src/types/block.ts:718](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L718)

___

### sprfkey

• `Optional` **sprfkey**: `Buffer`

stateProofKey

#### Defined in

[src/types/block.ts:588](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L588)

___

### sptype

• `Optional` **sptype**: `number` \| `bigint`

#### Defined in

[src/types/block.ts:708](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L708)

___

### type

• **type**: `string`

type

#### Defined in

[src/types/block.ts:518](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L518)

___

### votefst

• `Optional` **votefst**: `number`

voteFirst

#### Defined in

[src/types/block.ts:593](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L593)

___

### votekd

• `Optional` **votekd**: `number`

voteKeyDilution

#### Defined in

[src/types/block.ts:603](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L603)

___

### votekey

• `Optional` **votekey**: `Buffer`

voteKey

#### Defined in

[src/types/block.ts:578](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L578)

___

### votelst

• `Optional` **votelst**: `number`

voteLast

#### Defined in

[src/types/block.ts:598](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L598)

___

### xaid

• `Optional` **xaid**: `number`

assetIndex (but for asset transfers)

#### Defined in

[src/types/block.ts:618](https://github.com/algorandfoundation/algokit-subscriber-ts/blob/main/src/types/block.ts#L618)
