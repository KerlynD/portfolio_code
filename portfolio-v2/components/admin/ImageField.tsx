'use client'

import { useState, type ChangeEvent } from 'react'
import { isImageSrc } from '@/lib/images'

/**
 * A URL text input you can also upload into (Vercel Blob). Value submits under `name`.
 * Pass `value` + `onChange` to control it from a parent instead.
 */
export default function ImageField({
  name,
  label,
  defaultValue,
  value,
  onChange,
  placeholder = '/assets/… or https://…',
}: {
  name?: string
  label: string
  defaultValue?: string | null
  value?: string
  onChange?: (url: string) => void
  placeholder?: string
}) {
  const [inner, setInner] = useState(defaultValue ?? '')
  const [busy, setBusy] = useState(false)
  const url = value ?? inner

  function setUrl(v: string) {
    setInner(v)
    onChange?.(v)
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const fd = new FormData()
    fd.append('file', f)
    setBusy(true)
    try {
      const res = await fetch('/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setUrl(data.url)
    } catch (err) {
      alert(String(err))
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <input
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={placeholder}
      />
      <input type="file" accept="image/*" onChange={onFile} />
      {busy && <span className="hint">Uploading…</span>}
      {isImageSrc(url) && <img className="admin-cover" src={url} alt="" />}
    </div>
  )
}
