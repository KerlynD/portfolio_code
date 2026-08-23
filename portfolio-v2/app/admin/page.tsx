import { redirect } from 'next/navigation'

/**
 * The old dashboard is retired — editing now happens inline on the live site.
 * Middleware guarantees a valid session here, so just bounce to the home page
 * (where the edit toolbar appears). Signed-out users are sent to /admin/login.
 */
export default function AdminIndex() {
  redirect('/')
}
