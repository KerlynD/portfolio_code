'use client'

import { useEffect, useRef, useState } from 'react'
import { listEmojis } from '@/lib/actions/emojis'
import type { Emoji } from '@/lib/db/schema'

const FIELDS = '.edit-modal input[name="title"], .edit-modal textarea[name="body"]'
const QUERY = /(?:^|[\s(>]):([a-z0-9_]{1,32})$/
const MAX = 8

type Field = HTMLInputElement | HTMLTextAreaElement
type Open = { el: Field; start: number; matches: Emoji[]; x: number; y: number }

/** Viewport position just below the caret, via a mirrored hidden div. */
function caretXY(el: Field, pos: number): { x: number; y: number } {
  const r = el.getBoundingClientRect()
  if (el.tagName === 'INPUT') return { x: r.left, y: r.bottom + 2 }
  const cs = getComputedStyle(el)
  const div = document.createElement('div')
  for (const p of ['font', 'letterSpacing', 'lineHeight', 'padding', 'border', 'boxSizing', 'whiteSpace', 'wordWrap', 'tabSize'] as const)
    div.style[p] = cs[p]
  Object.assign(div.style, {
    position: 'fixed', visibility: 'hidden', top: '0', left: '0', width: `${r.width}px`,
    whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
  })
  div.textContent = el.value.slice(0, pos)
  const mark = document.createElement('span')
  mark.textContent = '​'
  div.appendChild(mark)
  document.body.appendChild(div)
  const lh = parseFloat(cs.lineHeight) || 20
  const x = r.left + mark.offsetLeft - el.scrollLeft
  const y = r.top + mark.offsetTop - el.scrollTop + lh
  div.remove()
  return { x: Math.min(x, r.right - 200), y: Math.min(y, r.bottom) }
}

/**
 * Discord-style `:` suggestions for the post editor's title and body. Listens at the
 * document level so it works with the form without being wired into it.
 */
export default function EmojiAutocomplete() {
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [open, setOpen] = useState<Open | null>(null)
  const [active, setActive] = useState(0)
  const state = useRef({ open, active })
  state.current = { open, active }

  useEffect(() => {
    listEmojis().then(setEmojis, () => {})
  }, [])

  useEffect(() => {
    if (!emojis.length) return

    function update(el: Field) {
      const pos = el.selectionStart ?? 0
      if (pos !== el.selectionEnd) return setOpen(null)
      const m = QUERY.exec(el.value.slice(0, pos))
      if (!m) return setOpen(null)
      const q = m[1]
      const starts = emojis.filter((e) => e.name.startsWith(q))
      const has = emojis.filter((e) => !e.name.startsWith(q) && e.name.includes(q))
      const matches = [...starts, ...has].slice(0, MAX)
      if (!matches.length) return setOpen(null)
      setActive(0)
      setOpen({ el, start: pos - q.length - 1, matches, ...caretXY(el, pos) })
    }

    const onInput = (e: Event) => {
      const t = e.target as Element
      if (t.matches?.(FIELDS)) update(t as Field)
    }
    const onKey = (e: KeyboardEvent) => {
      const { open, active } = state.current
      if (!open || e.target !== open.el) return
      const n = open.matches.length
      if (e.key === 'ArrowDown') setActive((active + 1) % n)
      else if (e.key === 'ArrowUp') setActive((active - 1 + n) % n)
      else if (e.key === 'Enter' || e.key === 'Tab') insert(open, open.matches[active])
      else if (e.key === 'Escape') setOpen(null)
      else return
      // Keep Enter from submitting and Escape from closing the modal.
      e.preventDefault()
      e.stopPropagation()
    }
    const close = (e: Event) => {
      if (!(e.target as Element).closest?.('.emoji-ac')) setOpen(null)
    }

    document.addEventListener('input', onInput, true)
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('mousedown', close, true)
    document.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('mousedown', close, true)
      document.removeEventListener('scroll', close, true)
    }
  }, [emojis])

  function insert(o: Open, e: Emoji) {
    const el = o.el
    const end = el.selectionStart ?? o.start
    el.focus()
    el.setSelectionRange(o.start, end)
    const text = `:${e.name}: `
    // execCommand keeps undo working and fires React's onChange.
    if (!document.execCommand('insertText', false, text)) {
      el.setRangeText(text, o.start, end, 'end')
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    setOpen(null)
  }

  if (!open) return null
  return (
    <ul className="emoji-ac" style={{ left: open.x, top: open.y }} role="listbox">
      {open.matches.map((e, i) => (
        <li
          key={e.id}
          role="option"
          aria-selected={i === active}
          className={i === active ? 'on' : undefined}
          onMouseDown={(ev) => {
            ev.preventDefault()
            insert(open, e)
          }}
          onMouseEnter={() => setActive(i)}
        >
          <img src={e.url} alt="" />
          <span>:{e.name}:</span>
        </li>
      ))}
    </ul>
  )
}
