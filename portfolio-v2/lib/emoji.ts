import type { MarkedExtension, Tokens } from 'marked'

/** name → image URL */
export type EmojiMap = Record<string, string>

export const EMOJI_NAME = /^[a-z0-9_]{2,32}$/
const SHORTCODE = /:([a-z0-9_]{2,32}):/g

export function toEmojiMap(list: { name: string; url: string }[]): EmojiMap {
  return Object.fromEntries(list.map((e) => [e.name, e.url]))
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export function emojiImg(name: string, url: string): string {
  return `<img class="emoji" src="${esc(url)}" alt=":${name}:" title=":${name}:" draggable="false">`
}

/** Index of the first known `:name:` in src, or -1. */
function firstKnown(src: string, map: EmojiMap): number {
  for (const m of src.matchAll(SHORTCODE)) if (map[m[1]]) return m.index
  return -1
}

/**
 * marked inline extension. Only known names become images, so `10:30:00` or URLs stay
 * untouched, and code spans / blocks are skipped by marked itself.
 */
export function emojiExtension(map: EmojiMap): MarkedExtension {
  return {
    extensions: [
      {
        name: 'emoji',
        level: 'inline',
        start(src: string) {
          const i = firstKnown(src, map)
          return i < 0 ? undefined : i
        },
        tokenizer(src: string) {
          const m = /^:([a-z0-9_]{2,32}):/.exec(src)
          if (m && map[m[1]]) return { type: 'emoji', raw: m[0], name: m[1] }
        },
        renderer(token: Tokens.Generic) {
          return emojiImg(token.name, map[token.name])
        },
      },
    ],
  }
}

/** Split plain text into strings and emoji parts (for titles rendered as React nodes). */
export function splitEmoji(text: string, map: EmojiMap): (string | { name: string; url: string })[] {
  const parts: (string | { name: string; url: string })[] = []
  let last = 0
  for (const m of text.matchAll(SHORTCODE)) {
    const url = map[m[1]]
    if (!url) continue
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push({ name: m[1], url })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

/** `:name:` → `name` for plain-text contexts (tab title, ticker). Unknown names stay as typed. */
export function stripEmoji(text: string, map: EmojiMap): string {
  return text.replace(SHORTCODE, (all, name: string) => (map[name] ? name : all))
}
