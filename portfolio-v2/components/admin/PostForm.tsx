'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { savePost, deletePost } from '@/lib/actions/posts'
import { useEdit } from '@/components/edit/EditProvider'
import type { Post } from '@/lib/db/schema'

const AUTOSAVE_MS = 2000
const FIELDS = ['title', 'slug', 'kind', 'category', 'postDate', 'rating', 'excerpt', 'body', 'cover'] as const

type Draft = Record<(typeof FIELDS)[number], string> & {
  published: boolean
  savedAt: number
}
type Status = { kind: 'idle' | 'saving' | 'saved' | 'local' | 'failed'; at?: number }

function draftKey(id: number | null) {
  return `post-draft:${id ?? 'new'}`
}

function readDraft(id: number | null): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(id))
    return raw ? (JSON.parse(raw) as Draft) : null
  } catch {
    return null
  }
}

function writeDraft(id: number | null, d: Draft) {
  try {
    localStorage.setItem(draftKey(id), JSON.stringify(d))
  } catch {
    /* ignore */
  }
}

function clearDraft(id: number | null) {
  try {
    localStorage.removeItem(draftKey(id))
  } catch {
    /* ignore */
  }
}

function hhmm(t?: number) {
  return t ? new Date(t).toTimeString().slice(0, 5) : ''
}

