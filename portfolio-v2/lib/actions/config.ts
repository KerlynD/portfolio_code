'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { config } from '@/lib/db/schema'

const csv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)

async function setKey(key: string, value: unknown) {
  const json = JSON.stringify(value)
  await db
    .insert(config)
    .values({ key, value: json })
    .onConflictDoUpdate({ target: config.key, set: { value: json } })
}

const SCALAR_KEYS = [
  'name',
  'shortName',
  'title',
  'email',
  'location',
  'school',
  'graduationYear',
  'currentRole',
  'education',
  'statusMessage',
  'focus',
  'building',
  'currentlyReading',
  'onTheShelf',
  'aboutTagline',
  'bio',
  'aboutDescription',
]

export async function saveConfig(formData: FormData) {
  for (const k of SCALAR_KEYS) {
    await setKey(k, String(formData.get(k) ?? ''))
  }

  await setKey('links', {
    github: String(formData.get('link_github') ?? '').trim(),
    linkedin: String(formData.get('link_linkedin') ?? '').trim(),
    email: String(formData.get('link_email') ?? '').trim(),
    resume: String(formData.get('link_resume') ?? '').trim(),
  })

  await setKey('skills', {
    languages: csv(String(formData.get('skill_languages') ?? '')),
    infrastructure: csv(String(formData.get('skill_infrastructure') ?? '')),
    databases: csv(String(formData.get('skill_databases') ?? '')),
    tools: csv(String(formData.get('skill_tools') ?? '')),
  })

  // achievements is an advanced JSON field; keep the old value if it's invalid.
  const achRaw = String(formData.get('achievements') ?? '').trim()
  if (achRaw) {
    try {
      await setKey('achievements', JSON.parse(achRaw))
    } catch {
      /* ignore invalid JSON */
    }
  }

  // config touches basically every page + the layout metadata
  revalidatePath('/', 'layout')
  redirect('/admin/config')
}
