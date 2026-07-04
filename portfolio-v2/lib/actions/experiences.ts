'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { experiences } from '@/lib/db/schema'

const csv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function revalidate() {
  revalidatePath('/')
  revalidatePath('/experience')
  revalidatePath('/admin/experience')
}

export async function saveExperience(formData: FormData) {
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
  redirect('/admin/experience')
}

export async function deleteExperience(formData: FormData) {
  const id = Number(formData.get('id'))
  if (id) await db.delete(experiences).where(eq(experiences.id, id))
  revalidate()
  redirect('/admin/experience')
}
