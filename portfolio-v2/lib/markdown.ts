import { Marked, marked } from 'marked'
import { emojiExtension, type EmojiMap } from './emoji'

marked.setOptions({ gfm: true, breaks: true })

/** Render markdown to HTML (single-admin content). Pass emojis to expand `:name:` shortcodes. */
export function renderMarkdown(md: string, emojis?: EmojiMap): string {
  if (emojis && Object.keys(emojis).length) {
    const m = new Marked({ gfm: true, breaks: true }, emojiExtension(emojis))
    return m.parse(md ?? '', { async: false }) as string
  }
  return marked.parse(md ?? '', { async: false }) as string
}

/** 'YYYY-MM-DD' -> 'YYYY.MM.DD' to match the site's mono date style. */
export function formatDate(d: string): string {
  return (d ?? '').replaceAll('-', '.')
}
