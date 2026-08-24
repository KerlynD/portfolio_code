'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProject, deleteProject } from '@/lib/actions/projects'
import ImageField from './ImageField'
import type { Project } from '@/lib/db/schema'

export default function ProjectForm({ item, onDone }: { item?: Project; onDone?: () => void }) {
  const links = item?.links ?? {}
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function submit(fd: FormData) {
    setSaving(true)
    try {
      await saveProject(fd)
      router.refresh()
      onDone?.()
    } catch {
      alert('Save failed — are you still signed in?')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!item || !confirm(`Delete project "${item.name}"?`)) return
    const fd = new FormData()
    fd.set('id', String(item.id))
    await deleteProject(fd)
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

      <div className="field">
        <label>Short description (cards)</label>
        <textarea
          name="shortDescription"
          defaultValue={item?.shortDescription}
          style={{ minHeight: 60, fontFamily: 'var(--sans)', fontSize: 13 }}
        />
      </div>
      <div className="field">
        <label>Long description</label>
        <textarea
          name="description"
          defaultValue={item?.description}
          style={{ minHeight: 70, fontFamily: 'var(--sans)', fontSize: 13 }}
        />
      </div>

      <ImageField name="image" label="Cover image" defaultValue={item?.image} />

      <div className="field">
        <label>Tags (comma-separated)</label>
        <input name="tags" defaultValue={item?.tags?.join(', ')} placeholder="Go, Distributed Systems" />
      </div>

      <div className="row2">
        <div className="field">
          <label>Live URL</label>
          <input name="link_live" defaultValue={links.live ?? ''} />
        </div>
        <div className="field">
          <label>GitHub URL</label>
          <input name="link_github" defaultValue={links.github ?? ''} />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label>Devpost URL</label>
          <input name="link_devpost" defaultValue={links.devpost ?? ''} />
        </div>
        <div className="field">
          <label>Sort (lower = first)</label>
          <input name="sort" type="number" defaultValue={item?.sort ?? 0} />
        </div>
      </div>

      <div className="field">
        <label>Hackathon badge (optional)</label>
        <input name="hackathon" defaultValue={item?.hackathon ?? ''} placeholder="HopHacks 2024 Winner: Bloomberg Track" />
      </div>

      <label className="hint">
        <input type="checkbox" name="confidential" defaultChecked={item?.confidential ?? false} /> Confidential (hide source)
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
