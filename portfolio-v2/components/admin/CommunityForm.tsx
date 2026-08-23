'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveCommunity, deleteCommunity } from '@/lib/actions/communities'
import ImageField from './ImageField'
import type { Community } from '@/lib/db/schema'

export default function CommunityForm({ item, onDone }: { item?: Community; onDone?: () => void }) {
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function submit(fd: FormData) {
    setSaving(true)
    try {
      await saveCommunity(fd)
      router.refresh()
      onDone?.()
    } catch {
      alert('Save failed — are you still signed in?')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!item || !confirm(`Delete community "${item.name}"?`)) return
    const fd = new FormData()
    fd.set('id', String(item.id))
    await deleteCommunity(fd)
    router.refresh()
    onDone?.()
  }

  return (
    <form action={submit} className="admin-form">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="row2">
        <div className="field">
          <label>Name</label>
          <input name="name" defaultValue={item?.name} required />
        </div>
        <div className="field">
          <label>Slug / ext-id (optional)</label>
          <input name="extId" defaultValue={item?.extId} placeholder="auto from name" />
        </div>
      </div>

      <ImageField name="icon" label="Icon image" defaultValue={item?.icon} />

      <div className="field">
        <label>Description</label>
        <textarea
          name="description"
          defaultValue={item?.description}
          style={{ minHeight: 90, fontFamily: 'var(--sans)', fontSize: 13 }}
        />
      </div>

      <div className="field">
        <label>Sort (lower = first)</label>
        <input name="sort" type="number" defaultValue={item?.sort ?? 0} />
      </div>

      <div className="admin-actions">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button className="btn ghost" type="button" onClick={() => onDone?.()}>
          Cancel
        </button>
        {item && (
          <button className="btn danger" type="button" onClick={onDelete} style={{ marginLeft: 'auto' }}>
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
