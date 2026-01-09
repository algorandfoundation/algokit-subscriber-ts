import { MarkdownPageEvent } from 'typedoc-plugin-markdown'

function toUpperCamelCase(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

function formatTitle(name) {
  // Extract text after trailing '/' if present
  const baseName = name.includes('/') ? name.split('/').pop() : name
  // Convert from kebab-case to UpperCamelCase
  return toUpperCamelCase(baseName)
}

export function load(app) {
  app.renderer.on(MarkdownPageEvent.BEGIN, (page) => {
    const reflection = page.model

    if (reflection?.kind) {
      page.frontmatter = {
        title: formatTitle(reflection.name),
        ...page.frontmatter,
      }
    }
  })
}
