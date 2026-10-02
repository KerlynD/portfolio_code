'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { emojis, type Emoji } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'
import { EMOJI_NAME } from '@/lib/emoji'

/** All custom emojis (for the editor's manager + autocomplete). */
export async function listEmojis(): Promise<Emoji[]> {
  await requireAdmin()
  return db.select().from(emojis).orderBy(emojis.name)
}

export async function addEmoji(name: string, url: string): Promise<{ error?: string }> {
  await requireAdmin()
  name = name.trim().toLowerCase()
  if (!EMOJI_NAME.test(name)) return { error: 'Names are 2–32 chars: a–z, 0–9 and _' }
  if (!url) return { error: 'Upload an image first' }
  const [taken] = await db.select({ id: emojis.id }).from(emojis).where(eq(emojis.name, name)).limit(1)
  if (taken) return { error: `:${name}: already exists` }
  await db.insert(emojis).values({ name, url })
  revalidatePath('/', 'layout')
  return {}
}

export async function deleteEmoji(id: number) {
  await requireAdmin()
  await db.delete(emojis).where(eq(emojis.id, id))
  revalidatePath('/', 'layout')
}
