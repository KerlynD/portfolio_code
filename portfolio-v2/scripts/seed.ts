/**
 * Seed the database from the existing JSON files.
 * Local:   npm run db:push  &&  npm run db:seed        (writes to file:local.db)
 * Remote:  DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:seed
 * Idempotent: existing rows (by ext_id / key) are left alone.
 */
import { db } from '../lib/db'
import { experiences, projects, communities, config } from '../lib/db/schema'
import experiencesData from '../data/experiences.json'
import projectsData from '../data/projects.json'
import communitiesData from '../data/communities.json'
import siteConfig from '../data/siteConfig.json'

async function main() {
  for (let i = 0; i < experiencesData.length; i++) {
    const e = experiencesData[i] as Record<string, unknown>
    await db
      .insert(experiences)
      .values({
        extId: e.id as string,
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
        sort: i,
      })
      .onConflictDoNothing()
  }

  for (let i = 0; i < projectsData.length; i++) {
    const p = projectsData[i] as Record<string, unknown>
    await db
      .insert(projects)
      .values({
        extId: p.id as string,
        name: p.name as string,
        shortDescription: (p.shortDescription as string) ?? '',
        description: (p.description as string) ?? '',
        tags: (p.tags as string[]) ?? [],
        image: (p.image as string) ?? null,
        links: (p.links as Record<string, string>) ?? {},
        confidential: Boolean(p.confidential),
        hackathon: (p.hackathon as string) ?? null,
        sort: i,
      })
      .onConflictDoNothing()
  }

  for (let i = 0; i < communitiesData.length; i++) {
    const c = communitiesData[i] as Record<string, unknown>
    await db
      .insert(communities)
      .values({
        extId: c.id as string,
        name: c.name as string,
        icon: (c.icon as string) ?? null,
        description: (c.description as string) ?? '',
        sort: i,
      })
      .onConflictDoNothing()
  }

  for (const [key, value] of Object.entries(siteConfig)) {
    await db
      .insert(config)
      .values({ key, value: JSON.stringify(value) })
      .onConflictDoUpdate({ target: config.key, set: { value: JSON.stringify(value) } })
  }

  console.log('✓ Seed complete.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
