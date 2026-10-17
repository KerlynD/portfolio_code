import Link from 'next/link'

export default function SiteFooter({ page }: { page: string }) {
  return (
    <footer className="site">
      <div>
        <Link href="/">Home</Link> — <Link href="/experience">Experience</Link> —{' '}
        <Link href="/projects">Projects</Link> — <Link href="/writing">Writing</Link> —{' '}
        <Link href="/about">About</Link>
        &nbsp;&nbsp;<span className="badge98">Best viewed in 1024×768</span>
      </div>
      <div className="mono">angel difo :: {new Date().getFullYear()} — {page}</div>
    </footer>
  )
}
