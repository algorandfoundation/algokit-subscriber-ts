import type { Loader } from 'astro/loaders'
import fs from 'node:fs'
import path from 'node:path'

type ExampleEntry = {
  id: string
  title: string
  description: string
  prerequisites: string
  code: string
  order: number
  filename: string
  runCommand: string
}

function lineSeparator(text: string, isBullet: boolean, lastWasBullet: boolean): string {
  if (!text) return ''
  if (isBullet || lastWasBullet) return '\n'
  return ' '
}

function parseJSDoc(content: string): { title: string; description: string; prerequisites: string } {
  const jsdocMatch = content.match(/\/\*\*\n([\s\S]*?)\*\//)

  if (!jsdocMatch) {
    return { title: 'Example', description: '', prerequisites: '' }
  }

  const jsdocContent = jsdocMatch[1]

  // Extract title from "Example: Title" line
  const titleMatch = jsdocContent.match(/\*\s*Example:\s*(.+)/)
  const title = titleMatch?.[1]?.trim() || 'Example'

  // Extract description - lines after title until Prerequisites or end
  const lines = jsdocContent.split('\n').map((line) => line.replace(/^\s*\*\s?/, '').trim())

  let description = ''
  let prerequisites = ''
  let inPrerequisites = false
  let lastLineWasBullet = false

  for (const line of lines) {
    if (line.startsWith('Example:')) continue

    if (line.toLowerCase().startsWith('prerequisites:') || line.toLowerCase() === 'prerequisites') {
      inPrerequisites = true
      lastLineWasBullet = false
      const prereqContent = line.replace(/prerequisites:?\s*/i, '').trim()
      if (prereqContent) prerequisites = prereqContent
      continue
    }

    if (line.startsWith('@')) continue

    if (!line) {
      lastLineWasBullet = false
      if (inPrerequisites) {
        if (prerequisites) prerequisites += '\n'
      } else if (description) {
        description += '\n'
      }
      continue
    }

    const isBullet = line.startsWith('-') || line.startsWith('•')
    if (inPrerequisites) {
      prerequisites += lineSeparator(prerequisites, isBullet, lastLineWasBullet) + line
    } else {
      description += lineSeparator(description, isBullet, lastLineWasBullet) + line
    }
    lastLineWasBullet = isBullet
  }

  return {
    title,
    description: description.trim(),
    prerequisites: prerequisites.trim() || 'LocalNet running (`algokit localnet start`)',
  }
}

/**
 * Extract order number from filename (e.g., "01-example.ts" -> 1)
 */
function extractOrder(filename: string): number {
  const match = filename.match(/^(\d+)-/)
  return match ? parseInt(match[1], 10) : 999
}

function createSlug(filename: string): string {
  return filename.replace(/\.ts$/, '').replace(/_/g, '-')
}

export function examplesLoader(): Loader {
  return {
    name: 'examples-loader',
    load: async ({ store, logger }) => {
      const examplesDir = path.resolve(process.cwd(), '..', 'examples', 'subscriber')

      logger.info(`Loading examples from ${examplesDir}`)

      if (!fs.existsSync(examplesDir)) {
        logger.error(`Examples directory not found: ${examplesDir}`)
        return
      }

      const entries: ExampleEntry[] = []

      const files = fs.readdirSync(examplesDir).filter((f) => f.endsWith('.ts') && !f.startsWith('_'))

      for (const filename of files) {
        const filePath = path.join(examplesDir, filename)
        const content = fs.readFileSync(filePath, 'utf-8')
        const { title, description, prerequisites } = parseJSDoc(content)
        const order = extractOrder(filename)
        const slug = createSlug(filename)

        const entry: ExampleEntry = {
          id: slug,
          title,
          description,
          prerequisites,
          code: content,
          order,
          filename,
          runCommand: `npm run example ${filename}`,
        }

        entries.push(entry)
      }

      entries.sort((a, b) => a.order - b.order)

      logger.info(`Found ${entries.length} examples`)

      for (const entry of entries) {
        store.set({
          id: entry.id,
          data: entry,
        })
      }
    },
  }
}

export type { ExampleEntry }