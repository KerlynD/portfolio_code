'use client'

import { logout } from '@/lib/actions/auth'
import { useEdit } from './EditProvider'
import PostEditorModal from './PostEditorModal'
import EmojiManager from './EmojiManager'

/** Floating control bar shown only to signed-in admins. */
export default function EditToolbar() {
  const { editing, setEditing, openModal } = useEdit()
  return (
    <div className="edit-toolbar">
      <span className="tb-brand">
        edit<span className="dot">.</span>
      </span>
      <button
        className={`tb-toggle${editing ? ' on' : ''}`}
        type="button"
        onClick={() => setEditing(!editing)}
      >
        {editing ? 'Editing ✓' : 'Edit mode'}
      </button>
      <button type="button" onClick={() => openModal(<PostEditorModal />)}>
        + Post
      </button>
      <button type="button" onClick={() => openModal(<EmojiManager />)}>
        ☺ Emojis
      </button>
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </div>
  )
}
