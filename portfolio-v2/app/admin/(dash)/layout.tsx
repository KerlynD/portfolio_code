import Link from 'next/link'
import { redirect } from 'next/navigation'
import { clearSessionCookie } from '@/lib/session'
import '../admin.css'

export const metadata = { title: 'Admin' }

async function logout() {
  'use server'
  await clearSessionCookie()
  redirect('/admin/login')
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="admin-bar">
        <span className="brand">
          admin<span className="dot">.</span>
        </span>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/posts">Writing</Link>
        <Link href="/admin/experience">Experience</Link>
        <Link href="/admin/projects">Projects</Link>
        <Link href="/admin/config">Site</Link>
        <span className="spacer" />
        <Link href="/" target="_blank">View site ↗</Link>
        <form action={logout}>
          <button className="logout" type="submit">Log out</button>
        </form>
      </nav>
      <div className="admin-shell">{children}</div>
    </div>
  )
}
