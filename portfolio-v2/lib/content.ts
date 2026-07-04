import { cache } from 'react'
import { asc } from 'drizzle-orm'
import { db } from './db'
import { experiences, projects, config } from './db/schema'
import experiencesJson from '@/data/experiences.json'
import projectsJson from '@/data/projects.json'
import siteConfigJson from '@/data/siteConfig.json'

export type SiteConfig = typeof siteConfigJson

/**
 * Site config, merged: DB `config` rows (edited in the admin) win over the
 * bundled JSON defaults key-by-key, so nothing is ever missing.
 */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const base = { ...(siteConfigJson as SiteConfig) } as Record<string, unknown>
  try {
    const rows = await db.select().from(config)
    for (const r of rows) {
      try {
        base[r.key] = JSON.parse(r.value)
      } catch {
        base[r.key] = r.value
      }
    }
  } catch (e) {
    console.error('[content] getSiteConfig fell back to JSON:', e)
  }
  return base as SiteConfig
})

/**
 * Normalized shapes used by the public pages, independent of the source
 * (DB when available, bundled JSON as a fallback so the site never crashes).
 * `id` is the stable string key (ext_id in the DB, `id` in the JSON).
 */
export type ExperienceView = {
  id: string
  company: string
  role: string
  team: string
  period: string
  description: string
  logo: string | null
  logoFallback: string
  logoBackground: string | null
  tags: string[]
  highlights: string[]
  responsibilities: string[]
  current: boolean
}

export type ProjectView = {
  id: string
  name: string
  shortDescription: string
  description: string
  tags: string[]
  image: string | null
  links: Record<string, string>
  confidential: boolean
  hackathon: string | null
}

export const getExperiences = cache(async (): Promise<ExperienceView[]> => {
  try {
    const rows = await db.select().from(experiences).orderBy(asc(experiences.sort))
    if (rows.length) {
      return rows.map((e) => ({
        id: e.extId,
        company: e.company,
        role: e.role,
        team: e.team,
        period: e.period,
        description: e.description,
        logo: e.logo,
        logoFallback: e.logoFallback,
        logoBackground: e.logoBackground,
        tags: e.tags,
        highlights: e.highlights,
        responsibilities: e.responsibilities,
        current: e.current,
      }))
    }
  } catch (e) {
    console.error('[content] getExperiences fell back to JSON:', e)
  }
  return (experiencesJson as Record<string, unknown>[]).map((e) => ({
    id: e.id as string,
    company: e.company as string,
    role: e.role as string,
    team: (e.team as string) ?? '',
    period: (e.period as string) ?? '',
    description: (e.description as string) ?? '',
    logo: (e.logo as string) ?? null,
    logoFallback: (e.logoFallback as string) ?? '',
    logoBackground: (e.logoBackground as string) ?? null,
    tags: (e.tags as string[]) ?? [],
    highlights: (e.highlights as string[]) ?? [],
    responsibilities: (e.responsibilities as string[]) ?? [],
    current: e.id === 'google',
  }))
})

export const getProjects = cache(async (): Promise<ProjectView[]> => {
  try {
    const rows = await db.select().from(projects).orderBy(asc(projects.sort))
    if (rows.length) {
      return rows.map((p) => ({
        id: p.extId,
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        tags: p.tags,
        image: p.image,
        links: p.links,
        confidential: p.confidential,
        hackathon: p.hackathon,
      }))
    }
  } catch (e) {
    console.error('[content] getProjects fell back to JSON:', e)
  }
  return (projectsJson as Record<string, unknown>[]).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    shortDescription: (p.shortDescription as string) ?? '',
    description: (p.description as string) ?? '',
    tags: (p.tags as string[]) ?? [],
    image: (p.image as string) ?? null,
    links: (p.links as Record<string, string>) ?? {},
    confidential: Boolean(p.confidential),
    hackathon: (p.hackathon as string) ?? null,
  }))
})
