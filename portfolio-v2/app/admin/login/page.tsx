import { redirect } from 'next/navigation'
import { checkPassword } from '@/lib/auth'
import { setSessionCookie } from '@/lib/session'
import '../admin.css'

export const metadata = { title: 'Admin — Log in' }

async function login(formData: FormData) {
  'use server'
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/admin')
  if (!checkPassword(password)) {
    redirect(`/admin/login?error=1${next ? `&next=${encodeURIComponent(next)}` : ''}`)
  }
  await setSessionCookie()
  redirect(next.startsWith('/admin') ? next : '/admin')
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  return (
    <div className="login-wrap">
      <div className="box">
        <h1>
          admin<span className="dot">.</span>
        </h1>
        <form action={login} className="admin-form">
          <input type="hidden" name="next" value={next ?? '/admin'} />
          <div className="field">
            <label htmlFor="pw">Password</label>
            <input id="pw" name="password" type="password" autoFocus autoComplete="current-password" />
          </div>
          {error && <div className="login-err">Incorrect password.</div>}
          <div className="admin-actions">
            <button className="btn" type="submit">Enter</button>
          </div>
        </form>
      </div>
    </div>
  )
}
