'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateConfig } from '@/lib/actions/config'
import { usePopoverClose } from './EditAffordance'

export type ConfigField = {
  key: string
  label: string
  value: string
  multiline?: boolean
}

/**
 * Popover form for one or more scalar site-config keys. Saves via updateConfig
 * then refreshes the server tree in place — the panel updates without navigation.
 */
export default function ConfigFieldEditor({ fields }: { fields: ConfigField[] }) {
  const [vals, setVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.value])),
  )
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()
  const close = usePopoverClose()

  function set(key: string, v: string) {
    setVals((prev) => ({ ...prev, [key]: v }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    start(async () => {
      try {
        await updateConfig(vals)
        router.refresh()
        close()
      } catch {
        setErr('Save failed — are you still signed in?')
      }
    })
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {fields.map((f) => (
        <div className="field" key={f.key}>
          <label>{f.label}</label>
          {f.multiline ? (
            <textarea value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          ) : (
            <input value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          )}
        </div>
      ))}
      {err && <div className="login-err">{err}</div>}
      <div className="admin-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save'}
        </button>
        <button className="btn ghost" type="button" onClick={close}>
          Cancel
        </button>
      </div>
    </form>
  )
}
