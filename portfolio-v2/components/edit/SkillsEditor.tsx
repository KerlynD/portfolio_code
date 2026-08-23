'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateConfig } from '@/lib/actions/config'
import { usePopoverClose } from './EditAffordance'

const csv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)

/**
 * Editor for the `skills` config object (group name → list of skills). Each
 * group is a comma-separated input; saved back as arrays.
 */
export default function SkillsEditor({ value }: { value: Record<string, string[]> }) {
  const [groups, setGroups] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(value).map(([k, v]) => [k, (v ?? []).join(', ')])),
  )
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()
  const close = usePopoverClose()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const skills = Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, csv(v)]))
    start(async () => {
      try {
        await updateConfig({ skills })
        router.refresh()
        close()
      } catch {
        setErr('Save failed — are you still signed in?')
      }
    })
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {Object.keys(groups).map((group) => (
        <div className="field" key={group}>
          <label style={{ textTransform: 'capitalize' }}>{group} (comma-separated)</label>
          <input
            value={groups[group]}
            onChange={(e) => setGroups((prev) => ({ ...prev, [group]: e.target.value }))}
          />
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
