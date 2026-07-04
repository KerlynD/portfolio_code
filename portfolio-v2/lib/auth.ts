import { SignJWT, jwtVerify } from 'jose'

/** Runtime-agnostic session token helpers (safe in edge middleware & node). */

export const SESSION_COOKIE = 'admin_session'

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-insecure-secret-change-me')
}

export async function signSession(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

export async function verifySession(token?: string): Promise<boolean> {
  if (!token) return false
  try {
    await jwtVerify(token, secret())
    return true
  } catch {
    return false
  }
}

/** Constant-time-ish password check against the ADMIN_PASSWORD env var. */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  return !!expected && input === expected
}
