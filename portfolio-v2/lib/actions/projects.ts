'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'

const csv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function revalidate() {
  revalidatePath('/')
  revalidatePath('/projects')
  revalidatePath('/admin/projects')
}

export async function saveProject(formData: FormData) {
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
  redirect('/admin/projects')
}

export async function deleteProject(formData: FormData) {
  const id = Number(formData.get('id'))
  if (id) await db.delete(projects).where(eq(projects.id, id))
  revalidate()
  redirect('/admin/projects')
}
