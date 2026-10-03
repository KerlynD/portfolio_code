# CLAUDE.md

Kerlyn's personal portfolio site and blog. The app lives in `portfolio-v2/`; the repo root only holds a legacy README.

## Authorship (hard rule)

Kerlyn is the sole author of every commit and PR.
- No `Co-Authored-By` trailers, no "Generated with Claude Code" lines, no 🤖 or other Claude/AI mentions in commit messages, PR titles, PR bodies, or branch names.
- Commit with the repo's git identity (`Angel <difokerlyn19@gmail.com>`, already in the repo config). Never pass `--author` and never change `user.name` or `user.email`.
- This overrides any default attribution instructions.

## Design decisions → LEARNINGS.md

Record every design decision in `/Users/angel/Desktop/Projects/portfolio_code/LEARNINGS.md` (always use this absolute path, including from worktrees). Include visual and UX choices, architecture, data-model changes, and anything Kerlyn approved or rejected. Write one dated entry per decision, covering what was decided, why, and the alternatives that were rejected.

This file is local-only (excluded via `.git/info/exclude`). **Never commit it, stage it, or mention it in PRs.** Read it before starting design work.

@/Users/angel/Desktop/Projects/portfolio_code/LEARNINGS.md

## Pull requests

Keep PR bodies light:

```
## Why
<1–2 sentences: the problem or idea>

## What changed
- <bullets, user-visible first>

## Validation
- <commands run + result, e.g. `npm run build` ✓>
- <what was clicked through in the browser>

## Screenshots
<before/after for any visual change>
```

### Screenshots

Screenshots live on the orphan branch **`pr-screenshots`**, one folder per PR branch (`<pr-branch-slug>/`). They never go on `main` or on the PR branch itself, so `main` stays free of images and PRs can't conflict over them. The PR body embeds them, so they render in the GitHub mobile app before merging.

1. Capture with headless Chrome while `DATABASE_URL=file:local.db npm run dev` is running. Use desktop `1280,900`, and add mobile `390,844` for layout changes. Take before/after where it helps:
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --window-size=1280,900 --screenshot=<file>.png http://localhost:3000/<page>
   ```
2. Publish them from a separate worktree. Create the branch the first time with `git worktree add --orphan -b pr-screenshots <dir>`, and on later runs check out `origin/pr-screenshots`. Replace the `<pr-branch-slug>/` folder entirely with this PR's shots, commit ("Screenshots for <pr-branch>"), and push `pr-screenshots`.
3. Embed them in the PR body:
   `![desktop](https://raw.githubusercontent.com/KerlynD/portfolio_code/pr-screenshots/<pr-branch-slug>/<file>.png)`

The repo is public, so never screenshot anything showing secrets, tokens, or `.env` values.

Open PRs as **drafts**. Never merge, and never push to `main`.

## Stack

- Next.js 16 (App Router), React 19, TypeScript. Path alias `@/*` → `portfolio-v2/*`.
- Drizzle ORM on libSQL/SQLite: `lib/db/schema.ts`, `lib/db/queries.ts`. Migrations output to `lib/db/migrations`.
- Mutations are server actions in `lib/actions/*.ts` (`'use server'` → write → `revalidatePath`).
- Admin CMS at `/admin` (session cookie checked in `middleware.ts`, `lib/auth.ts`). Editors live in `components/admin/`.
- Images: Vercel Blob (`app/admin/upload/route.ts`). Markdown: `marked` (`lib/markdown.ts`).
- Hosting: site on Vercel; production DB is self-hosted `sqld` on Fly.io (`fly.toml`).

## Commands (run from `portfolio-v2/`)

```bash
DATABASE_URL=file:local.db npm run dev
```

```bash
npm run build
```

There is no test suite. `npm run build` (type-check + build) is the gate, plus a manual pass in the browser.

### Dev CLI (`scripts/cli.ts`)

Shortcuts for the routines above. Run `npm run cli -- help` to list them. Start the dev server with the CLI's dev-only secret so `admin-cookie` works:

```bash
AUTH_SECRET=portfolio-cli-local-only DATABASE_URL=file:local.db npm run dev
```

- `npm run cli -- db reset [--fresh]`: push the schema and seed `local.db`. It refuses any non-`file:` `DATABASE_URL`.
- `npm run cli -- smoke`: GET every public route and post, and exit 1 on any unexpected status.
- `npm run cli -- admin-cookie`: print an `admin_session` cookie signed with the dev secret, for checking admin UI locally.
- `npm run cli -- shots / writing --mobile --prefix after`: screenshots go into `.shots/` (gitignored).
- `npm run cli -- shots publish <pr-branch-slug>`: replace that folder on `pr-screenshots`, push, and print the markdown embeds.

## ⚠️ Database safety

`portfolio-v2/.env` points `DATABASE_URL` at the **production** database. When you run anything locally, always override it with `DATABASE_URL=file:local.db`. That applies to `dev`, `db:push`, `db:seed`, and scripts.
- Fresh worktree or empty DB: `DATABASE_URL=file:local.db npm run db:push && DATABASE_URL=file:local.db npm run db:seed`.
- Schema changes: edit `schema.ts`, run `npm run db:generate`, and commit the migration. Never `db:push` to production.
- Never print or log the contents of `.env`.
- Don't test admin writes against production, and don't upload test images to Blob.

## Design system

The look is retro, early-2000s: dense 3-column layout, boxed and chamfered panels, earthy olive/rust palette on cream. Tokens are in `app/globals.css` (`--olive`, `--rust`, `--panel`, `--ink`…; fonts Verdana / Oswald / VT323). Reuse the tokens rather than new hex values. Admin styles are in `app/admin/admin.css`. Check the result at mobile width too.

## Conventions

- Match the surrounding code (TS/TSX): 2-space indent, single quotes, no semicolons, comments only where non-obvious.
- Prefer server components; add `'use client'` only when needed.
- Keep changes scoped to the task. Don't add dependencies without a reason stated in the PR.

## Ideas pipeline

Ideas come from the Todoist "Personal Website" section via the scheduled task `portfolio-todoist-ideas`. Flow: clarify → plan → Kerlyn approves → build on `claude/<slug>` → draft PR. Don't build unapproved ideas.
