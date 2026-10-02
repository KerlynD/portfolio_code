/** URL slug from a title. Shared by the post editor (live preview) and savePost. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** First paragraph of a markdown body as plain text, for an empty excerpt. */
export function excerptFrom(body: string, max = 200): string {
  const para =
    (body ?? '')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !/^(#|!\[|```|>|-{3,}|\|)/.test(p)) ?? ''
  const text = para
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…'
}
