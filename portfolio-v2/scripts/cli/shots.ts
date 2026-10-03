import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { baseUrl, capture, die, run, str } from './util'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const SIZES = { desktop: '1280,900', mobile: '390,844' }
const BRANCH = 'pr-screenshots'

/** '/' → 'home', '/writing/my-post' → 'writing-my-post' */
function nameFor(page: string) {
  const clean = page.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-')
  return clean || 'home'
}

/** `shots <pages…> [--mobile] [--prefix before] [--out .shots] [--port 3000]` */
export function shots(pages: string[], flags: Record<string, string | true>) {
  if (!pages.length) die('Usage: shots <page…> [--mobile] [--prefix name] [--out dir] [--port n]')
  if (!existsSync(CHROME)) die(`Chrome not found at ${CHROME}`)

  const out = resolve(str(flags.out, '.shots'))
  mkdirSync(out, { recursive: true })
  const base = baseUrl(str(flags.port, '3000'))
  const prefix = typeof flags.prefix === 'string' ? `${flags.prefix}-` : ''
  const sizes = flags.mobile ? (['desktop', 'mobile'] as const) : (['desktop'] as const)

  for (const page of pages) {
    const path = page.startsWith('/') ? page : `/${page}`
    for (const size of sizes) {
      const file = join(out, `${prefix}${nameFor(path)}-${size}.png`)
      const res = spawnSync(CHROME, [
        '--headless', '--hide-scrollbars', `--window-size=${SIZES[size]}`, `--screenshot=${file}`, base + path,
      ], { stdio: 'ignore' })
      if (res.status !== 0 || !existsSync(file)) die(`Screenshot failed for ${path} (${size})`)
      console.log(`✓ ${file}`)
    }
  }
}

/** owner/repo from the origin remote (https or ssh form). */
function githubRepo(root: string) {
  const url = capture('git', ['-C', root, 'remote', 'get-url', 'origin']) ?? ''
  const m = url.match(/github\.com[:/]([^/]+\/[^/]+?)(\.git)?$/)
  if (!m) die('origin is not a GitHub remote')
  return m[1]
}

/**
 * `shots publish <branch-slug> [--from .shots]`: replace `<slug>/` on the
 * pr-screenshots branch with the PNGs in --from, push, and print the embeds.
 */
export function publishShots(slug: string | undefined, flags: Record<string, string | true>) {
  if (!slug || !/^[a-z0-9][a-z0-9._-]*$/i.test(slug)) die('Usage: shots publish <branch-slug> (e.g. claude-dev-cli)')
  const from = resolve(str(flags.from, '.shots'))
  const pngs = existsSync(from) ? readdirSync(from).filter((f) => f.endsWith('.png')).sort() : []
  if (!pngs.length) die(`No .png files in ${from}`)

  const root = capture('git', ['rev-parse', '--show-toplevel'])
  if (!root) die('Not inside a git repo')
  const repo = githubRepo(root)

  run('git', ['-C', root, 'fetch', 'origin', BRANCH])
  const dir = mkdtempSync(join(tmpdir(), 'pr-shots-'))
  run('git', ['-C', root, 'worktree', 'add', '--detach', dir, `origin/${BRANCH}`])
  try {
    const target = join(dir, slug)
    rmSync(target, { recursive: true, force: true })
    mkdirSync(target)
    for (const f of pngs) copyFileSync(join(from, f), join(target, f))

    run('git', ['-C', dir, 'add', '-A', slug])
    const unchanged = spawnSync('git', ['-C', dir, 'diff', '--cached', '--quiet']).status === 0
    if (unchanged) {
      console.log(`• ${slug}/ already up to date on ${BRANCH}`)
    } else {
      run('git', ['-C', dir, 'commit', '-q', '-m', `Screenshots for ${slug}`])
      run('git', ['-C', dir, 'push', '-q', 'origin', `HEAD:${BRANCH}`])
      console.log(`✓ Pushed ${pngs.length} file(s) to ${BRANCH}/${slug}/`)
    }
  } finally {
    spawnSync('git', ['-C', root, 'worktree', 'remove', '--force', dir])
  }

  console.log('')
  for (const f of pngs) {
    console.log(`![${f.replace(/\.png$/, '')}](https://raw.githubusercontent.com/${repo}/${BRANCH}/${slug}/${f})`)
  }
}
