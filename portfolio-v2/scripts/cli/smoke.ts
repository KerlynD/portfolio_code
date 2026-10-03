import { baseUrl, die, str } from './util'

const PUBLIC_ROUTES = ['/', '/about', '/experience', '/projects', '/writing', '/admin/login']

type Check = { path: string; expect: number[] }

async function hit(base: string, { path, expect }: Check) {
  const started = Date.now()
  try {
    const res = await fetch(base + path, { redirect: 'manual' })
    return { path, status: res.status, ok: expect.includes(res.status), ms: Date.now() - started, body: res.ok ? await res.text() : '' }
  } catch {
    return { path, status: 0, ok: false, ms: Date.now() - started, body: '' }
  }
}

/** Post links found on /writing, so the list matches whatever DB the server uses. */
function postPaths(html: string): string[] {
  const found = new Set<string>()
  for (const m of html.matchAll(/href="(\/writing\/[^"#?]+)"/g)) found.add(m[1])
  return [...found]
}

/** `smoke [--port 3000]`: GET every public route + each post, report status codes. */
export async function smoke(flags: Record<string, string | true>) {
  const base = baseUrl(str(flags.port, '3000'))

  const checks: Check[] = [
    ...PUBLIC_ROUTES.map((path) => ({ path, expect: [200] })),
    // Unauthenticated admin should bounce to the login page.
    { path: '/admin', expect: [307, 308] },
    { path: '/this-page-does-not-exist', expect: [404] },
  ]

  const results = []
  for (const c of checks) results.push(await hit(base, c))
  if (results.every((r) => r.status === 0)) die(`Nothing answering at ${base}. Is the dev server running?`)

  const writing = results.find((r) => r.path === '/writing')
  for (const path of postPaths(writing?.body ?? '')) results.push(await hit(base, { path, expect: [200] }))

  for (const r of results) {
    console.log(`${r.ok ? '✓' : '✗'} ${String(r.status || 'ERR').padEnd(3)} ${String(r.ms).padStart(5)}ms  ${r.path}`)
  }
  const failed = results.filter((r) => !r.ok)
  console.log(failed.length ? `\n✗ ${failed.length} of ${results.length} failed` : `\n✓ ${results.length} routes OK`)
  if (failed.length) process.exit(1)
}
