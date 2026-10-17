'use client'

import { useEffect } from 'react'

/** One delegated listener for every `.code-copy` button the markdown renderer emits. Renders nothing. */
export default function CopyCode() {
  useEffect(() => {
    const timers = new Map<HTMLButtonElement, ReturnType<typeof setTimeout>>()

    const flash = (btn: HTMLButtonElement, label: string) => {
      btn.textContent = label
      clearTimeout(timers.get(btn))
      timers.set(btn, setTimeout(() => {
        btn.textContent = 'copy'
        timers.delete(btn)
      }, 1500))
    }

    const onClick = (e: MouseEvent) => {
      const btn = (e.target as Element | null)?.closest?.('.code-copy')
      if (!(btn instanceof HTMLButtonElement)) return
      const pre = btn.closest('.code-block')?.querySelector('pre')
      if (!pre) return
      const text = (pre.textContent ?? '').replace(/\n$/, '')
      if (!navigator.clipboard) return flash(btn, 'failed')
      navigator.clipboard.writeText(text).then(
        () => flash(btn, 'copied!'),
        () => flash(btn, 'failed'),
      )
    }

    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      for (const t of timers.values()) clearTimeout(t)
    }
  }, [])

  return null
}
