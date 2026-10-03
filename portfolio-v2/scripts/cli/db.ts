import { existsSync, rmSync } from 'node:fs'
import { die, localDbEnv, localDbUrl, run } from './util'

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
