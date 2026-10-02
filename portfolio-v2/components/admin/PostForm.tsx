'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { savePost, deletePost, slugTaken, postCategories } from '@/lib/actions/posts'
import { useEdit } from '@/components/edit/EditProvider'
import { slugify, excerptFrom } from '@/lib/slug'
import type { Post } from '@/lib/db/schema'
import CoverDrop from './CoverDrop'
import MarkdownField from './MarkdownField'

const AUTOSAVE_MS = 2000
const EXCERPT_MAX = 200
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
  const [title, setTitle] = useState(post?.title ?? '')
  const [kind, setKind] = useState(post?.kind ?? 'Post')
  const [rating, setRating] = useState(post?.rating ? String(post.rating) : '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  // A new or draft post's slug follows the title until you edit it; a live post's URL stays put.
  const [slugAuto, setSlugAuto] = useState(!post || (!post.published && post.slug === slugify(post.title)))
  const [slugText, setSlugText] = useState(post?.slug ?? '')
  const [slugEditing, setSlugEditing] = useState(false)
  const [slugState, setSlugState] = useState<'ok' | 'checking' | 'taken'>('ok')
  const [categories, setCategories] = useState<string[]>([])
  const [titleError, setTitleError] = useState(false)
  const [busy, setBusy] = useState(0)
  const uploading = busy > 0
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
  const slugTakenRef = useRef(false)
  // A live post's half-written edits only ever go to a local browser draft.
  const live = !!post?.published
  const slug = slugAuto ? slugify(title) : slugText

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

    // Server saves need a title (the slug comes from it), a free slug, and never publish.
    if (live || !d.title.trim() || slugTakenRef.current) {
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
    for (const name of ['category', 'postDate'] as const) {
      const el = f.elements.namedItem(name) as HTMLInputElement | null
      if (el) el.value = d[name] ?? ''
    }
    ;(f.elements.namedItem('published') as HTMLInputElement).checked = d.published
    setTitle(d.title)
    setKind(d.kind || 'Post')
    setRating(d.rating)
    setExcerpt(d.excerpt)
    setSlugText(d.slug)
    setSlugAuto(!live && (!d.slug || d.slug === slugify(d.title)))
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

  useEffect(() => {
    postCategories().then(setCategories, () => {})
  }, [])

  // Check slug uniqueness shortly after it stops changing.
  useEffect(() => {
    slugTakenRef.current = false
    if (!slug) return setSlugState('ok')
    setSlugState('checking')
    let stale = false
    const t = setTimeout(async () => {
      const taken = await slugTaken(slug, idRef.current).catch(() => false)
      if (stale) return
      slugTakenRef.current = taken
      setSlugState(taken ? 'taken' : 'ok')
    }, 400)
    return () => {
      stale = true
      clearTimeout(t)
    }
  }, [slug])

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

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError(true)
      formRef.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus()
      return
    }
    if (slugState === 'taken') return
    const fd = new FormData(e.currentTarget)
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

  const onBusy = (b: boolean) => setBusy((n) => n + (b ? 1 : -1))
  const autoExcerpt = excerptFrom(body)

  const statusText = {
    idle: live ? 'auto save keeps a local draft' : 'auto save on',
    saving: 'saving…',
    saved: `draft saved ${hhmm(status.at)}`,
    local: `saved locally ${hhmm(status.at)}`,
    failed: 'auto save failed — kept locally',
  }[status.kind]

  return (
    <form ref={formRef} onSubmit={submit} onChange={markDirty} className="admin-form post-form" noValidate>
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

      <div className="field">
        <label htmlFor="post-title">
          Title <span className="req">*</span>
        </label>
        <input
          id="post-title"
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (e.target.value.trim()) setTitleError(false)
          }}
          onBlur={() => setTitleError(!title.trim())}
          aria-invalid={titleError}
          required
          className="title-input"
        />
        {titleError && <span className="field-err">Title is required.</span>}
        <div className="slug-line">
          <span className="slug-path">…/writing/</span>
          {slugEditing ? (
            <input
              name="slug"
              value={slugText}
              onChange={(e) => setSlugText(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
              onBlur={() => {
                setSlugText((t) => slugify(t))
                setSlugEditing(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
              autoFocus
              className="slug-input"
              aria-label="Slug"
            />
          ) : (
            <>
              <input type="hidden" name="slug" value={slug} />
              <span className="slug-val">{slug || 'your-title-here'}</span>
              <button
                type="button"
                className="slug-edit"
                title="Edit the slug"
                aria-label="Edit the slug"
                onClick={() => {
                  setSlugText(slug)
                  setSlugAuto(false)
                  setSlugEditing(true)
                }}
              >
                ✎
              </button>
              {!slugAuto && !live && (
                <button
                  type="button"
                  className="slug-edit"
                  title="Follow the title again"
                  onClick={() => {
                    setSlugAuto(true)
                    markDirty()
                  }}
                >
                  ↺ auto
                </button>
              )}
            </>
          )}
          {slug && slugState === 'taken' && <span className="field-err">already used by another post</span>}
          {slug && slugState === 'ok' && <span className="slug-ok">✓</span>}
        </div>
        {live && slug !== post?.slug && (
          <span className="hint">Changing a published post&apos;s slug breaks links to the old URL.</span>
        )}
      </div>

      <div className="row-meta">
        <div className="field">
          <label>Kind</label>
          <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option>Post</option>
            <option>Review</option>
            <option>Paper Notes</option>
          </select>
        </div>
        <div className="field">
          <label>Category</label>
          <input name="category" defaultValue={post?.category} list="post-categories" autoComplete="off" />
          <datalist id="post-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label>Date</label>
          <input
            name="postDate"
            type="date"
            defaultValue={post?.postDate ?? new Date().toISOString().slice(0, 10)}
          />
        </div>
        {kind === 'Review' && (
          <div className="field">
            <label>Rating (1–5)</label>
            <input
              name="rating"
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="row-excerpt">
        <div className="field">
          <label>
            Excerpt
            <span className={`count${excerpt.length > EXCERPT_MAX ? ' over' : ''}`}>
              {excerpt.length} / {EXCERPT_MAX}
            </span>
          </label>
          <textarea
            name="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder={autoExcerpt ? `Empty = first paragraph: ${autoExcerpt}` : 'Empty = first paragraph of the body'}
            className="excerpt-input"
          />
        </div>
        <div className="field">
          <label>Cover image</label>
          <CoverDrop
            value={cover}
            onChange={(url) => {
              setCover(url)
              markDirty()
            }}
            onBusy={onBusy}
          />
        </div>
      </div>

      <div className="field">
        <label>Body</label>
        <MarkdownField
          name="body"
          value={body}
          onChange={(v) => {
            setBody(v)
            markDirty()
          }}
          onBusy={onBusy}
        />
      </div>

      <label className="hint publish-toggle">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? false} /> Published
      </label>

      <div className="admin-actions sticky">
        <button className="btn" type="submit" disabled={uploading || saving || slugState === 'taken'}>
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
