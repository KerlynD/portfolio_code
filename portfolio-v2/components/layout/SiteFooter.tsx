import Link from 'next/link'

export default function SiteFooter({ page }: { page: string }) {
  return (
    <footer className="site">
      <div>
        <Link href="/">Home</Link> — <Link href="/projects">Projects</Link> —{' '}
        <Link href="/experience">Experience</Link> — <Link href="/about">About</Link>
        &nbsp;&nbsp;<span className="badge98">Best viewed in 1024×768</span>
      </div>
      <div className="mono">angel difo :: 2026 — {page}</div>
    </footer>
  )
}
