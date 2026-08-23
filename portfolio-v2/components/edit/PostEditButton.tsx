'use client'

import type { Post } from '@/lib/db/schema'
import { useEdit } from './EditProvider'
import PostEditorModal from './PostEditorModal'

/** "Edit" control shown on a post when edit mode is on. Renders nothing otherwise. */
export default function PostEditButton({ post }: { post: Post }) {
  const { editing, openModal } = useEdit()
  if (!editing) return null
  return (
    <div className="edit-controls">
      <button className="edit-mini" type="button" onClick={() => openModal(<PostEditorModal post={post} />)}>
        ✎ Edit post
      </button>
    </div>
  )
}
