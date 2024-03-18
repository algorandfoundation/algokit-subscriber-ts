import typescript from '@rollup/plugin-typescript'
import type { LogLevel, LogOrStringHandler, RollupLog } from 'rollup'
import { RollupOptions } from 'rollup'
import pkg from './package.json' with { type: 'json' }
import { multiInput } from './rollup/multi-plugin'

const config: RollupOptions = {
  input: ['src/index.ts', 'src/testing/index.ts', 'src/types/*.ts', '!src/types/*.spec.ts'],
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].js',
      preserveModules: true,
      sourcemap: true,
      dynamicImportInCjs: false,
    },
    {
      dir: 'dist',
      format: 'es',
      entryFileNames: '[name].mjs',
      preserveModules: true,
      sourcemap: true,
    },
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
    }),
    multiInput(),
  ],
  external: [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies), '@algorandfoundation/algokit-utils/types/indexer'],
  onLog(level: LogLevel, log: RollupLog, handler: LogOrStringHandler) {
    if (log.code === 'CIRCULAR_DEPENDENCY') {
      handler('error', log)
    } else {
      handler(level, log)
    }
  },
}

export default config
