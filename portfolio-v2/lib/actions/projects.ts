'use server'

import { revalidatePath } from 'next/cache'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'

const csv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function revalidate() {
  revalidatePath('/')
  revalidatePath('/projects')
}

export async function saveProject(formData: FormData) {
  await requireAdmin()
  const idRaw = formData.get('id')
  const id = idRaw ? Number(idRaw) : null
  const name = String(formData.get('name') ?? '').trim()

  const links: Record<string, string> = {}
  for (const k of ['live', 'github', 'devpost']) {
    const v = String(formData.get(`link_${k}`) ?? '').trim()
    if (v) links[k] = v
  }

  const values = {
    extId: String(formData.get('extId') ?? '').trim() || slug(name),
    name,
    shortDescription: String(formData.get('shortDescription') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    tags: csv(String(formData.get('tags') ?? '')),
    image: String(formData.get('image') ?? '').trim() || null,
    links,
    confidential: formData.get('confidential') === 'on',
    hackathon: String(formData.get('hackathon') ?? '').trim() || null,
    sort: Number(formData.get('sort') ?? 0) || 0,
    updatedAt: new Date(),
  }

  if (id) await db.update(projects).set(values).where(eq(projects.id, id))
  else await db.insert(projects).values(values)

  revalidate()
}

export async function deleteProject(formData: FormData) {
  await requireAdmin()
  const id = Number(formData.get('id'))
  if (id) await db.delete(projects).where(eq(projects.id, id))
  revalidate()
}

/** Nudge a project up/down by swapping its `sort` with the neighbour's. */
export async function reorderProject(formData: FormData) {
  await requireAdmin()
  const id = Number(formData.get('id'))
  const dir = String(formData.get('dir') ?? '')
  if (!id || (dir !== 'up' && dir !== 'down')) return
  const rows = await db.select().from(projects).orderBy(asc(projects.sort))
  const i = rows.findIndex((r) => r.id === id)
  const j = dir === 'up' ? i - 1 : i + 1
  if (i < 0 || j < 0 || j >= rows.length) return
  const a = rows[i]
  const b = rows[j]
  await db.update(projects).set({ sort: b.sort }).where(eq(projects.id, a.id))
  await db.update(projects).set({ sort: a.sort }).where(eq(projects.id, b.id))
  revalidate()
}
