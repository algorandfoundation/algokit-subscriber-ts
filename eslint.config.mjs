import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['.eslint.config.mjs', 'node_modules/**', 'dist/**', 'build/**', 'coverage/**', '**/*.d.ts', '.idea/**', '.vscode/**'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true, argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-unused-expressions': 'off',
      'prefer-template': 'error',
      'no-restricted-syntax': [
        'error',
        {
          // Algosdk v2.x.x exports a malformed ES module and when using subscriber-ts in an ESM project
          // the CJS module may be loaded, which may not fuly support all named exports.
          // The easiest solution for now, is to only use the default export.
          message: "Only use the default export in 'algosdk'. See rule comment for details",
          selector: 'ImportDeclaration[source.value="algosdk"] ImportSpecifier',
        },
      ],
    },
  },
  prettier,
)
