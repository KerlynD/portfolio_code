'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type EditContextValue = {
  editing: boolean
  setEditing: (v: boolean) => void
  /** Open a centered modal (e.g. the post / experience / project editor). */
  openModal: (node: ReactNode) => void
  closeModal: () => void
}

const EditContext = createContext<EditContextValue | null>(null)

/** Available to any editable component. Returns null-safe defaults for non-admins. */
export function useEdit(): EditContextValue {
  return (
    useContext(EditContext) ?? {
      editing: false,
      setEditing: () => {},
      openModal: () => {},
      closeModal: () => {},
    }
  )
}

const STORAGE_KEY = 'portfolio-edit-mode'

export default function EditProvider({ children }: { children: ReactNode }) {
  const [editing, setEditingState] = useState(false)
  const [modal, setModal] = useState<ReactNode>(null)

  // Restore the toggle across refreshes so an edit session feels continuous.
  // Default ON when there's no stored preference, so admins land editable.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setEditingState(stored === null ? true : stored === '1')
    } catch {
      /* ignore */
    }
  }, [])

  function setEditing(v: boolean) {
    setEditingState(v)
    try {
      localStorage.setItem(STORAGE_KEY, v ? '1' : '0')
    } catch {
      /* ignore */
    }
  }

  const openModal = (node: ReactNode) => setModal(node)
  const closeModal = () => setModal(null)

  // Close the modal on Escape.
  useEffect(() => {
    if (!modal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal])

  return (
    <EditContext.Provider value={{ editing, setEditing, openModal, closeModal }}>
      <div className={editing ? 'edit-on' : undefined}>{children}</div>
      {modal && (
        <div className="edit-backdrop" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          {modal}
        </div>
      )}
    </EditContext.Provider>
  )
}
