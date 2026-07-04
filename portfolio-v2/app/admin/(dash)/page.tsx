import Link from 'next/link'
import { db } from '@/lib/db'
import { posts, experiences, projects } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

async function safeCount(run: () => PromiseLike<unknown[]>): Promise<number> {
  try {
    return (await run()).length
  } catch {
    return 0
  }
}

export default async function Dashboard() {
  const [nPosts, nExp, nProj] = await Promise.all([
    safeCount(() => db.select().from(posts)),
    safeCount(() => db.select().from(experiences)),
    safeCount(() => db.select().from(projects)),
  ])

  return (
    <>
      <h1 className="admin-h">
        <span className="slash">/</span> Dashboard
      </h1>
      <p className="admin-sub">Write and edit everything on the site from here.</p>

      <div className="admin-grid">
        <Link className="admin-card" href="/admin/posts">
          <h3>Writing</h3>
          <p>Blog posts, reviews & paper notes.</p>
          <span className="n">{String(nPosts).padStart(2, '0')}</span>
        </Link>
        <Link className="admin-card" href="/admin/experience">
          <h3>Experience</h3>
          <p>Work history & roles.</p>
          <span className="n">{String(nExp).padStart(2, '0')}</span>
        </Link>
        <Link className="admin-card" href="/admin/projects">
          <h3>Projects</h3>
          <p>Projects, tags, links & badges.</p>
          <span className="n">{String(nProj).padStart(2, '0')}</span>
        </Link>
        <Link className="admin-card" href="/admin/config">
          <h3>Site Config</h3>
          <p>Bio, vitals, currently, skills.</p>
          <span className="n">·</span>
        </Link>
      </div>
    </>
  )
}
