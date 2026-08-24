'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { useEdit } from './EditProvider'

/** Lets an editor form close its popover after a successful save. */
const CloseCtx = createContext<() => void>(() => {})
export const usePopoverClose = () => useContext(CloseCtx)

/**
 * Client interior of <Editable>. Renders content normally; in edit mode adds a
 * pencil that toggles an anchored popover containing the passed-in editor form.
 */
export default function EditAffordance({
  label,
  editor,
  children,
}: {
  label: string
  editor: ReactNode
  children: ReactNode
}) {
  const { editing } = useEdit()
  const [open, setOpen] = useState(false)

  return (
    <div className="editable">
      {children}
      {editing && (
        <button
          className="edit-pencil"
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Edit ${label}`}
          title={`Edit ${label}`}
        >
          ✎
        </button>
      )}
      {editing && open && (
        <div className="edit-pop">
          <div className="edit-pop-h">
            <span className="slash">/</span> {label}
          </div>
          <CloseCtx.Provider value={() => setOpen(false)}>{editor}</CloseCtx.Provider>
        </div>
      )}
    </div>
  )
}