export default function PostForm({ post, onDone }: { post?: Post; onDone?: () => void }) {
  const [cover, setCover] = useState(post?.cover ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [restorable, setRestorable] = useState<Draft | null>(null)
  const router = useRouter()
  const { setCloseGuard } = useEdit()

  const formRef = useRef<HTMLFormElement>(null)
  const idRef = useRef<number | null>(post?.id ?? null)
  const dirtyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inflightRef = useRef<Promise<unknown> | null>(null)
  const savedToServerRef = useRef(false)
  // A live post's half-written edits only ever go to a local browser draft.
  const live = !!post?.published

  // Read from the DOM, not state: timers fire with a stale render's closure.
  function snapshot(): Draft {
    const f = formRef.current!
    const d = { published: false, savedAt: Date.now() } as Draft
    for (const name of FIELDS) {
      const el = f.elements.namedItem(name) as HTMLInputElement | null
      d[name] = el?.value ?? ''
    }
    d.published = (f.elements.namedItem('published') as HTMLInputElement).checked
    return d
  }

  async function autosave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    if (!dirtyRef.current || !formRef.current) return
    const d = snapshot()

    // Server saves need a title (the slug comes from it) and never publish.
    if (live || !d.title.trim()) {
      writeDraft(idRef.current, d)
      setStatus({ kind: 'local', at: d.savedAt })
      return
    }

    const fd = new FormData(formRef.current)
    if (idRef.current) fd.set('id', String(idRef.current))
    fd.set('published', 'false')
    setStatus({ kind: 'saving' })
    const wasNew = idRef.current === null
    const p = savePost(fd)
    inflightRef.current = p
    try {
      const res = await p
      idRef.current = res.id
      savedToServerRef.current = true
      if (wasNew) clearDraft(null)
      clearDraft(res.id)
      dirtyRef.current = false
      setStatus({ kind: 'saved', at: Date.now() })
    } catch {
      writeDraft(idRef.current, d)
      setStatus({ kind: 'failed' })
    } finally {
      if (inflightRef.current === p) inflightRef.current = null
    }
  }

  function markDirty() {
    dirtyRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(autosave, AUTOSAVE_MS)
  }

  // Offer to restore a local draft that's newer than what's in the DB.
  useEffect(() => {
    const d = readDraft(idRef.current)
    if (d && (!post || d.savedAt > new Date(post.updatedAt).getTime())) setRestorable(d)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function restore() {
    const d = restorable
    const f = formRef.current
    if (!d || !f) return
    for (const name of FIELDS) {
      if (name === 'body' || name === 'cover') continue
      const el = f.elements.namedItem(name) as HTMLInputElement | null
      if (el) el.value = d[name] ?? ''
    }
    ;(f.elements.namedItem('published') as HTMLInputElement).checked = d.published
    setBody(d.body)
    setCover(d.cover)
    setRestorable(null)
    dirtyRef.current = true
    setStatus({ kind: 'local', at: d.savedAt })
  }

  function discard() {
    clearDraft(idRef.current)
    setRestorable(null)
  }

  // Cmd/Ctrl+S saves now; warn before leaving with unsaved changes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void autosave()
      }
    }
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('beforeunload', onUnload)
    setCloseGuard(() => {
      if (!dirtyRef.current) return true
      if (live) {
        // Keep a local copy so nothing is lost if they close anyway.
        if (formRef.current) writeDraft(idRef.current, snapshot())
        return confirm('You have unsaved changes (kept as a local draft). Close anyway?')
      }
      return confirm('You have unsaved changes. Close anyway?')
    })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('beforeunload', onUnload)
      setCloseGuard(null)
    }
  })

  // On close: stop any pending timer and pick up auto-saved drafts in the page lists.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (savedToServerRef.current) router.refresh()
    }
  }, [router])

  async function submit(fd: FormData) {
    setSaving(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    try {
      // Don't race a first auto-save into a duplicate insert.
      if (inflightRef.current) await inflightRef.current.catch(() => {})
      if (idRef.current) fd.set('id', String(idRef.current))
      await savePost(fd)
      clearDraft(null)
      clearDraft(idRef.current)
      dirtyRef.current = false
      router.refresh()
      onDone?.()
    } catch {
      alert('Save failed — are you still signed in?')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!post || !confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    const fd = new FormData()
    fd.set('id', String(post.id))
    fd.set('slug', post.slug)
    await deletePost(fd)
    clearDraft(post.id)
    dirtyRef.current = false
    router.refresh()
    onDone?.()
  }

  async function upload(file: File): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    try {
      const res = await fetch('/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      return data.url as string
    } catch (e) {
      alert(String(e))
      return null
    } finally {
      setUploading(false)
    }
  }

  async function onCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const url = await upload(f)
    if (url) {
      setCover(url)
      markDirty()
    }
  }

  async function onInsertImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const url = await upload(f)
    if (url) {
      setBody((b) => `${b}\n\n![](${url})\n`)
      markDirty()
    }
    e.target.value = ''
  }

  const statusText = {
    idle: live ? 'auto save keeps a local draft' : 'auto save on',
    saving: 'saving…',
    saved: `draft saved ${hhmm(status.at)}`,
    local: `saved locally ${hhmm(status.at)}`,
    failed: 'auto save failed — kept locally',
  }[status.kind]

  return (
    <form ref={formRef} action={submit} onChange={markDirty} className="admin-form">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="cover" value={cover} />

      {restorable && (
        <div className="autosave-restore">
          <span>Unsaved draft from {hhmm(restorable.savedAt)}. Restore it?</span>
          <button className="edit-mini" type="button" onClick={restore}>
            Restore
          </button>
          <button className="edit-mini" type="button" onClick={discard}>
            Discard
          </button>
        </div>
      )}

      <div className="row2">
        <div className="field">
          <label>Title</label>
          <input name="title" defaultValue={post?.title} required />
        </div>
        <div className="field">
          <label>Slug (optional)</label>
          <input name="slug" defaultValue={post?.slug} placeholder="auto from title" />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label>Kind</label>
          <select name="kind" defaultValue={post?.kind ?? 'Post'}>
            <option>Post</option>
            <option>Review</option>
            <option>Paper Notes</option>
          </select>
        </div>
        <div className="field">
          <label>Category</label>
          <input name="category" defaultValue={post?.category} placeholder="distributed-systems" />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label>Date</label>
          <input
            name="postDate"
            type="date"
            defaultValue={post?.postDate ?? new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="field">
          <label>Rating (reviews · 1–5)</label>
          <input name="rating" type="number" min="1" max="5" defaultValue={post?.rating ?? ''} />
        </div>
      </div>

      <div className="field">
        <label>Excerpt</label>
        <textarea
          name="excerpt"
          defaultValue={post?.excerpt}
          style={{ minHeight: 70, fontFamily: 'var(--sans)', fontSize: 13 }}
        />
      </div>

      <div className="field">
        <label>Cover image</label>
        <input type="file" accept="image/*" onChange={onCoverChange} />
        {cover && <img className="admin-cover" src={cover} alt="cover" />}
      </div>

      <div className="field">
        <label>Body (markdown)</label>
        <textarea name="body" value={body} onChange={(e) => setBody(e.target.value)} />
        <label className="hint" style={{ cursor: 'pointer' }}>
          + upload &amp; insert image into body
          <input type="file" accept="image/*" onChange={onInsertImage} style={{ display: 'none' }} />
        </label>
      </div>

      <label className="hint">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? true} /> Published
      </label>

      <div className="admin-actions">
        <button className="btn" type="submit" disabled={uploading || saving}>
          {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Save'}
        </button>
        <button className="btn ghost" type="button" onClick={() => onDone?.()}>
          Cancel
        </button>
        <span className={`autosave-status${status.kind === 'failed' ? ' failed' : ''}`} aria-live="polite">
          {statusText}
        </span>
        {post && (
          <button className="btn danger" type="button" onClick={onDelete} style={{ marginLeft: 'auto' }}>
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
