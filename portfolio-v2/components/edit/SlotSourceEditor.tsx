'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateConfig } from '@/lib/actions/config'
import type { NowSlot, NowSlotSource } from '@/lib/content'
import { usePopoverClose } from './EditAffordance'

/**
 * Editor for the home "Now" card: choose what it shows (latest role | latest
 * blog post | custom text) and, for custom, the text/image. Merges into the
 * `slots` config object so other slots are preserved.
 */
export default function SlotSourceEditor({
  slotName,
  slot,
  allSlots,
}: {
  slotName: string
  slot: NowSlot
  allSlots: Record<string, unknown>
}) {
  const [src, setSrc] = useState<NowSlotSource>(slot.source)
  const [title, setTitle] = useState(slot.title)
  const [subtitle, setSubtitle] = useState(slot.subtitle)
  const [body, setBody] = useState(slot.body)
  const [image, setImage] = useState(slot.image)
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()
  const close = usePopoverClose()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const next: NowSlot = { source: src, title, subtitle, body, image }
    start(async () => {
      try {
        await updateConfig({ slots: { ...allSlots, [slotName]: next } })
        router.refresh()
        close()
      } catch {
        setErr('Save failed — are you still signed in?')
      }
    })
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="field">
        <label>Show</label>
        <select value={src} onChange={(e) => setSrc(e.target.value as NowSlotSource)}>
          <option value="latestRole">Latest role</option>
          <option value="latestPost">Latest blog post</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {src === 'custom' && (
        <>
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>Subtitle</label>
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div className="field">
            <label>Body</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="field">
            <label>Image URL (optional)</label>
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
          </div>
        </>
      )}

      {err && <div className="login-err">{err}</div>}
      <div className="admin-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save'}
        </button>
        <button className="btn ghost" type="button" onClick={close}>
          Cancel
        </button>
      </div>
    </form>
  )
}
