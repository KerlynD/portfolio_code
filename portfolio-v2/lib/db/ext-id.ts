import 'server-only'

export const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

type Taken = { id: number; extId: string; label: string }

/**
 * Pick the ext_id for a save. A slug typed by hand must be free (else a
 * readable error); an auto-derived one gets `-2`, `-3`… until it is free.
 * `selfId` is the row being edited, which may keep its own slug.
 */
export function resolveExtId(
  rows: Taken[],
  selfId: number | null,
  typed: string,
  derivedFrom: string,
): { extId: string; error?: undefined } | { extId?: undefined; error: string } {
  const owner = new Map(rows.filter((r) => r.id !== selfId).map((r) => [r.extId, r.label]))
  if (typed) {
    const by = owner.get(typed)
    return by ? { error: `Slug '${typed}' is already used by ${by}` } : { extId: typed }
  }
  const base = slug(derivedFrom)
  let extId = base
  for (let n = 2; owner.has(extId); n++) extId = `${base}-${n}`
  return { extId }
}

// Admin-only, so the real DB message is safe to show (Next masks thrown errors as a digest).
export function dbError(e: unknown): string {
  const cause = e instanceof Error && e.cause instanceof Error ? e.cause : e
  return `Database error: ${cause instanceof Error ? cause.message : String(cause)}`
}
