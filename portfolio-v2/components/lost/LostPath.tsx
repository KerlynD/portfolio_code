'use client'

import { usePathname } from 'next/navigation'

// not-found.tsx never receives the URL, so read it on the client side of the tree.
export default function LostPath() {
  const path = usePathname()
  return path ? <code className="lost-path">{path}</code> : <>this address</>
}
