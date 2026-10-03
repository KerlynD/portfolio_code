import { SESSION_COOKIE, signSession } from '../../lib/auth'
import { baseUrl, str } from './util'

/**
 * Dev-only signing secret. It's public (it's in the repo), so it must never be
 * the AUTH_SECRET anywhere real; the dev server opts in by being started with it.
 */
export const DEV_AUTH_SECRET = 'portfolio-cli-local-only'

/** `admin-cookie [--port 3000]`: print a local admin session cookie and check it works. */
export async function adminCookie(flags: Record<string, string | true>) {
  // Sign with the dev secret only; never whatever AUTH_SECRET is in the environment.
  process.env.AUTH_SECRET = DEV_AUTH_SECRET
  const cookie = `${SESSION_COOKIE}=${await signSession()}`
  console.log(cookie)

  const base = baseUrl(str(flags.port, '3000'))
  try {
    // /admin always redirects: to / when signed in, to /admin/login when not.
    const res = await fetch(`${base}/admin`, { headers: { cookie }, redirect: 'manual' })
    if (!(res.headers.get('location') ?? '').includes('/admin/login')) {
      console.error(`✓ Accepted by ${base}`)
    } else {
      console.error(`! ${base} rejected it. Start dev with the dev secret:`)
      console.error(`  AUTH_SECRET=${DEV_AUTH_SECRET} DATABASE_URL=file:local.db npm run dev`)
    }
  } catch {
    console.error(`! No dev server at ${base}; cookie not checked.`)
  }
  console.error(`  curl: -H 'cookie: ${SESSION_COOKIE}=…'   browser: document.cookie = '<the line above>; path=/'`)
}
