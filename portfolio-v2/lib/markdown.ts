import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: true })

/** Render markdown to HTML (single-admin content). */
export function renderMarkdown(md: string): string {
  return marked.parse(md ?? '', { async: false }) as string
}

/** 'YYYY-MM-DD' -> 'YYYY.MM.DD' to match the site's mono date style. */
export function formatDate(d: string): string {
  return (d ?? '').replaceAll('-', '.')
}
