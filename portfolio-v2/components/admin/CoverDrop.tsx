'use client'

import { useRef, useState } from 'react'
import { imageFrom, uploadImage } from './uploadImage'

/** Cover image picker: click or drag an image in, see a thumbnail, remove it. */
export default function CoverDrop({
  value,
  onChange,
  onBusy,
}: {
  value: string
  onChange: (url: string) => void
  onBusy?: (busy: boolean) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)

  async function take(file: File | null) {
    if (!file) return
    setBusy(true)
    onBusy?.(true)
    const url = await uploadImage(file)
    setBusy(false)
    onBusy?.(false)
    if (url) onChange(url)
  }

  return (
    <div
      className={`cover-drop${over ? ' over' : ''}${value ? ' has' : ''}`}
      onClick={() => !busy && inputRef.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), inputRef.current?.click())}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        void take(imageFrom(e.dataTransfer))
      }}
      role="button"
      tabIndex={0}
    >
      {value && <img src={value} alt="cover" />}
      <div className="cover-drop-msg">
        {busy ? 'Uploading…' : value ? 'Drop or click to replace' : 'Drop an image here, or click to choose'}
      </div>
      {value && !busy && (
        <button
          className="edit-mini danger"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onChange('')
          }}
        >
          ✕ Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void take(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />
    </div>
  )
}
