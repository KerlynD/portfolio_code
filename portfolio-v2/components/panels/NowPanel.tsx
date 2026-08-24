import { getSiteConfig, getExperiences, getNowSlot } from '@/lib/content'
import { getPublishedPosts } from '@/lib/db/queries'
import { formatDate } from '@/lib/markdown'
import Editable from '@/components/edit/Editable'
import SlotSourceEditor from '@/components/edit/SlotSourceEditor'

/**
 * Home "Now" featured card. What it shows is driven by the `now` content slot:
 * the latest role, the latest blog post, or custom text. Edited inline via the
 * pencil (source switch + custom fields).
 */
export default async function NowPanel() {
  const cfg = await getSiteConfig()
  const slot = getNowSlot(cfg)

  let kicker = ''
  let sub = ''
  let text = ''
  let image: string | null = null
  let fallback = ''

  if (slot.source === 'latestPost') {
    const latest = (await getPublishedPosts())[0]
    if (latest) {
      kicker = latest.title
      sub = `${latest.kind} · ${formatDate(latest.postDate)}`
      text = latest.excerpt
      image = latest.cover
      fallback = 'POST'
    }
  } else if (slot.source === 'custom') {
    kicker = slot.title || '—'
    sub = slot.subtitle
    text = slot.body
    image = slot.image || null
    fallback = (slot.title || 'NOW').slice(0, 3).toUpperCase()
  }

  if (!kicker) {
    // default / latestRole (also the fallback if a chosen source has no data)
    const now = (await getExperiences())[0]
    if (now) {
      kicker = now.role
      sub = now.company
      text = now.description
      image = now.logo
      fallback = now.logoFallback
    }
  }

  const slots = (cfg as unknown as { slots?: Record<string, unknown> }).slots ?? {}

  return (
    <Editable label="Now" editor={<SlotSourceEditor slotName="now" slot={slot} allSlots={slots} />}>
      <section className="panel featured">
        <div className="ph">
          <span className="title">Now</span>
          <span className="arch">current</span>
        </div>
        <div className="pb">
          <div className="cover" style={{ background: 'linear-gradient(135deg,#4d76b8,#20386a)' }}>
            {image ? <img src={image} alt={kicker} /> : fallback}
          </div>
          <div className="fk">{kicker}</div>
          <div className="ft">{sub}</div>
          <p>{text}</p>
        </div>
      </section>
    </Editable>
  )
}
