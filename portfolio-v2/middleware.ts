import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /admin/login is public; everything else under /admin requires a valid session.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const ok = await verifySession(req.cookies.get(SESSION_COOKIE)?.value)
    if (!ok) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
