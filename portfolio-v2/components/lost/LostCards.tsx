import Link from 'next/link'

const CARDS = [
  { title: 'Writing', href: '/writing', go: 'Read the feed', desc: 'Notes, writeups & reviews, newest first.' },
  { title: 'Projects', href: '/projects', go: 'See the builds', desc: "Things I've made and shipped." },
  { title: 'Home', href: '/', go: 'Back to the start', desc: 'The front page and everything on it.' },
]

export default function LostCards() {
  return (
    <nav className="lost-cards" aria-label="Where to go instead">
      {CARDS.map((c) => (
        <Link key={c.href} href={c.href} className="panel lost-card">
          <div className="ph"><span className="title">{c.title}</span></div>
          <div className="pb">
            <span className="go">{c.go} »</span>
            <span className="d">{c.desc}</span>
          </div>
        </Link>
      ))}
    </nav>
  )
}
