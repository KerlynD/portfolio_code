'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateConfig } from '@/lib/actions/config'
import type { SiteImages } from '@/lib/images'
import ImageField from '@/components/admin/ImageField'
import { useEdit } from './EditProvider'
import Modal from './Modal'

const FIELDS: { key: keyof SiteImages; label: string }[] = [
  { key: 'profile', label: 'Profile photo (About page)' },
  { key: 'favicon', label: 'Favicon (browser tab)' },
  { key: 'headerBackground', label: 'Header background' },
]

/** Modal for the images that aren't tied to a panel: profile photo, favicon, header background. */
export default function SiteImagesEditor({ value }: { value: SiteImages }) {
  const [vals, setVals] = useState<SiteImages>(value)
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()
  const { closeModal } = useEdit()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    start(async () => {
      try {
        await updateConfig({ images: vals })
        router.refresh()
        closeModal()
      } catch {
        setErr('Save failed — are you still signed in?')
      }
    })
  }

  return (
    <Modal title="Site images">
      <form className="admin-form" onSubmit={onSubmit}>
        <p className="hint">Upload a replacement, or clear a field to go back to the built-in image.</p>
        {FIELDS.map((f) => (
          <ImageField
            key={f.key}
            label={f.label}
            value={vals[f.key]}
            onChange={(v) => setVals((prev) => ({ ...prev, [f.key]: v }))}
          />
        ))}
        {err && <div className="login-err">{err}</div>}
        <div className="admin-actions">
          <button className="btn" type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save'}
          </button>
          <button className="btn ghost" type="button" onClick={closeModal}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
