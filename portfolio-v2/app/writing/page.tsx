import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import { getBuildSha } from '@/lib/build'
import { getSiteConfig } from '@/lib/content'
import { getPublishedPosts } from '@/lib/db/queries'
import { formatDate } from '@/lib/markdown'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const siteConfig = await getSiteConfig()
  return { title: `Writing | ${siteConfig.name}` }
}

function kindClass(k: string): string {
  return k === 'Review' ? 'review' : k === 'Paper Notes' ? 'notes' : ''
}

export default async function WritingPage() {
  const siteConfig = await getSiteConfig()
  const feed = await getPublishedPosts()
  const kinds = ['Post', 'Review', 'Paper Notes']
    .map((k) => ({ k, n: feed.filter((p) => p.kind === k).length }))
    .filter((x) => x.n > 0)

  return (
    <div className="shell">
      <SiteHeader
        active="writing"
        ghost={['NOTES', '& REVIEWS']}
        readoutTop={`writing :: ${feed.length} posts`}
        ticker={
          feed.length
            ? feed.slice(0, 4).map((p) => `${p.kind} — ${p.title}`)
            : ['nothing published yet', 'check back soon']
        }
        build={getBuildSha()}
      />

      <div className="grid main-side">
        <main className="col">
          <div className="feedbar">
            <span className="lead">Writing — notes, writeups &amp; reviews.</span>
            Everything I&rsquo;ve published, newest first.
          </div>

          <section className="panel">
            <div className="ph">
              <span className="title">The Feed</span>
              <span className="arch">{feed.length} posts</span>
            </div>
            {feed.length === 0 ? (
              <div className="pb feed-empty">
                <div className="big">Nothing yet</div>
                <p>Posts &amp; reviews will show up here.</p>
              </div>
            ) : (
              feed.map((p, i) => (
                <article className="post" key={p.id}>
                  <span className={`kind ${kindClass(p.kind)}`}>{p.kind}</span>
                  <h3>
                    <span className="idx">{String.fromCharCode(65 + (i % 26))}.</span>{' '}
                    <Link href={`/writing/${p.slug}`}>{p.title}</Link>
                  </h3>
                  <div className="meta">
                    {formatDate(p.postDate)} :: {p.category}
                    {p.rating ? (
                      <>
                        {' · '}
                        <span className="stars">{'★'.repeat(p.rating)}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="body">
                    {p.cover && (
                      <div className="thumb">
                        <img src={p.cover} alt="" />
                      </div>
                    )}
                    <div>
                      {p.excerpt && <p>{p.excerpt}</p>}
                      <Link className="more" href={`/writing/${p.slug}`}>
                        continue reading »
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </main>

        <aside className="col">
          <section className="panel">
            <div className="ph"><span className="title">Kinds</span></div>
            <div className="pb" style={{ padding: '8px 12px 14px' }}>
              {kinds.length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>—</div>
              )}
              {kinds.map((x) => (
                <div className="row" key={x.k}>
                  <span style={{ fontWeight: 'bold' }}>{x.k}</span>
                  <span className="c">{String(x.n).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="ph"><span className="title">Find Me</span></div>
            <div className="pb elsewhere">
              <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href={siteConfig.links.resume} target="_blank" rel="noopener noreferrer">Résumé</a>
              <a href={siteConfig.links.email}>Email</a>
            </div>
          </section>
        </aside>
      </div>

      <SiteFooter page="writing" />
    </div>
  )
}
