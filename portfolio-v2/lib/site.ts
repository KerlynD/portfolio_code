/**
 * Absolute origin of the site (no trailing slash), for sitemap / robots / OG URLs.
 * NEXT_PUBLIC_SITE_URL wins; otherwise Vercel's production domain; localhost in dev.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

/** The name the site goes by: the last two words of the full name, as in the masthead. */
export function shortName(fullName: string): string {
  return fullName.trim().split(/\s+/).slice(-2).join(' ')
}
