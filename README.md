# Kerlyn Angel Difo — Portfolio

This is the source code for my personal portfolio and writing site. It's my own
site, not a template or starter — I keep it public mostly so the code is visible,
not so it can be reused or self-hosted by others.

The current site lives in [`portfolio-v2/`](portfolio-v2/).

## Stack

- **Next.js 16** (App Router) + **React 19**
- **libSQL / SQLite** via **Drizzle ORM** for content (posts, experience, projects, site config)
- **Vercel Blob** for image uploads
- **jose** for the admin session (JWT cookie)
- **marked** for rendering post markdown

## How editing works

There's no separate admin dashboard. After signing in at `/admin`, the live site
becomes editable in place: hovering a panel reveals a pencil that opens a small
inline editor, and posts/experience/projects can be created, edited, reordered,
and deleted directly on the page. Changes save to the database and refresh in
place. Everything is gated behind an admin session; signed-out visitors just see
the site.

## Running locally

```bash
cd portfolio-v2
npm install
npm run dev
```

Configuration (database URL, admin password, auth secret, blob token) comes from a
local `.env` file, which is intentionally not committed.
