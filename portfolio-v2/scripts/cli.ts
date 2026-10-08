/**
 * Dev/test helpers for the portfolio. Run from portfolio-v2/:
 *   npm run cli -- <command>
 * Every command is local-only (DB commands refuse non-file: DATABASE_URLs),
 * except `images migrate --apply --prod`, the one-time move of bundled images to Blob.
 */
import { dbReset } from './cli/db'
import { smoke } from './cli/smoke'
import { adminCookie } from './cli/admin'
import { publishShots, shots } from './cli/shots'
import { imagesMigrate } from './cli/images'
import { die, parseArgs } from './cli/util'

const HELP = `portfolio dev CLI

  db reset [--fresh]                  push schema + seed into local.db (--fresh deletes it first)
  smoke [--port 3000]                 GET every public route + each post, report status codes
  admin-cookie [--port 3000]          print a local admin session cookie (dev secret only)
  shots <pages…> [--mobile] [--prefix before] [--out .shots] [--port 3000]
                                      headless Chrome screenshots at 1280×900 (+390×844)
  shots publish <branch-slug> [--from .shots]
                                      replace <slug>/ on pr-screenshots, push, print embeds
  images migrate [--apply] [--prod] [--env-file .env]
                                      move bundled /assets images to Blob and repoint the DB + data/*.json
                                      (dry run unless --apply; a non-file DB also needs --prod)

Run the dev server for these with:
  AUTH_SECRET=portfolio-cli-local-only DATABASE_URL=file:local.db npm run dev`

async function main() {
  const [cmd, ...rest] = process.argv.slice(2)
  const { positional, flags } = parseArgs(rest)

  switch (cmd) {
    case 'db':
      if (positional[0] !== 'reset') die('Usage: db reset [--fresh]')
      return dbReset(flags)
    case 'smoke':
      return smoke(flags)
    case 'admin-cookie':
      return adminCookie(flags)
    case 'shots':
      if (positional[0] === 'publish') return publishShots(positional[1], flags)
      return shots(positional, flags)
    case 'images':
      if (positional[0] !== 'migrate') die('Usage: images migrate [--apply] [--prod] [--env-file .env]')
      return imagesMigrate(flags)
    case undefined:
    case 'help':
    case '--help':
      console.log(HELP)
      return
    default:
      die(`Unknown command: ${cmd}\n\n${HELP}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
