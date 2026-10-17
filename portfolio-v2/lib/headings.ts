import type { MarkedExtension, Tokens } from 'marked'

export type Heading = { depth: number; text: string; id: string }

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e: string) => {
    if (e[0] !== '#') return ENTITIES[e.toLowerCase()] ?? all
    const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
    return Number.isFinite(code) ? String.fromCodePoint(code) : all
  })
}

/** Rendered inline HTML -> plain text. Images (incl. emojis) keep their alt, so `:name:` survives for RichTitle. */
function plainText(html: string): string {
  const text = html
    .replace(/<img\b[^>]*?\balt="([^"]*)"[^>]*>/gi, '$1')
    .replace(/<[^>]*>/g, '')
  return decodeEntities(text).replace(/\s+/g, ' ').trim()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}

/**
 * marked extension: every heading gets a slug id (deduped per document with -2, -3…),
 * and h1–h3 are pushed into `outline` for the post's Contents panel.
 */
export function headingExtension(outline: Heading[]): MarkedExtension {
  const used = new Set<string>()
  return {
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens)
        const text = plainText(inner)
        const base = slugify(text)
        let id = base
        for (let n = 2; used.has(id); n++) id = `${base}-${n}`
        used.add(id)
        if (depth <= 3) outline.push({ depth, text, id })
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`
      },
    },
  }
}
