'use client'

import { useState, type ChangeEvent } from 'react'
import { savePost } from '@/lib/actions/posts'
import type { Post } from '@/lib/db/schema'

export default function PostForm({ post }: { post?: Post }) {
  const [cover, setCover] = useState(post?.cover ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [uploading, setUploading] = useState(false)

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
    if (url) setCover(url)
  }

  async function onInsertImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const url = await upload(f)
    if (url) setBody((b) => `${b}\n\n![](${url})\n`)
    e.target.value = ''
  }

  return (
    <form action={savePost} className="admin-form">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="cover" value={cover} />

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
        <button className="btn" type="submit" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Save'}
        </button>
        <a className="btn ghost" href="/admin/posts">
          Cancel
        </a>
      </div>
    </form>
  )
}
