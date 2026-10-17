import { Marked, marked, type MarkedExtension } from 'marked'
import { emojiExtension, type EmojiMap } from './emoji'

marked.setOptions({ gfm: true, breaks: true })

/** Render markdown to HTML (single-admin content). Pass emojis to expand `:name:` shortcodes, plus any extra marked extensions. */
export function renderMarkdown(md: string, emojis?: EmojiMap, extensions: MarkedExtension[] = []): string {
  const exts = emojis && Object.keys(emojis).length ? [emojiExtension(emojis), ...extensions] : extensions
  if (exts.length) {
    const m = new Marked({ gfm: true, breaks: true }, ...exts)
    return m.parse(md ?? '', { async: false }) as string
  }
  return marked.parse(md ?? '', { async: false }) as string
}

/** Minutes to read a markdown body at 200 wpm, rounded up (min 1). Code blocks and image markup don't count. */
export function readingMinutes(md: string): number {
  const text = (md ?? '')
    .replace(/^(```|~~~)[\s\S]*?^\1.*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<img\b[^>]*>/gi, ' ')
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
  return Math.max(1, Math.ceil(words / 200))
}

/** 'YYYY-MM-DD' -> 'YYYY.MM.DD' to match the site's mono date style. */
export function formatDate(d: string): string {
  return (d ?? '').replaceAll('-', '.')
}
