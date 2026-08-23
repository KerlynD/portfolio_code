'use server'

import { revalidatePath } from 'next/cache'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { communities } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function revalidate() {
  revalidatePath('/')
  revalidatePath('/about')
}

export async function saveCommunity(formData: FormData) {
  await requireAdmin()
  const idRaw = formData.get('id')
  const id = idRaw ? Number(idRaw) : null
  const name = String(formData.get('name') ?? '').trim()

  const values = {
    extId: String(formData.get('extId') ?? '').trim() || slug(name),
    name,
    icon: String(formData.get('icon') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim(),
    sort: Number(formData.get('sort') ?? 0) || 0,
  }

  if (id) await db.update(communities).set(values).where(eq(communities.id, id))
  else await db.insert(communities).values(values)

  revalidate()
}

export async function deleteCommunity(formData: FormData) {
  await requireAdmin()
  const id = Number(formData.get('id'))
  if (id) await db.delete(communities).where(eq(communities.id, id))
  revalidate()
}

/** Nudge a community up/down by swapping its `sort` with the neighbour's. */
export async function reorderCommunity(formData: FormData) {
  await requireAdmin()
  const id = Number(formData.get('id'))
  const dir = String(formData.get('dir') ?? '')
  if (!id || (dir !== 'up' && dir !== 'down')) return
  const rows = await db.select().from(communities).orderBy(asc(communities.sort))
  const i = rows.findIndex((r) => r.id === id)
  const j = dir === 'up' ? i - 1 : i + 1
  if (i < 0 || j < 0 || j >= rows.length) return
  const a = rows[i]
  const b = rows[j]
  await db.update(communities).set({ sort: b.sort }).where(eq(communities.id, a.id))
  await db.update(communities).set({ sort: a.sort }).where(eq(communities.id, b.id))
  revalidate()
}
