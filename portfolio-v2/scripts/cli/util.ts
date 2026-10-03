import { spawnSync } from 'node:child_process'

export function die(msg: string): never {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

/** Split argv into positionals and `--flag` / `--key value` options. */
export function parseArgs(argv: string[]) {
  const positional: string[] = []
  const flags: Record<string, string | true> = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) {
      positional.push(a)
      continue
    }
    const [key, inline] = a.slice(2).split('=', 2)
    if (inline !== undefined) flags[key] = inline
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) flags[key] = argv[++i]
    else flags[key] = true
  }
  return { positional, flags }
}

export function str(v: string | true | undefined, fallback: string): string {
  return typeof v === 'string' ? v : fallback
}

export function baseUrl(port: string) {
  return `http://localhost:${port}`
}

/**
 * The local DB URL, or exit. Anything that isn't a `file:` URL is treated as
 * production and refused. The URL itself is never printed.
 */
export function localDbUrl(): string {
  const url = process.env.DATABASE_URL ?? 'file:local.db'
  if (!url.startsWith('file:')) {
    die('Refusing to run: DATABASE_URL is not a file: URL (looks like production). Use DATABASE_URL=file:local.db')
  }
  return url
}

/** Env for child processes that touch the DB: forced local, no remote token. */
export function localDbEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, DATABASE_URL: localDbUrl() }
  delete env.DATABASE_AUTH_TOKEN
  return env
}

export function run(cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts })
  if (res.status !== 0) die(`${cmd} ${args.join(' ')} exited with ${res.status ?? res.signal}`)
}

/** Run and capture stdout; returns null on a non-zero exit. */
export function capture(cmd: string, args: string[], cwd?: string): string | null {
  const res = spawnSync(cmd, args, { cwd, encoding: 'utf8' })
  return res.status === 0 ? res.stdout.trim() : null
}
