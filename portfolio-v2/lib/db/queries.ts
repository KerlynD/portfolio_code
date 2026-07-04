import { desc, eq } from 'drizzle-orm'
import { db } from './index'
import { posts, type Post } from './schema'

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
