import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { TransactionType } from 'algosdk'
import { describe, expect, it } from 'vitest'
import { getSubscribedTransactionForDiff } from '../subscribed-transactions'
import { GetSubscribedTransactions } from '../transactions'

describe('Post-quantum (Falcon-1024) signed transaction', () => {
  const txnId = 'OTQBDLAIGKC4RIE2SW2QUAYWWN2ZNWSEMRO4AJK423P33UIVXKSQ'
  const roundNumber = 64863104n
  const sender = 'IN44PGNJYYCMXMSUTFW5BKLGIV2D3BMOCM5ZP4BQJEOEIN3YE3GIW42NAI'
  const algorand = AlgorandClient.mainNet()
  const expectedSignature = {
    pqsig: {
      publicKey:
        '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',
      scheme: 'f1',
      signature:
        'ugBuQh5f7CHetnb1FBazm002PyaNHjqeFat5GiCqkzQuxmpmpKe01qH+S1CGNmcMQZRvjfPZAeq30CsbGO9N1apJs+FYEQSqcUZh3zhKyONG7mm7OC2zLEo7FiGKbiVqGzW1quiwkj1/iqTyTFU7xRMSoOdxVbfFYp5NkI6rhjNWJ/WvmzZ5BFEoWnMMtEmwbHKIcvk7ZwZvTfxRU0/XO2a0y5ydYTB4pDyNcXLY9jN6dI+NcVtMbPBWm0as9qYrXsmm1IsddQaruyT2BaflSVY6/O/PDDkNLS9jppCdFACF5AkC+4SNVpC6yiWLxUkMpBYuj+Nucsz0SluvpGS8DP6HeIry/i/bazPOtLumappHGSmdZ+3USqQrTdZLTikr6h9rtkQpnsKPemacyYGWnp+FRgDJohBn/gj56VGGRmhg5z8LtasLPOQS4z8XodIz0ODRJv7bXGLlAG388jOzmc3IcLMHu6d2W15dfDEBllQQFOBSpU9HA8bCmNRdwWijeJrsh0GaZ1GP7lY46c2X788Zj0dr5MPBHcYZMu3rW29yQy6QOd95qnOmT3El9dG+9ikxNPI15nT5ceiaBchCfBuMolvT9LVM1BUGxeV0bKEnI25HF2TtIvD4O9qXbFHMZUJ+itLe58dYg7/QlB4omLWJa6UVZzPtaYNWbZiXrtmDwhk933tesNfso9iBM9VDvM91dXkFlmrIW4qI6lAxC7OY1EDI/oZ62mo2d64dQ90SlU2mVsXe+T6I79xVLr8Dj5xMPsskV/YM0O7+J4rlMYgfNmkBclp0YOYUuplO80TzCtqtz8+2ellpRpTcs7nyZbepaZTLX6oMM9wVr12dYNDH362+w/NSFh0mgvmWNU0wnT6vD5Nn1sWdKFIlU2+kLu1JtPMsaLIbx67XaF7IB/kEJFeljSUsUESaSvVVeRU1e/HsyNcmKC/r1nelTIXdjESRqDvhH036aipE5Flk8L5/ygfSoKneFsSU5FHtT0ZghiC/skvygh7PXCrl8WwJlNcq5a6YHvQQ4Df/7DWkydwkVXN4/FEFhgTOwRwjfIEU01MLjF/Q0iGjij0GjQ3wTxktZVy094zeWtjAvvoYY44v/ol0F0yVDHwpCkt2f6yybZNVIVvlHQscI2OT/B7pMg5jfjTOhmyB3GUVlMitwJpI/TnU59HMMX6b8XL8OKWRqEHNa3LjZRsSlMNRiW4oyFSQLI4Wq0tjTC8OtTUk6IsqvlBq0tuzc4WnVqTr9OU7Ss11uUPu9BEqhQ1cX9CPLRpCuumhOL/cQicIWD6dO7N7JGgmVE1ylHMscGbNYUg6DCxfzLp1NZhiNY9WPr5SxRaQKBg2M/GfYGvwhtkTwhyZGvBSreytGZBW9XW4etaUN0VK7YgaZW4LlyOGP6EL9hCZHAiGrR2IdmvJq4Bffw3GXUdoJw/5Sk9G1OMZBVXdIkn80hBTVIWxLN9WNsdIyPvsCr4+ZcsqMeosvss2ZAnPM9XAKZPV8PHA2Zq1IRv0zttNGlW4QS2yQzCVTrj8N0oHRXdxDf4SrtClClzIjpMUBqD3xthyetG8ujz1u3HNoS0selaoT7CN56sTCUB6nVrGqEGwBCUxmPAn+o62zyvLwLSoVEpJe0LaisE=',
    },
  }

  it('Can have a pqsig signed transaction subscribed correctly from indexer', async () => {
    const indexerTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.pay,
          sender,
        },
        roundsToSync: 1,
        currentRound: roundNumber + 1n,
        syncBehaviour: 'catchup-with-indexer',
        watermark: roundNumber - 1n,
      },
      algorand,
    )

    expect(indexerTxns.subscribedTransactions.length).toBe(1)
    const txn = indexerTxns.subscribedTransactions[0]
    // https://allo.info/tx/OTQBDLAIGKC4RIE2SW2QUAYWWN2ZNWSEMRO4AJK423P33UIVXKSQ
    expect(txn.id).toBe(txnId)
    expect(txn.fee).toBe(3000n)
    expect(txn.authAddr).toBeUndefined()
    expect(getSubscribedTransactionForDiff(txn).signature).toEqual(expectedSignature)
  })

  it('Can have a pqsig signed transaction subscribed correctly from algod', async () => {
    const algodTxns = await GetSubscribedTransactions(
      {
        filters: {
          type: TransactionType.pay,
          sender,
        },
        roundsToSync: 1,
        currentRound: roundNumber + 1n,
        syncBehaviour: 'sync-oldest',
        watermark: roundNumber - 1n,
      },
      algorand,
    )

    expect(algodTxns.subscribedTransactions.length).toBe(1)
    const txn = algodTxns.subscribedTransactions[0]
    expect(txn.id).toBe(txnId)
    expect(txn.fee).toBe(3000n)
    expect(txn.authAddr).toBeUndefined()
    expect(getSubscribedTransactionForDiff(txn).signature).toEqual(expectedSignature)
  })
})
