import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import { getBuildSha } from '@/lib/build'
import siteConfig from '@/data/siteConfig.json'
import { getPostBySlug, getPublishedPosts } from '@/lib/db/queries'
import { renderMarkdown, formatDate } from '@/lib/markdown'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  return { title: post ? `${post.title} | ${siteConfig.name}` : 'Writing' }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post || !post.published) notFound()

  const others = (await getPublishedPosts()).filter((p) => p.slug !== slug).slice(0, 5)
  const html = renderMarkdown(post.body)

  return (
    <div className="shell">
      <SiteHeader
        active="writing"
        ghost={['NOTES', '& REVIEWS']}
        readoutTop={`writing :: ${post.kind.toLowerCase()}`}
        ticker={[post.title, `${post.kind} · ${formatDate(post.postDate)}`, 'more at /writing']}
        build={getBuildSha()}
      />

      <div className="grid main-side">
        <main className="col">
          <div className="feedbar">
            <Link href="/writing">« back to writing</Link>
          </div>

          <article className="panel">
            <div className="ph">
              <span className="title">{post.kind}</span>
              <span className="arch mono">{formatDate(post.postDate)}</span>
            </div>
            <div className="pb">
              <h1 className="article-title">{post.title}</h1>
              <div className="article-meta">
                {post.category}
                {post.rating ? ` · ${'★'.repeat(post.rating)}` : ''}
              </div>
              {post.cover && <img className="article-cover" src={post.cover} alt="" />}
              <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </article>
        </main>

        <aside className="col">
          <section className="panel">
            <div className="ph"><span className="title">More Writing</span></div>
            <div className="pb" style={{ padding: '8px 12px 14px' }}>
              {others.length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>—</div>
              )}
              {others.map((p) => (
                <div className="plink" key={p.id}>
                  <Link href={`/writing/${p.slug}`}>{p.title}</Link>
                  <span className="d">
                    {p.kind} · {formatDate(p.postDate)}
                  </span>
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
