import * as algokit from '@algorandfoundation/algokit-utils'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { AlgorandFixture, AlgorandFixtureConfig } from '@algorandfoundation/algokit-utils/types/testing'
import { cachedTestAccountGenerator } from './accounts'

export function cachedAlgorandFixture(fixtureConfig?: AlgorandFixtureConfig): AlgorandFixture {
  return algorandFixture(
    { accountGetter: cachedTestAccountGenerator, ...fixtureConfig },
    {
      algodConfig: algokit.getDefaultLocalNetConfig('algod'),
      indexerConfig: algokit.getDefaultLocalNetConfig('indexer'),
      kmdConfig: algokit.getDefaultLocalNetConfig('kmd'),
    },
  )
}
