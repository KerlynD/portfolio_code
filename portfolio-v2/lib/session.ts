import { cookies } from 'next/headers'
import { SESSION_COOKIE, signSession, verifySession } from './auth'

/** Server-only cookie helpers (server components, route handlers, server actions). */

export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  return verifySession(store.get(SESSION_COOKIE)?.value)
}

export async function setSessionCookie(): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, await signSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
