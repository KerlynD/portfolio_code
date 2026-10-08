import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { eq } from 'drizzle-orm'
import { SITE_IMAGE_DEFAULTS } from '../../lib/images'
import { die } from './util'

// A bundled image path. The lookbehind skips `/assets/…` inside a longer URL.
const LOCAL = /(?<![\w.:/-])\/assets\/[\w./-]+\.(?:png|jpe?g|gif|webp|svg|ico)/gi
const DATA_FILES = ['data/experiences.json', 'data/projects.json', 'data/communities.json', 'data/siteConfig.json']
// Stay in the repo as fallbacks for when the DB is unreachable.
const KEEP = new Set<string>(Object.values(SITE_IMAGE_DEFAULTS))

type Ref = { where: string; value: string; save: (next: string) => Promise<unknown> }

const pathsIn = (s: string) => s.match(LOCAL) ?? []

/**
 * `images migrate`: move every bundled image the site uses to Vercel Blob and
 * point the DB (and the JSON seeds) at the Blob URLs. Prints the plan unless
 * `--apply` is passed. This is the one command meant to run against production,
 * so writing to a non-file DATABASE_URL also needs `--prod`. `--fake-upload`
 * (local DB only) skips Blob and uses placeholder URLs, to test the rewrite.
 */
export async function imagesMigrate(flags: Record<string, string | true>) {
  if (typeof flags['env-file'] === 'string') process.loadEnvFile(flags['env-file'])
  if (!existsSync('public/assets')) die('Run this from portfolio-v2/')

  const apply = Boolean(flags.apply)
  const fake = Boolean(flags['fake-upload'])
  const remote = !(process.env.DATABASE_URL ?? 'file:local.db').startsWith('file:')
  const token = process.env.BLOB_READ_WRITE_TOKEN

  console.log(`• Database: ${remote ? 'REMOTE (production)' : 'local file'}`)
  console.log(`• Mode: ${apply ? 'apply' : 'dry run (pass --apply to write)'}`)
  if (apply && remote && !flags.prod) die('Refusing to write to a non-file DATABASE_URL without --prod')
  if (fake && remote) die('--fake-upload is for local testing only')
  if (apply && !fake && !token) die('BLOB_READ_WRITE_TOKEN is not set')

  // Imported late: lib/db reads DATABASE_URL at import time, after --env-file is loaded.
  const { db } = await import('../../lib/db')
  const { experiences, projects, communities, posts, config } = await import('../../lib/db/schema')

  async function collect(): Promise<Ref[]> {
    const refs: Ref[] = []
    for (const r of await db.select().from(experiences)) {
      if (r.logo) refs.push({
        where: `experience "${r.company}" logo`,
        value: r.logo,
        save: (v) => db.update(experiences).set({ logo: v }).where(eq(experiences.id, r.id)),
      })
    }
    for (const r of await db.select().from(projects)) {
      if (r.image) refs.push({
        where: `project "${r.name}" image`,
        value: r.image,
        save: (v) => db.update(projects).set({ image: v }).where(eq(projects.id, r.id)),
      })
    }
    for (const r of await db.select().from(communities)) {
      if (r.icon) refs.push({
        where: `community "${r.name}" icon`,
        value: r.icon,
        save: (v) => db.update(communities).set({ icon: v }).where(eq(communities.id, r.id)),
      })
    }
    for (const r of await db.select().from(posts)) {
      if (r.cover) refs.push({
        where: `post "${r.slug}" cover`,
        value: r.cover,
        save: (v) => db.update(posts).set({ cover: v }).where(eq(posts.id, r.id)),
      })
      refs.push({
        where: `post "${r.slug}" body`,
        value: r.body,
        save: (v) => db.update(posts).set({ body: v }).where(eq(posts.id, r.id)),
      })
    }
    const rows = await db.select().from(config)
    for (const r of rows) {
      refs.push({
        where: `config "${r.key}"`,
        value: r.value,
        save: (v) => db.update(config).set({ value: v }).where(eq(config.key, r.key)),
      })
    }
    // The three site images have no row until they're first edited; create it from the defaults.
    if (!rows.some((r) => r.key === 'images')) {
      refs.push({
        where: 'config "images" (new)',
        value: JSON.stringify(SITE_IMAGE_DEFAULTS),
        save: (v) => db.insert(config).values({ key: 'images', value: v }),
      })
    }
    return refs.filter((r) => pathsIn(r.value).length)
  }

  const refs = await collect()
  const seeds = DATA_FILES.map((file) => ({ file, text: readFileSync(file, 'utf8') }))
  const paths = [...new Set([...refs, ...seeds.map((s) => ({ value: s.text }))].flatMap((r) => pathsIn(r.value)))].sort()

  if (!paths.length) {
    console.log('✓ Nothing to migrate: no /assets paths in the database or data/*.json.')
    process.exit(0)
  }

  console.log(`\n${paths.length} image(s) to upload:`)
  for (const p of paths) console.log(`  ${p}${KEEP.has(p) ? '  (file stays as a fallback)' : ''}`)
  console.log(`\n${refs.length} database value(s) to rewrite:`)
  for (const r of refs) console.log(`  ${r.where}: ${pathsIn(r.value).join(', ')}`)
  console.log(`\nSeed files to rewrite: ${seeds.filter((s) => pathsIn(s.text).length).map((s) => s.file).join(', ') || 'none'}`)

  const missing = paths.filter((p) => !existsSync(join('public', p)))
  if (missing.length) {
    die(
      `Missing from public/ (restore with \`git checkout origin/main -- public/<path>\`, then rerun):\n` +
        missing.map((p) => `  ${p}`).join('\n'),
    )
  }
  if (!apply) {
    console.log('\nDry run only. Nothing was uploaded or changed.')
    process.exit(0)
  }

  const urls = new Map<string, string>()
  console.log('\n• Uploading…')
  for (const p of paths) {
    const key = p.slice(1)
    if (fake) {
      urls.set(p, `https://blob.invalid/${key}`)
    } else {
      const { put } = await import('@vercel/blob')
      const blob = await put(key, readFileSync(join('public', p)), { access: 'public', token, addRandomSuffix: true })
      urls.set(p, blob.url)
    }
    console.log(`  ${p} → ${urls.get(p)}`)
  }
  const swap = (s: string) => s.replace(LOCAL, (m) => urls.get(m) ?? m)

  console.log('• Rewriting the database…')
  for (const r of refs) await r.save(swap(r.value))

  console.log('• Rewriting data/*.json…')
  for (const s of seeds) {
    const next = swap(s.text)
    if (next !== s.text) writeFileSync(s.file, next)
  }

  console.log('• Removing migrated files from public/…')
  for (const p of paths) {
    if (!KEEP.has(p)) rmSync(join('public', p))
  }

  const left = await collect()
  if (left.length) die(`${left.length} database value(s) still point at /assets:\n${left.map((r) => `  ${r.where}`).join('\n')}`)
  console.log('✓ Done. No /assets paths left in the database.')
  console.log('  Next: commit the data/ and public/ changes, push, then merge.')
  process.exit(0)
}
