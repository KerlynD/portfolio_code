import type { ReactNode } from 'react'
import { isAdmin } from '@/lib/session'
import EditAffordance from './EditAffordance'

/**
 * Server wrapper around any content that can be edited inline. For non-admins it
 * renders the children untouched (zero extra client JS). For admins it mounts the
 * client affordance (pencil + anchored popover) around them.
 *
 * `editor` is the client editor element shown in the popover (e.g. <ConfigFieldEditor .../>).
 */
export default async function Editable({
  label,
  editor,
  children,
}: {
  label: string
  editor: ReactNode
  children: ReactNode
}) {
  if (!(await isAdmin())) return <>{children}</>
  return (
    <EditAffordance label={label} editor={editor}>
      {children}
    </EditAffordance>
  )
}
