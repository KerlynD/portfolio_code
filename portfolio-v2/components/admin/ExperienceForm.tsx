'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveExperience, deleteExperience } from '@/lib/actions/experiences'
import ImageField from './ImageField'
import type { Experience } from '@/lib/db/schema'

export default function ExperienceForm({ item, onDone }: { item?: Experience; onDone?: () => void }) {
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function submit(fd: FormData) {
    setSaving(true)
    try {
      await saveExperience(fd)
      router.refresh()
      onDone?.()
    } catch {
      alert('Save failed — are you still signed in?')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!item || !confirm(`Delete ${item.company} — ${item.role}?`)) return
    const fd = new FormData()
    fd.set('id', String(item.id))
    await deleteExperience(fd)
    router.refresh()
    onDone?.()
  }

  return (
    <form action={submit} className="admin-form">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="row2">
        <div className="field">
          <label>Company</label>
          <input name="company" defaultValue={item?.company} required />
        </div>
        <div className="field">
          <label>Slug / ext-id (optional)</label>
          <input name="extId" defaultValue={item?.extId} placeholder="auto from company" />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label>Role</label>
          <input name="role" defaultValue={item?.role} required />
        </div>
        <div className="field">
          <label>Team</label>
          <input name="team" defaultValue={item?.team} />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label>Period</label>
          <input name="period" defaultValue={item?.period} placeholder="May – Aug 2026" />
        </div>
        <div className="field">
          <label>Sort (lower = higher up)</label>
          <input name="sort" type="number" defaultValue={item?.sort ?? 0} />
        </div>
      </div>

      <div className="field">
        <label>Description</label>
        <textarea
          name="description"
          defaultValue={item?.description}
          style={{ minHeight: 70, fontFamily: 'var(--sans)', fontSize: 13 }}
        />
      </div>

      <ImageField name="logo" label="Logo image" defaultValue={item?.logo} />

      <div className="row2">
        <div className="field">
          <label>Logo fallback (initials)</label>
          <input name="logoFallback" defaultValue={item?.logoFallback} placeholder="G" />
        </div>
        <div className="field">
          <label>Logo background (hex)</label>
          <input name="logoBackground" defaultValue={item?.logoBackground ?? ''} placeholder="#FFFFFF" />
        </div>
      </div>

      <div className="field">
        <label>Tags (comma-separated)</label>
        <input name="tags" defaultValue={item?.tags?.join(', ')} placeholder="Go, Kubernetes" />
      </div>
      <div className="field">
        <label>Highlights (comma-separated)</label>
        <input name="highlights" defaultValue={item?.highlights?.join(', ')} placeholder="Backend, Infrastructure" />
      </div>
      <div className="field">
        <label>Responsibilities (one per line)</label>
        <textarea name="responsibilities" defaultValue={item?.responsibilities?.join('\n')} />
      </div>

      <label className="hint">
        <input type="checkbox" name="current" defaultChecked={item?.current ?? false} /> Current role
      </label>

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
