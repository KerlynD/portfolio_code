import { cache } from 'react'
import { asc, desc, eq } from 'drizzle-orm'
import { db } from './index'
import { cachedRead, withDates } from './cache'
import {
  posts,
  experiences,
  projects,
  communities,
  emojis,
  type Emoji,
  type Post,
  type Experience,
  type Project,
  type Community,
} from './schema'

const readPublishedPosts = cachedRead('posts', () =>
  db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.postDate), desc(posts.id)),
)

/** Published posts, newest first (id breaks same-day ties). Falls back to [] if the DB isn't reachable/seeded. */
export const getPublishedPosts = cache(async (): Promise<Post[]> => {
  try {
    return (await readPublishedPosts()).map(withDates)
  } catch (e) {
    console.error('[db] getPublishedPosts failed:', e)
    return []
  }
})

/** All posts incl. drafts (admin). */
export async function getAllPosts(): Promise<Post[]> {
  return db.select().from(posts).orderBy(desc(posts.postDate))
}

/** Published posts come from the cached list; only drafts and unknown slugs query the DB. */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const published = (await getPublishedPosts()).find((p) => p.slug === slug)
  if (published) return published
  const rows = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1)
  return rows[0]
}

export async function getPostById(id: number): Promise<Post | undefined> {
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  return rows[0]
}

/* ---- admin: experiences ---- */
export async function getAllExperiences(): Promise<Experience[]> {
  return db.select().from(experiences).orderBy(asc(experiences.sort))
}

export async function getExperienceById(id: number): Promise<Experience | undefined> {
  const rows = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1)
  return rows[0]
}

/* ---- admin: projects ---- */
export async function getAllProjects(): Promise<Project[]> {
  return db.select().from(projects).orderBy(asc(projects.sort))
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  return rows[0]
}

/* ---- communities ---- */
export async function getAllCommunities(): Promise<Community[]> {
  return db.select().from(communities).orderBy(asc(communities.sort))
}

export async function getCommunityById(id: number): Promise<Community | undefined> {
  const rows = await db.select().from(communities).where(eq(communities.id, id)).limit(1)
  return rows[0]
}

const readEmojis = cachedRead('emojis', () => db.select().from(emojis).orderBy(asc(emojis.name)))

/** Custom emojis by name. */
export const getEmojis = cache(async (): Promise<Emoji[]> => {
  try {
    return (await readEmojis()).map(withDates)
  } catch (e) {
    console.error('[db] getEmojis failed:', e)
    return []
  }
})
