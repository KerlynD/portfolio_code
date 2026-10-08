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
