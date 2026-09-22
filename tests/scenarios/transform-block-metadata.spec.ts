import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { describe, expect, it } from 'vitest'
import { blockResponseToBlockMetadata } from '../../src/transform'

describe('Block metadata transform', () => {
  const algorand = AlgorandClient.mainNet()

  it('Maps the v41/v42 block header fields (prev512, txn512, ld, ct)', async () => {
    // https://allo.info/block/64863104
    const block = await algorand.client.algod.block(64863104n).do()

    const metadata = blockResponseToBlockMetadata(block)

    expect(metadata.round).toBe(64863104n)
    expect(metadata.previousBlockHash).toBe('VYgtdMWpauIFksh/T4xDsnlOAP7FlsNs1BQmCTAZ5mQ=')
    expect(metadata.previousBlockHashSha512).toBe(
      '78G2CdF8R1wZR1THjjwTP+r2GuJTHkj33xP74CyOxyN6UmbzwyDE3pX3BmjsMvk1GnO/IN6zzq7gToa9scCJdA==',
    )
    expect(metadata.transactionsRootSha512).toBe(
      'u+GWh8K3g4wUiFF335thfll4HwMFW6J+q2KhT7iAcnqeuSmBBEjTVkZmiNemYRkQl8bVb/1oM6U/hNkSPCCodw==',
    )
    expect(metadata.load).toBe(1916n)
    expect(metadata.congestionTax).toBe(0n)
  })

  it('Leaves the v41/v42 block header fields absent or zero for an older block', async () => {
    // https://allo.info/block/35214367
    const block = await algorand.client.algod.block(35214367n).do()

    const metadata = blockResponseToBlockMetadata(block)

    expect(metadata.round).toBe(35214367n)
    expect(metadata.previousBlockHash).toBe('8ReLxqOPxmuKuBfACtllRRr13n2E2r01f8wXt3vFYW0=')
    expect(metadata.previousBlockHashSha512).toBeUndefined()
    expect(metadata.transactionsRootSha512).toBeUndefined()
    expect(metadata.load).toBe(0n)
    expect(metadata.congestionTax).toBe(0n)
  })
})
