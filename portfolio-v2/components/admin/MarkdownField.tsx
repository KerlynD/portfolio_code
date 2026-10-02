'use client'

import { useDeferredValue, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { renderMarkdown } from '@/lib/markdown'
import { imageFrom, uploadImage } from './uploadImage'

let uploadSeq = 0

/**
 * Markdown textarea with a formatting toolbar, Write/Preview tabs (side by side on
 * wide screens) and image paste/drop. Edits go through execCommand so Cmd+Z works.
 */
export default function MarkdownField({
  name,
  value,
  onChange,
  onBusy,
}: {
  name: string
  value: string
  onChange: (v: string) => void
  onBusy?: (busy: boolean) => void
}) {
  const ta = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'write' | 'preview'>('write')
  const [uploads, setUploads] = useState(0)
  const deferred = useDeferredValue(value)
  const html = useMemo(() => renderMarkdown(deferred), [deferred])

  /** Replace [start, end) with text, then select [selStart, selEnd) (relative to start). */
  function edit(start: number, end: number, text: string, selStart = text.length, selEnd = selStart) {
    const el = ta.current
    if (!el) return
    el.focus()
    el.setSelectionRange(start, end)
    if (!document.execCommand('insertText', false, text)) {
      el.setRangeText(text, start, end, 'end')
      onChange(el.value)
    }
    el.setSelectionRange(start + selStart, start + selEnd)
  }

  function wrap(before: string, after: string, placeholder: string) {
    const el = ta.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const sel = el.value.slice(s, e) || placeholder
    edit(s, e, before + sel + after, before.length, before.length + sel.length)
  }

  function heading() {
    const el = ta.current
    if (!el) return
    const lineStart = el.value.lastIndexOf('\n', el.selectionStart - 1) + 1
    const line = el.value.slice(lineStart).split('\n')[0]
    const bare = line.replace(/^#{1,6}\s*/, '')
    const next = line.startsWith('## ') ? bare : `## ${bare}`
    edit(lineStart, lineStart + line.length, next)
  }

  function link() {
    const el = ta.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const text = el.value.slice(s, e) || 'text'
    const out = `[${text}](https://)`
    // Leave the URL selected so you can type or paste it straight in.
    edit(s, e, out, text.length + 3, out.length - 1)
  }

  function code() {
    const el = ta.current
    if (!el) return
    const sel = el.value.slice(el.selectionStart, el.selectionEnd)
    if (sel.includes('\n')) wrap('```\n', '\n```', '')
    else wrap('`', '`', 'code')
  }

  async function insertImage(file: File | null) {
    const el = ta.current
    if (!file || !el) return
    const token = `![uploading-${++uploadSeq}…]()`
    const at = el.selectionStart
    const pad = at > 0 && el.value[at - 1] !== '\n' ? '\n' : ''
    edit(at, el.selectionEnd, pad + token)
    setUploads((n) => n + 1)
    onBusy?.(true)
    const url = await uploadImage(file)
    setUploads((n) => n - 1)
    onBusy?.(false)
    const i = el.value.indexOf(token)
    if (i >= 0) edit(i, i + token.length, url ? `![](${url})` : '')
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.metaKey || e.ctrlKey) || e.altKey) return
    const k = e.key.toLowerCase()
    if (k === 'b') wrap('**', '**', 'bold')
    else if (k === 'i') wrap('_', '_', 'italic')
    else if (k === 'k') link()
    else return
    e.preventDefault()
  }

  const tools: [string, string, () => void][] = [
    ['B', 'Bold (Cmd+B)', () => wrap('**', '**', 'bold')],
    ['I', 'Italic (Cmd+I)', () => wrap('_', '_', 'italic')],
    ['Link', 'Link (Cmd+K)', link],
    ['H2', 'Heading', heading],
    ['</>', 'Code', code],
    ['Image', 'Upload an image (or paste / drop one into the text)', () => fileRef.current?.click()],
  ]

  return (
    <div className="md-field" data-mode={mode}>
      <div className="md-bar">
        <div className="md-tabs" role="tablist">
          {(['write', 'preview'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              className={mode === m ? 'on' : undefined}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="md-tools">
          {tools.map(([label, title, run]) => (
            <button
              key={label}
              type="button"
              title={title}
              aria-label={title}
              className={`md-tool md-tool-${label === '</>' ? 'code' : label.toLowerCase()}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={run}
            >
              {label}
            </button>
          ))}
          {uploads > 0 && <span className="md-uploading">uploading…</span>}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void insertImage(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />
      </div>
      <div className="md-panes">
        <textarea
          ref={ta}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={(e) => {
            const f = imageFrom(e.clipboardData)
            if (f) {
              e.preventDefault()
              void insertImage(f)
            }
          }}
          onDragOver={(e) => e.dataTransfer.types.includes('Files') && e.preventDefault()}
          onDrop={(e) => {
            const f = imageFrom(e.dataTransfer)
            if (f) {
              e.preventDefault()
              void insertImage(f)
            }
          }}
          placeholder="Write in markdown. Paste or drop images right in."
          spellCheck
        />
        <div className="md-preview article-body" aria-label="Preview">
          {value.trim() ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="md-empty">Nothing to preview yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
