import { existsSync, readFileSync, rmSync } from 'node:fs'
import { die, localDbEnv, localDbUrl, run } from './util'

const MIGRATIONS = 'lib/db/migrations'
// drizzle's default history table.
const HISTORY = '__drizzle_migrations'

/** `db reset [--fresh]`: push the schema and seed into the local DB. */
export function dbReset(flags: Record<string, string | true>) {
  const url = localDbUrl()
  const env = localDbEnv()

  if (flags.fresh) {
    const file = url.slice('file:'.length)
    if (!file || file.includes('://')) die('Can only --fresh a plain file: path')
    for (const f of [file, `${file}-shm`, `${file}-wal`, `${file}-journal`]) {
      if (!existsSync(f)) continue
      rmSync(f)
      console.log(`• Removed ${f}`)
    }
  }

  console.log('• Pushing schema…')
  run('npx', ['drizzle-kit', 'push'], { env })
  console.log('• Seeding…')
  run('npx', ['tsx', 'scripts/seed.ts'], { env })
  console.log('✓ Local DB ready.')
}

const createdTables = (sqlText: string) =>
  [...sqlText.matchAll(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?[`"]?(\w+)[`"]?/gi)].map((m) => m[1])

/**
 * `db migrate`: apply the pending files in lib/db/migrations with drizzle's
 * migrator. Prints the plan unless `--apply` is passed; writing to a non-file
 * DATABASE_URL also needs `--prod`. A DB with no migration history (built with
 * `db:push`) first gets every leading migration whose tables already exist
 * recorded as applied, so those aren't re-run.
 */
export async function dbMigrate(flags: Record<string, string | true>) {
  if (typeof flags['env-file'] === 'string') process.loadEnvFile(flags['env-file'])
  if (!existsSync(`${MIGRATIONS}/meta/_journal.json`)) die('Run this from portfolio-v2/')

  const apply = Boolean(flags.apply)
  const remote = !(process.env.DATABASE_URL ?? 'file:local.db').startsWith('file:')

  console.log(`• Database: ${remote ? 'REMOTE (production)' : 'local file'}`)
  console.log(`• Mode: ${apply ? 'apply' : 'dry run (pass --apply to write)'}`)
  if (apply && remote && !flags.prod) die('Refusing to write to a non-file DATABASE_URL without --prod')

  // Imported late: lib/db reads DATABASE_URL at import time, after --env-file is loaded.
  const { sql } = await import('drizzle-orm')
  const { readMigrationFiles } = await import('drizzle-orm/migrator')
  const { migrate } = await import('drizzle-orm/libsql/migrator')
  const { db } = await import('../../lib/db')

  const { entries } = JSON.parse(readFileSync(`${MIGRATIONS}/meta/_journal.json`, 'utf8')) as { entries: { tag: string }[] }
  const migrations = readMigrationFiles({ migrationsFolder: MIGRATIONS }).map((m, i) => ({ ...m, tag: entries[i].tag }))

  const rows = await db.all<{ name: string }>(sql`SELECT name FROM sqlite_master WHERE type = 'table'`)
  const tables = new Set(rows.map((r) => r.name))

  let baseline: typeof migrations = []
  let pending: typeof migrations
  if (tables.has(HISTORY)) {
    // Same rule as drizzle's migrator: anything newer than the last recorded migration.
    const [last] = await db.all<{ created_at: number }>(
      sql`SELECT created_at FROM ${sql.identifier(HISTORY)} ORDER BY created_at DESC LIMIT 1`,
    )
    pending = migrations.filter((m) => !last || Number(last.created_at) < m.folderMillis)
  } else {
    console.log('• No migration history yet (the schema was pushed, not migrated)')
    let i = 0
    for (; i < migrations.length; i++) {
      const created = createdTables(migrations[i].sql.join('\n'))
      const have = created.filter((t) => tables.has(t))
      if (!created.length || !have.length) break
      if (have.length < created.length) {
        die(
          `${migrations[i].tag} is only partly in the database (missing: ${created.filter((t) => !tables.has(t)).join(', ')}). ` +
            'Fix it by hand before migrating.',
        )
      }
    }
    baseline = migrations.slice(0, i)
    pending = migrations.slice(i)
  }

  if (baseline.length) {
    console.log(`\nAlready in the database, will be recorded as applied:`)
    for (const m of baseline) console.log(`  ${m.tag}`)
  }
  if (!pending.length && !baseline.length) {
    console.log('✓ Up to date: no pending migrations.')
    process.exit(0)
  }
  console.log(`\n${pending.length} migration(s) to apply:`)
  for (const m of pending) console.log(`  ${m.tag}`)
  if (!apply) {
    console.log('\nDry run only. Nothing was changed.')
    process.exit(0)
  }

  if (baseline.length) {
    console.log('\n• Recording existing migrations…')
    await db.run(sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(HISTORY)} (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)`)
    for (const m of baseline) {
      await db.run(sql`INSERT INTO ${sql.identifier(HISTORY)} ("hash", "created_at") VALUES (${m.hash}, ${m.folderMillis})`)
    }
  }
  if (pending.length) {
    console.log('• Applying…')
    await migrate(db, { migrationsFolder: MIGRATIONS })
  }
  console.log('✓ Done.')
  process.exit(0)
}
