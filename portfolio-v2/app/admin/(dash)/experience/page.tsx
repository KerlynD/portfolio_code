import Link from 'next/link'
import { getAllExperiences } from '@/lib/db/queries'
import { deleteExperience } from '@/lib/actions/experiences'

export const dynamic = 'force-dynamic'

export default async function ExperienceAdmin() {
  const all = await getAllExperiences().catch(() => [])

  return (
    <>
      <h1 className="admin-h">
        <span className="slash">/</span> Experience
      </h1>
      <p className="admin-sub">Roles shown on the site, ordered by sort.</p>

      <div className="admin-actions" style={{ marginBottom: 14 }}>
        <Link className="btn" href="/admin/experience/new">
          + New role
        </Link>
      </div>

      <table className="admin-list">
        <thead>
          <tr>
            <th>Sort</th>
            <th>Company</th>
            <th>Role</th>
            <th>Period</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {all.length === 0 && (
            <tr>
              <td colSpan={6} style={{ color: 'var(--ink-faint)' }}>
                No roles yet.
              </td>
            </tr>
          )}
          {all.map((e) => (
            <tr key={e.id}>
              <td className="k">{e.sort}</td>
              <td>
                {e.company}
                {e.current && <span className="draft"> · current</span>}
              </td>
              <td>{e.role}</td>
              <td className="k">{e.period}</td>
              <td>
                <Link href={`/admin/experience/${e.id}`}>Edit</Link>
              </td>
              <td>
                <form action={deleteExperience}>
                  <input type="hidden" name="id" value={e.id} />
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
