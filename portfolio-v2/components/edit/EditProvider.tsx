'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type EditContextValue = {
  editing: boolean
  setEditing: (v: boolean) => void
  /** Open a centered modal (e.g. the post / experience / project editor). */
  openModal: (node: ReactNode) => void
  closeModal: () => void
  /** Let the open modal veto closing (e.g. unsaved changes). Return false to keep it open. */
  setCloseGuard: (guard: (() => boolean) | null) => void
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
      setCloseGuard: () => {},
    }
  )
}

const STORAGE_KEY = 'portfolio-edit-mode'

export default function EditProvider({ children }: { children: ReactNode }) {
  const [editing, setEditingState] = useState(false)
  const [modal, setModal] = useState<ReactNode>(null)
  const closeGuard = useRef<(() => boolean) | null>(null)

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

  const openModal = (node: ReactNode) => {
    closeGuard.current = null
    setModal(node)
  }
  const closeModal = () => {
    if (closeGuard.current && !closeGuard.current()) return
    closeGuard.current = null
    setModal(null)
  }
  const setCloseGuard = (guard: (() => boolean) | null) => {
    closeGuard.current = guard
  }

  // Close the modal on Escape.
  useEffect(() => {
    if (!modal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal])

  return (
    <EditContext.Provider value={{ editing, setEditing, openModal, closeModal, setCloseGuard }}>
      <div className={editing ? 'edit-on' : undefined}>{children}</div>
      {modal && (
        <div className="edit-backdrop" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          {modal}
        </div>
      )}
    </EditContext.Provider>
  )
}
