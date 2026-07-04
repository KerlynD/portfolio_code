import { notFound } from 'next/navigation'
import ProjectForm from '@/components/admin/ProjectForm'
import { getProjectById } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getProjectById(Number(id))
  if (!item) notFound()

  return (
    <>
      <h1 className="admin-h">
        <span className="slash">/</span> Edit project
      </h1>
      <p className="admin-sub">{item.name}</p>
      <ProjectForm item={item} />
    </>
  )
}
