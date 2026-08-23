'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Community } from '@/lib/db/schema'
import { reorderCommunity } from '@/lib/actions/communities'
import CommunityForm from '@/components/admin/CommunityForm'
import Modal from './Modal'
import { useEdit } from './EditProvider'

function EditorModal({ item }: { item?: Community }) {
  const { closeModal } = useEdit()
  return (
    <Modal title={item ? 'Edit community' : 'New community'}>
      <CommunityForm item={item} onDone={closeModal} />
    </Modal>
  )
}

/** "+ New community" trigger (edit mode only). */
export function NewCommunityButton({ className = 'edit-mini' }: { className?: string }) {
  const { editing, openModal } = useEdit()
  if (!editing) return null
  return (
    <button className={className} type="button" onClick={() => openModal(<EditorModal />)}>
      + New community
    </button>
  )
}

/** Per-community Edit + reorder controls. `item` is the DB row (undefined ⇒ nothing to edit). */
export function CommunityControls({ item }: { item?: Community }) {
  const { editing, openModal } = useEdit()
  const router = useRouter()
  const [pending, start] = useTransition()
  if (!editing || !item) return null

  function move(dir: 'up' | 'down') {
    const fd = new FormData()
    fd.set('id', String(item!.id))
    fd.set('dir', dir)
    start(async () => {
      await reorderCommunity(fd)
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
