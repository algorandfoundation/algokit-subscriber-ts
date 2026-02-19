import type { AlgoClientConfig } from '@algorandfoundation/algokit-utils/network-client'

// ============================================================
// Individual Constants
// ============================================================

/** Algod server URL for LocalNet */
export const ALGOD_SERVER = 'http://localhost'

/** Algod port for LocalNet */
export const ALGOD_PORT = 4001

/** Algod token for LocalNet */
export const ALGOD_TOKEN = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

/** KMD server URL for LocalNet */
export const KMD_SERVER = 'http://localhost'

/** KMD port for LocalNet */
export const KMD_PORT = 4002

/** KMD token for LocalNet */
export const KMD_TOKEN = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

/** Indexer server URL for LocalNet */
export const INDEXER_SERVER = 'http://localhost'

/** Indexer port for LocalNet */
export const INDEXER_PORT = 8980

/** Indexer token for LocalNet */
export const INDEXER_TOKEN = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

// ============================================================
// Composed Config Objects
// ============================================================

/** Algod client config for LocalNet */
export const ALGOD_CONFIG: AlgoClientConfig = {
  server: ALGOD_SERVER,
  port: ALGOD_PORT,
  token: ALGOD_TOKEN,
}

/** KMD client config for LocalNet */
export const KMD_CONFIG: AlgoClientConfig = {
  server: KMD_SERVER,
  port: KMD_PORT,
  token: KMD_TOKEN,
}

/** Indexer client config for LocalNet */
export const INDEXER_CONFIG: AlgoClientConfig = {
  server: INDEXER_SERVER,
  port: INDEXER_PORT,
  token: INDEXER_TOKEN,
}
