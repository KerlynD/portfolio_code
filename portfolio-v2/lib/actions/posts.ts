'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function revalidateAll(slug: string) {
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
  const ratingRaw = String(formData.get('rating') ?? '').trim()

  const values = {
    slug,
    kind: String(formData.get('kind') ?? 'Post'),
    title,
    category: String(formData.get('category') ?? '').trim(),
    excerpt: String(formData.get('excerpt') ?? '').trim(),
    body: String(formData.get('body') ?? ''),
    cover: String(formData.get('cover') ?? '').trim() || null,
    rating: ratingRaw ? Number(ratingRaw) : null,
    published: formData.get('published') === 'on' || formData.get('published') === 'true',
    postDate: String(formData.get('postDate') ?? '') || new Date().toISOString().slice(0, 10),
    updatedAt: new Date(),
  }

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
