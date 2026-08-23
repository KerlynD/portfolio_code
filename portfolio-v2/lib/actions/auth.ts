'use server'

import { redirect } from 'next/navigation'
import { clearSessionCookie } from '@/lib/session'

/** End the edit session and return to the live home page. */
export async function logout() {
  await clearSessionCookie()
  redirect('/')
}
