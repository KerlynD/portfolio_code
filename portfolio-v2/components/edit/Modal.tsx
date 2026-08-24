'use client'

import type { ReactNode } from 'react'
import { useEdit } from './EditProvider'

/** Body of a centered modal. Render inside EditProvider's backdrop via openModal(). */
export default function Modal({ title, children }: { title: string; children: ReactNode }) {
  const { closeModal } = useEdit()
  return (
    <div className="edit-modal">
      <div className="edit-modal-h">
        <h2>
          <span className="slash">/</span> {title}
        </h2>
        <button className="edit-x" type="button" onClick={closeModal} aria-label="Close">
          ✕
        </button>
      </div>
      {children}
    </div>
  )
}
