'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { config } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/session'

async function setKey(key: string, value: unknown) {
  const json = JSON.stringify(value)
  await db
    .insert(config)
    .values({ key, value: json })
    .onConflictDoUpdate({ target: config.key, set: { value: json } })
}

/**
 * Granular config write for inline editing. Upserts each provided key and
 * revalidates the whole tree (config touches every page + layout metadata).
 * No redirect — the client refreshes in place after this resolves.
 */
export async function updateConfig(partial: Record<string, unknown>) {
  await requireAdmin()
  for (const [key, value] of Object.entries(partial)) {
    await setKey(key, value)
  }
  revalidatePath('/', 'layout')
}
