import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/db/queries'
import { getSiteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

const PAGES = ['', '/about', '/experience', '/projects', '/writing']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const posts = await getPublishedPosts()
  // The feed pages change whenever a post does.
  const latest = posts.reduce<Date | undefined>((d, p) => (!d || p.updatedAt > d ? p.updatedAt : d), undefined)

  return [
    ...PAGES.map((path) => ({
      url: `${base}${path}`,
      ...(latest && (path === '' || path === '/writing') ? { lastModified: latest } : {}),
    })),
    ...posts.map((p) => ({ url: `${base}/writing/${p.slug}`, lastModified: p.updatedAt })),
  ]
}
