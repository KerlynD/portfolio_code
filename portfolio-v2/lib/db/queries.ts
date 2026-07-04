import { asc, desc, eq } from 'drizzle-orm'
import { db } from './index'
import { posts, experiences, projects, type Post, type Experience, type Project } from './schema'

/** Published posts, newest first. Falls back to [] if the DB isn't reachable/seeded. */
export async function getPublishedPosts(): Promise<Post[]> {
  try {
    return await db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.postDate))
  } catch (e) {
    console.error('[db] getPublishedPosts failed:', e)
    return []
  }
}

/** All posts incl. drafts (admin). */
export async function getAllPosts(): Promise<Post[]> {
  return db.select().from(posts).orderBy(desc(posts.postDate))
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
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
