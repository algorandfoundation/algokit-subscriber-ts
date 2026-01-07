import { MarkdownPageEvent } from 'typedoc-plugin-markdown'
export function load(app) {
  app.renderer.on(MarkdownPageEvent.BEGIN, (page) => {
    const reflection = page.model

    if (reflection?.kind) {
      console.log('Reflection:', reflection)
      page.frontmatter = {
        title: reflection.name,
        ...page.frontmatter,
      }
    }
  })
}
