import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  testTimeout: 10000,
  setupFiles: ['<rootDir>/tests/setup.ts'],
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  coveragePathIgnorePatterns: ['tests'],
  testPathIgnorePatterns: ['node_modules'],
  prettierPath: require.resolve('prettier-2'),
}
export default config
