import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import { getSiteConfig } from '@/lib/content'
import { getPostBySlug, getEmojis } from '@/lib/db/queries'
import { toEmojiMap, stripEmoji } from '@/lib/emoji'
import { formatDate } from '@/lib/markdown'
import { shortName } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const alt = 'Post share card'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The image renderer can't read CSS variables, so these mirror the tokens in globals.css.
const c = {
  page: '#ddd9cb',
  panel: '#f3f0e6',
  panelHd: '#e7e3d5',
  ink: '#2c2a24',
  lineDk: '#a29d8d',
  olive: '#4d5720',
  oliveLt: '#6d7a34',
  rust: '#9e4a1e',
  cream: '#f4f1e6',
}

const HEADER = 112
const PAD = { top: 40, x: 56, bottom: 48 }
const PANEL = { width: size.width - PAD.x * 2, height: size.height - HEADER - PAD.top - PAD.bottom }

// Same chamfer as .panel: top-left and bottom-right corners cut. In px, because the
// image renderer doesn't resolve percentages inside clip-path.
const chamfer = (w: number, h: number, n: number) =>
  `polygon(${n}px 0px, ${w}px 0px, ${w}px ${h - n}px, ${w - n}px ${h}px, 0px ${h}px, 0px ${n}px)`

const font = (file: string) => readFile(join(process.cwd(), 'app/fonts', file))

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post || !post.published) notFound()

  const [siteConfig, emojis, oswald, vt323] = await Promise.all([
    getSiteConfig(),
    getEmojis(),
    font('Oswald-SemiBold.ttf'),
    font('VT323-Regular.ttf'),
  ])
  const name = shortName(siteConfig.name)
  const title = stripEmoji(post.title, toEmojiMap(emojis))
  const meta = [post.kind, formatDate(post.postDate), post.category].filter(Boolean).join(' · ')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          background: c.page, fontFamily: 'Oswald',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            height: HEADER, padding: `0 ${PAD.x}px 18px`, background: c.olive, borderBottom: `6px solid ${c.rust}`,
          }}
        >
          <div style={{ fontSize: 44, letterSpacing: 2, color: c.cream, textTransform: 'uppercase' }}>
            {name}
          </div>
          <div style={{ fontFamily: 'VT323', fontSize: 30, letterSpacing: 2, color: 'rgba(244, 241, 230, 0.6)' }}>
            {`writing :: ${post.kind.toLowerCase()}`}
          </div>
        </div>

        <div style={{ display: 'flex', padding: `${PAD.top}px ${PAD.x}px ${PAD.bottom}px` }}>
          {/* outer layer is the 2px border, since a real border would be cut off by the chamfer */}
          <div
            style={{
              display: 'flex', ...PANEL, padding: 2, background: c.lineDk,
              clipPath: chamfer(PANEL.width, PANEL.height, 34),
            }}
          >
            <div
              style={{
                display: 'flex', flexDirection: 'column', flex: 1, background: c.panel,
                clipPath: chamfer(PANEL.width - 4, PANEL.height - 4, 33),
              }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 28px 10px 44px', background: c.panelHd, borderBottom: `2px solid ${c.lineDk}`,
                }}
              >
                <div style={{ display: 'flex', fontSize: 26, letterSpacing: 4, textTransform: 'uppercase' }}>
                  <span style={{ color: c.rust, marginRight: 12 }}>/</span>
                  <span style={{ color: c.olive }}>{post.kind}</span>
                </div>
                <div style={{ fontFamily: 'VT323', fontSize: 30, letterSpacing: 2, color: c.oliveLt }}>
                  {formatDate(post.postDate)}
                </div>
              </div>

              <div
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1,
                  padding: '26px 44px 30px',
                }}
              >
                <div
                  style={{
                    display: 'block', lineClamp: 3, color: c.ink, lineHeight: 1.12,
                    fontSize: title.length > 60 ? 54 : 70,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', fontFamily: 'VT323', fontSize: 34,
                    letterSpacing: 2,
                  }}
                >
                  <span
                    style={{
                      display: 'block', flexShrink: 1, color: c.oliveLt, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {meta}
                  </span>
                  <span style={{ flexShrink: 0, marginLeft: 40, color: c.rust }}>{name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Oswald', data: oswald, weight: 600, style: 'normal' },
        { name: 'VT323', data: vt323, weight: 400, style: 'normal' },
      ],
    },
  )
}
