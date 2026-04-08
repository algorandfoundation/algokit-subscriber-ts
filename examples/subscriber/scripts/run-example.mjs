import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '..', '..', '..', 'dist')

if (!existsSync(distDir)) {
  console.error(`ERROR: dist/ not found at ${distDir}`)
  console.error('Run "npm run build" from the project root first.')
  process.exit(1)
}

const exampleFile = process.argv[2]
if (!exampleFile) {
  console.error('Usage: npm run example -- <path-to-example.ts>')
  process.exit(1)
}

const resolvedPath = resolve(process.cwd(), exampleFile)
if (!existsSync(resolvedPath)) {
  console.error(`ERROR: Example file not found: ${resolvedPath}`)
  process.exit(1)
}

execSync(`npx tsx --tsconfig tsconfig.run.json ${resolvedPath}`, {
  stdio: 'inherit',
  cwd: resolve(__dirname, '..'),
})
