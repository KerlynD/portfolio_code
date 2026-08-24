'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/db/schema'
import { reorderProject } from '@/lib/actions/projects'
import ProjectForm from '@/components/admin/ProjectForm'
import Modal from './Modal'
import { useEdit } from './EditProvider'

function EditorModal({ item }: { item?: Project }) {
  const { closeModal } = useEdit()
  return (
    <Modal title={item ? 'Edit project' : 'New project'}>
      <ProjectForm item={item} onDone={closeModal} />
    </Modal>
  )
}

/** "+ New project" trigger (edit mode only). */
export function NewProjectButton({ className = 'edit-mini' }: { className?: string }) {
  const { editing, openModal } = useEdit()
  if (!editing) return null
  return (
    <button className={className} type="button" onClick={() => openModal(<EditorModal />)}>
      + New project
    </button>
  )
}

/** Per-project Edit + reorder controls. `item` is the DB row (undefined ⇒ nothing to edit). */
export function ProjectControls({ item }: { item?: Project }) {
  const { editing, openModal } = useEdit()
  const router = useRouter()
  const [pending, start] = useTransition()
  if (!editing || !item) return null

  function move(dir: 'up' | 'down') {
    const fd = new FormData()
    fd.set('id', String(item!.id))
    fd.set('dir', dir)
    start(async () => {
      await reorderProject(fd)
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
