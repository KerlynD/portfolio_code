'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Experience } from '@/lib/db/schema'
import { reorderExperience } from '@/lib/actions/experiences'
import ExperienceForm from '@/components/admin/ExperienceForm'
import Modal from './Modal'
import { useEdit } from './EditProvider'

function EditorModal({ item }: { item?: Experience }) {
  const { closeModal } = useEdit()
  return (
    <Modal title={item ? 'Edit role' : 'New role'}>
      <ExperienceForm item={item} onDone={closeModal} />
    </Modal>
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
export function ExperienceControls({ item }: { item?: Experience }) {
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
    </div>
  )
}
