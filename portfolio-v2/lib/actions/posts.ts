'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { and, eq, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'
import { slugify, excerptFrom } from '@/lib/slug'

function revalidateAll(slug: string) {
  updateTag('posts')
  revalidatePath('/')
  revalidatePath('/writing')
  revalidatePath(`/writing/${slug}`)
}

export async function savePost(formData: FormData): Promise<{ id: number; slug: string }> {
  await requireAdmin()
  const idRaw = formData.get('id')
  const id = idRaw ? Number(idRaw) : null

  const title = String(formData.get('title') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim() || slugify(title)
  const kind = String(formData.get('kind') ?? 'Post')
  const ratingRaw = String(formData.get('rating') ?? '').trim()
  const body = String(formData.get('body') ?? '')
  const published = formData.get('published') === 'on' || formData.get('published') === 'true'
  // An empty excerpt is filled from the body only on publish, so auto-saved drafts don't freeze it early.
  const excerpt = String(formData.get('excerpt') ?? '').trim() || (published ? excerptFrom(body) : '')

  const values = {
    slug,
    kind,
    title,
    category: String(formData.get('category') ?? '').trim(),
    excerpt,
    body,
    cover: String(formData.get('cover') ?? '').trim() || null,
    rating: kind === 'Review' && ratingRaw ? Number(ratingRaw) : null,
    published,
    postDate: String(formData.get('postDate') ?? '') || new Date().toISOString().slice(0, 10),
    updatedAt: new Date(),
  }

  if (!title) throw new Error('Title is required')
  if (await slugTaken(slug, id)) throw new Error(`Slug "${slug}" is already used by another post`)

  let savedId = id
  if (id) {
    await db.update(posts).set(values).where(eq(posts.id, id))
  } else {
    const [row] = await db.insert(posts).values(values).returning({ id: posts.id })
    savedId = row.id
  }

  revalidateAll(slug)
  return { id: savedId!, slug }
}

export async function deletePost(formData: FormData) {
  await requireAdmin()
  const id = Number(formData.get('id'))
  const slug = String(formData.get('slug') ?? '')
  if (id) await db.delete(posts).where(eq(posts.id, id))
  revalidateAll(slug)
}

/** True if another post already uses this slug. */
export async function slugTaken(slug: string, exceptId: number | null): Promise<boolean> {
  await requireAdmin()
  if (!slug) return false
  const where = exceptId ? and(eq(posts.slug, slug), ne(posts.id, exceptId)) : eq(posts.slug, slug)
  const [row] = await db.select({ id: posts.id }).from(posts).where(where).limit(1)
  return !!row
}

/** Distinct categories already in use, for the editor's suggestions. */
export async function postCategories(): Promise<string[]> {
  await requireAdmin()
  const rows = await db.selectDistinct({ category: posts.category }).from(posts)
  return rows
    .map((r) => r.category)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
}
