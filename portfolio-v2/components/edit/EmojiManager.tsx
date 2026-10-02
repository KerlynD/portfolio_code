'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { listEmojis, addEmoji, deleteEmoji } from '@/lib/actions/emojis'
import type { Emoji } from '@/lib/db/schema'
import Modal from './Modal'

const MAX_BYTES = 512 * 1024

function nameFromFile(f: File): string {
  return f.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32)
}

/** Modal to upload / delete custom emojis (used as `:name:` in posts). */
export default function EmojiManager() {
  const router = useRouter()
  const [list, setList] = useState<Emoji[] | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => listEmojis().then(setList, () => setList([]))
  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!file) return setPreview('')
    const u = URL.createObjectURL(file)
    setPreview(u)
    return () => URL.revokeObjectURL(u)
  }, [file])

  function pick(f: File | undefined) {
    setError('')
    if (!f) return
    if (!f.type.startsWith('image/')) return setError('Pick an image (png, gif, webp…)')
    if (f.size > MAX_BYTES) return setError('Keep emojis under 512 KB')
    setFile(f)
    if (!name) setName(nameFromFile(f))
  }

  async function add() {
    if (!file) return setError('Choose an image first')
    setBusy(true)
    setError('')
    try {
      // Validate the name before uploading so a bad name doesn't leave an orphaned blob.
      const clean = name.trim().toLowerCase()
      if (!/^[a-z0-9_]{2,32}$/.test(clean)) throw new Error('Names are 2–32 chars: a–z, 0–9 and _')
      if (list?.some((e) => e.name === clean)) throw new Error(`:${clean}: already exists`)
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      const r = await addEmoji(clean, data.url)
      if (r.error) throw new Error(r.error)
      setFile(null)
      setName('')
      await load()
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function remove(e: Emoji) {
    if (!confirm(`Delete :${e.name}:? Posts using it will show the text instead.`)) return
    await deleteEmoji(e.id)
    await load()
    router.refresh()
  }

  return (
    <Modal title="Emojis">
      <p className="emoji-help">
        Type <code>:name:</code> in a post title or body to use one. Typing <code>:</code> in the editor suggests matches.
      </p>

      <div className="emoji-add">
        <button type="button" className="emoji-pick" onClick={() => fileRef.current?.click()}>
          {preview ? <img src={preview} alt="" /> : <span>+ image</span>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        <div className="emoji-name">
          <span>:</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="name"
            maxLength={32}
            aria-label="Emoji name"
          />
          <span>:</span>
        </div>
        <button type="button" className="btn" onClick={add} disabled={busy || !file}>
          {busy ? 'Adding…' : 'Add'}
        </button>
      </div>
      {error && <div className="emoji-err">{error}</div>}

      <div className="emoji-grid">
        {list === null && <span className="emoji-none">loading…</span>}
        {list?.length === 0 && <span className="emoji-none">No emojis yet. Upload your first one above.</span>}
        {list?.map((e) => (
          <div className="emoji-cell" key={e.id} title={`:${e.name}:`}>
            <img src={e.url} alt={`:${e.name}:`} />
            <span className="emoji-cell-name">:{e.name}:</span>
            <button type="button" className="emoji-del" onClick={() => remove(e)} aria-label={`Delete :${e.name}:`}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </Modal>
  )
}
