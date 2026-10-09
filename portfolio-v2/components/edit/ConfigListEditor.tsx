'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateConfig } from '@/lib/actions/config'
import ImageField from '@/components/admin/ImageField'
import { usePopoverClose } from './EditAffordance'

export type ListField = {
  key: string
  label: string
  multiline?: boolean
  /** Render as an upload field with a thumbnail. */
  image?: boolean
  placeholder?: string
}
type Item = Record<string, string>

/**
 * Editor for a config key holding an array of records (e.g. `achievements`).
 * Add / remove / reorder rows, then save the whole array via updateConfig.
 */
export default function ConfigListEditor({
  configKey,
  fields,
  value,
  itemLabel = 'item',
}: {
  configKey: string
  fields: ListField[]
  value: Item[]
  itemLabel?: string
}) {
  const [items, setItems] = useState<Item[]>(() => value.map((v) => ({ ...v })))
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()
  const close = usePopoverClose()

  function setField(i: number, key: string, v: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: v } : it)))
  }
  function add() {
    setItems((prev) => [...prev, Object.fromEntries(fields.map((f) => [f.key, '']))])
  }
  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }
  function move(i: number, dir: -1 | 1) {
    setItems((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    start(async () => {
      try {
        await updateConfig({ [configKey]: items })
        router.refresh()
        close()
      } catch {
        setErr('Save failed — are you still signed in?')
      }
    })
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {items.map((it, i) => (
        <div key={i} className="list-item">
          <div className="list-item-h">
            <span>
              {itemLabel} {i + 1}
            </span>
            <span className="list-item-ctrls">
              <button type="button" className="edit-mini" onClick={() => move(i, -1)} title="Up">
                ↑
              </button>
              <button type="button" className="edit-mini" onClick={() => move(i, 1)} title="Down">
                ↓
              </button>
              <button type="button" className="edit-mini danger" onClick={() => remove(i)} title="Remove">
                ✕
              </button>
            </span>
          </div>
          {fields.map((f) =>
            f.image ? (
              <ImageField
                key={f.key}
                label={f.label}
                value={it[f.key] ?? ''}
                onChange={(v) => setField(i, f.key, v)}
                placeholder={f.placeholder}
              />
            ) : (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                {f.multiline ? (
                  <textarea
                    value={it[f.key] ?? ''}
                    onChange={(e) => setField(i, f.key, e.target.value)}
                    style={{ minHeight: 60 }}
                  />
                ) : (
                  <input value={it[f.key] ?? ''} onChange={(e) => setField(i, f.key, e.target.value)} />
                )}
              </div>
            ),
          )}
        </div>
      ))}

      {err && <div className="login-err">{err}</div>}
      <div className="admin-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save'}
        </button>
        <button className="btn ghost" type="button" onClick={add}>
          + Add
        </button>
        <button className="btn ghost" type="button" onClick={close}>
          Cancel
        </button>
      </div>
    </form>
  )
}
