import { cache } from 'react'
import { unstable_cache } from 'next/cache'

/** One tag per table. The server actions call `updateTag` with the table they wrote to. */
export type ContentTag = 'posts' | 'experiences' | 'projects' | 'communities' | 'config' | 'emojis'

// Writes that skip the server actions (db:seed, CLI scripts) show up within this many seconds.
const MAX_AGE = 300

/**
 * A DB read that is kept between requests, so public pages don't wait on the database.
 * `read` must throw on failure rather than return a fallback, or the fallback gets cached.
 * Entries are stored as JSON: Date columns come back as strings (see `withDates`).
 */
export function cachedRead<T>(tag: ContentTag, read: () => Promise<T>): () => Promise<T> {
  return cache(unstable_cache(read, [tag], { tags: [tag], revalidate: MAX_AGE }))
}

/** Turn the timestamp columns of a cached row back into Dates. */
export function withDates<T extends object>(row: T): T {
  const out = { ...row } as Record<string, unknown>
  for (const key of ['createdAt', 'updatedAt']) {
    if (key in out) out[key] = new Date(out[key] as string)
  }
  return out as T
}
