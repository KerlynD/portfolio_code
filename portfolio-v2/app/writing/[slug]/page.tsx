import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import { getBuildSha } from '@/lib/build'
import { getSiteConfig } from '@/lib/content'
import { getPostBySlug, getPublishedPosts, getEmojis } from '@/lib/db/queries'
import { toEmojiMap, stripEmoji } from '@/lib/emoji'
import RichTitle from '@/components/RichTitle'
import { isAdmin } from '@/lib/session'
import { renderMarkdown, formatDate, readingMinutes } from '@/lib/markdown'
import PostEditButton from '@/components/edit/PostEditButton'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [post, emojis] = await Promise.all([getPostBySlug(slug), getEmojis()])
  if (!post) return { title: 'Writing' }
  const title = stripEmoji(post.title, toEmojiMap(emojis))
  // Drafts get no share tags; the card image 404s for them too.
  if (!post.published) return { title }
  const description = post.excerpt || undefined
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/writing/${post.slug}`,
      publishedTime: post.postDate,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const siteConfig = await getSiteConfig()
  const post = await getPostBySlug(slug)
  if (!post) notFound()
  // Drafts are viewable by admins (for on-site preview) but hidden from the public.
  if (!post.published && !(await isAdmin())) notFound()

  const published = await getPublishedPosts()
  const others = published.filter((p) => p.slug !== slug).slice(0, 5)
  // Newest first, so the older neighbour is the next index. Drafts aren't in the list (at = -1).
  const at = published.findIndex((p) => p.id === post.id)
  const older = at < 0 ? undefined : published[at + 1]
  const newer = at < 0 ? undefined : published[at - 1]
  const emojis = toEmojiMap(await getEmojis())
  const html = renderMarkdown(post.body, emojis)

  return (
    <div className="shell">
      <SiteHeader
        active="writing"
        ghost={['NOTES', '& REVIEWS']}
        readoutTop={`writing :: ${post.kind.toLowerCase()}`}
        ticker={[stripEmoji(post.title, emojis), `${post.kind} · ${formatDate(post.postDate)}`, 'more at /writing']}
        build={getBuildSha()}
      />

      <div className="grid main-side">
        <main className="col">
          <div className="feedbar">
            <Link href="/writing">« back to writing</Link>
            <PostEditButton post={post} />
          </div>

          <article className="panel">
            <div className="ph">
              <span className="title">{post.kind}</span>
              <span className="arch mono">{formatDate(post.postDate)}</span>
            </div>
            <div className="pb">
              <h1 className="article-title">
                <RichTitle text={post.title} emojis={emojis} />
              </h1>
              <div className="article-meta">
                {post.category}
                {post.rating ? ` · ${'★'.repeat(post.rating)}` : ''}
                {` · ${readingMinutes(post.body)} min read`}
              </div>
              {post.cover && <img className="article-cover" src={post.cover} alt="" />}
              <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </article>

          {(older || newer) && (
            <nav className="post-nav" aria-label="More posts">
              {older ? (
                <Link className="older" href={`/writing/${older.slug}`}>
                  <span className="dir">« older</span>
                  <RichTitle text={older.title} emojis={emojis} />
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link className="newer" href={`/writing/${newer.slug}`}>
                  <span className="dir">newer »</span>
                  <RichTitle text={newer.title} emojis={emojis} />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
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
                  <Link href={`/writing/${p.slug}`}>
                    <RichTitle text={p.title} emojis={emojis} />
                  </Link>
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
