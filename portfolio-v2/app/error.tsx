'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import SiteFooter from '@/components/layout/SiteFooter'

// SiteHeader is an async server component, so this page carries a static stand-in.
const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Experience', href: '/experience' },
  { label: 'Projects', href: '/projects' },
  { label: 'Writing', href: '/writing' },
  { label: 'About', href: '/about' },
]

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="shell">
      <header className="masthead plain">
        <div className="mast-ghost">
          ERR<br />500
        </div>
        <div className="mast-readout">error :: 500</div>
        <div className="mast-brand">
          <div className="mast-title">
            Angel <b>Difo</b>
          </div>
          <div className="mast-sub">Software Engineer / Notes &amp; Reviews</div>
        </div>
      </header>

      <nav className="primary">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="tab">
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <main className="lost">
        <section className="panel">
          <div className="ph">
            <span className="title big">Something broke</span>
            <span className="arch mono">ERR 500</span>
          </div>
          <div className="lost-hero">
            <div className="lost-big" aria-hidden="true">500</div>
            <div className="copy">
              <h1>This page tripped over.</h1>
              <p>
                Something went wrong on my end while loading it. Give it another go, or head back
                to the front page.
              </p>
              <div className="lost-actions">
                <button type="button" className="lost-btn" onClick={reset}>Try again</button>
                <Link href="/">Back to the start »</Link>
              </div>
              {error.digest && <div className="lost-ref">ref {error.digest}</div>}
            </div>
            <div className="lost-tape" aria-hidden="true" />
          </div>
        </section>
      </main>

      <SiteFooter page="error" />
    </div>
  )
}
