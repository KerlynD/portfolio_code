import Link from 'next/link'
import { getAllPosts } from '@/lib/db/queries'
import { deletePost } from '@/lib/actions/posts'

export const dynamic = 'force-dynamic'

export default async function PostsAdmin() {
  const all = await getAllPosts().catch(() => [])

  return (
    <>
      <h1 className="admin-h">
        <span className="slash">/</span> Writing
      </h1>
      <p className="admin-sub">Posts, reviews &amp; paper notes.</p>

      <div className="admin-actions" style={{ marginBottom: 14 }}>
        <Link className="btn" href="/admin/posts/new">
          + New post
        </Link>
      </div>

      <table className="admin-list">
        <thead>
          <tr>
            <th>Date</th>
            <th>Kind</th>
            <th>Title</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {all.length === 0 && (
            <tr>
              <td colSpan={5} style={{ color: 'var(--ink-faint)' }}>
                No posts yet — create your first one.
              </td>
            </tr>
          )}
          {all.map((p) => (
            <tr key={p.id}>
              <td className="k">{p.postDate}</td>
              <td>
                {p.kind}
                {!p.published && (
                  <>
                    {' · '}
                    <span className="draft">draft</span>
                  </>
                )}
              </td>
              <td>{p.title}</td>
              <td>
                <Link href={`/admin/posts/${p.id}`}>Edit</Link>
              </td>
              <td>
                <form action={deletePost}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="slug" value={p.slug} />
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
