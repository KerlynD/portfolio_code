import Link from 'next/link'
import { getAllProjects } from '@/lib/db/queries'
import { deleteProject } from '@/lib/actions/projects'

export const dynamic = 'force-dynamic'

export default async function ProjectsAdmin() {
  const all = await getAllProjects().catch(() => [])

  return (
    <>
      <h1 className="admin-h">
        <span className="slash">/</span> Projects
      </h1>
      <p className="admin-sub">Projects shown on the site, ordered by sort.</p>

      <div className="admin-actions" style={{ marginBottom: 14 }}>
        <Link className="btn" href="/admin/projects/new">
          + New project
        </Link>
      </div>

      <table className="admin-list">
        <thead>
          <tr>
            <th>Sort</th>
            <th>Name</th>
            <th>Tags</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {all.length === 0 && (
            <tr>
              <td colSpan={5} style={{ color: 'var(--ink-faint)' }}>
                No projects yet.
              </td>
            </tr>
          )}
          {all.map((p) => (
            <tr key={p.id}>
              <td className="k">{p.sort}</td>
              <td>
                {p.name}
                {p.confidential && <span className="draft"> · confidential</span>}
              </td>
              <td className="k">{p.tags.join(', ')}</td>
              <td>
                <Link href={`/admin/projects/${p.id}`}>Edit</Link>
              </td>
              <td>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="btn danger" style={{ padding: '4px 10px', fontSize: 10 }}>
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
