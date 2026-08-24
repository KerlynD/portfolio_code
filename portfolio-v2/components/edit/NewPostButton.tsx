'use client'

import { useEdit } from './EditProvider'
import PostEditorModal from './PostEditorModal'

/** "+ New post" trigger for use inside page content (edit mode only). */
export default function NewPostButton({ className = 'btn' }: { className?: string }) {
  const { editing, openModal } = useEdit()
  if (!editing) return null
  return (
    <button className={className} type="button" onClick={() => openModal(<PostEditorModal />)}>
      + New post
    </button>
  )
}
