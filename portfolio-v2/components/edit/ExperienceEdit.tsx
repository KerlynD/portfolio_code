'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Experience } from '@/lib/db/schema'
import { reorderExperience } from '@/lib/actions/experiences'
import ExperienceForm, { type RolePreset } from '@/components/admin/ExperienceForm'
import Modal from './Modal'
import { useEdit } from './EditProvider'

function EditorModal({ item, preset }: { item?: Experience; preset?: RolePreset }) {
  const { closeModal } = useEdit()
  return (
    <Modal title={item ? 'Edit role' : preset ? `New role at ${preset.company}` : 'New role'}>
      <ExperienceForm item={item} preset={preset} onDone={closeModal} />
    </Modal>
  )
}

/** "+ Role" on a company panel: new role with that company's name and logo prefilled. */
export function AddRoleButton({ from }: { from?: Experience }) {
  const { editing, openModal } = useEdit()
  if (!editing || !from) return null
  const preset: RolePreset = {
    company: from.company,
    logo: from.logo,
    logoFallback: from.logoFallback,
    logoBackground: from.logoBackground,
    sort: from.sort,
  }
  return (
    <button className="edit-mini" type="button" onClick={() => openModal(<EditorModal preset={preset} />)}>
      + Role
    </button>
  )
}

/** "+ New role" trigger (edit mode only). */
export function NewExperienceButton({ className = 'edit-mini' }: { className?: string }) {
  const { editing, openModal } = useEdit()
  if (!editing) return null
  return (
    <button className={className} type="button" onClick={() => openModal(<EditorModal />)}>
      + New role
    </button>
  )
}

/** Per-role Edit + reorder controls. `item` is the DB row (undefined ⇒ nothing to edit). */
export function ExperienceControls({ item, addRole = false }: { item?: Experience; addRole?: boolean }) {
  const { editing, openModal } = useEdit()
  const router = useRouter()
  const [pending, start] = useTransition()
  if (!editing || !item) return null

  function move(dir: 'up' | 'down') {
    const fd = new FormData()
    fd.set('id', String(item!.id))
    fd.set('dir', dir)
    start(async () => {
      await reorderExperience(fd)
      router.refresh()
    })
  }

  return (
    <div className="edit-controls">
      <button className="edit-mini" type="button" onClick={() => openModal(<EditorModal item={item} />)}>
        ✎ Edit
      </button>
      <button className="edit-mini" type="button" disabled={pending} onClick={() => move('up')} title="Move up">
        ↑
      </button>
      <button className="edit-mini" type="button" disabled={pending} onClick={() => move('down')} title="Move down">
        ↓
      </button>
      {addRole && <AddRoleButton from={item} />}
    </div>
  )
}
