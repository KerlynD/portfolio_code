'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { emojis, type Emoji } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'
import { EMOJI_NAME } from '@/lib/emoji'

// Admin-only, so the real DB message is safe to show (Next masks thrown errors as a digest).
function dbError(e: unknown): string {
  const cause = e instanceof Error && e.cause instanceof Error ? e.cause : e
  return `Database error: ${cause instanceof Error ? cause.message : String(cause)}`
}

/** All custom emojis (for the editor's manager + autocomplete). */
export async function listEmojis(): Promise<{ emojis: Emoji[]; error?: string }> {
  await requireAdmin()
  try {
    return { emojis: await db.select().from(emojis).orderBy(emojis.name) }
  } catch (e) {
    return { emojis: [], error: dbError(e) }
  }
}

export async function addEmoji(name: string, url: string): Promise<{ error?: string }> {
  await requireAdmin()
  name = name.trim().toLowerCase()
  if (!EMOJI_NAME.test(name)) return { error: 'Names are 2–32 chars: a–z, 0–9 and _' }
  if (!url) return { error: 'Upload an image first' }
  try {
    const [taken] = await db.select({ id: emojis.id }).from(emojis).where(eq(emojis.name, name)).limit(1)
    if (taken) return { error: `:${name}: already exists` }
    await db.insert(emojis).values({ name, url })
  } catch (e) {
    return { error: dbError(e) }
  }
  updateTag('emojis')
  revalidatePath('/', 'layout')
  return {}
}

export async function deleteEmoji(id: number): Promise<{ error?: string }> {
  await requireAdmin()
  try {
    await db.delete(emojis).where(eq(emojis.id, id))
  } catch (e) {
    return { error: dbError(e) }
  }
  updateTag('emojis')
  revalidatePath('/', 'layout')
  return {}
}
