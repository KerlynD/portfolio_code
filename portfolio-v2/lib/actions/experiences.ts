'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { experiences } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'

const csv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function revalidate() {
  updateTag('experiences')
  revalidatePath('/')
  revalidatePath('/experience')
}

export async function saveExperience(formData: FormData) {
  await requireAdmin()
  const idRaw = formData.get('id')
  const id = idRaw ? Number(idRaw) : null
  const company = String(formData.get('company') ?? '').trim()

  const values = {
    extId: String(formData.get('extId') ?? '').trim() || slug(company),
    company,
    role: String(formData.get('role') ?? '').trim(),
    team: String(formData.get('team') ?? '').trim(),
    period: String(formData.get('period') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    logo: String(formData.get('logo') ?? '').trim() || null,
    logoFallback: String(formData.get('logoFallback') ?? '').trim(),
    logoBackground: String(formData.get('logoBackground') ?? '').trim() || null,
    tags: csv(String(formData.get('tags') ?? '')),
    highlights: csv(String(formData.get('highlights') ?? '')),
    responsibilities: lines(String(formData.get('responsibilities') ?? '')),
    current: formData.get('current') === 'on',
    sort: Number(formData.get('sort') ?? 0) || 0,
    updatedAt: new Date(),
  }

  if (id) await db.update(experiences).set(values).where(eq(experiences.id, id))
  else await db.insert(experiences).values(values)

  revalidate()
}

export async function deleteExperience(formData: FormData) {
  await requireAdmin()
  const id = Number(formData.get('id'))
  if (id) await db.delete(experiences).where(eq(experiences.id, id))
  revalidate()
}

/** Nudge an experience up/down by swapping its `sort` with the neighbour's. */
export async function reorderExperience(formData: FormData) {
  await requireAdmin()
  const id = Number(formData.get('id'))
  const dir = String(formData.get('dir') ?? '')
  if (!id || (dir !== 'up' && dir !== 'down')) return
  const rows = await db.select().from(experiences).orderBy(asc(experiences.sort))
  const i = rows.findIndex((r) => r.id === id)
  const j = dir === 'up' ? i - 1 : i + 1
  if (i < 0 || j < 0 || j >= rows.length) return
  const a = rows[i]
  const b = rows[j]
  await db.update(experiences).set({ sort: b.sort }).where(eq(experiences.id, a.id))
  await db.update(experiences).set({ sort: a.sort }).where(eq(experiences.id, b.id))
  revalidate()
}
