import { notFound } from 'next/navigation'
import ExperienceForm from '@/components/admin/ExperienceForm'
import { getExperienceById } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getExperienceById(Number(id))
  if (!item) notFound()

  return (
    <>
      <h1 className="admin-h">
        <span className="slash">/</span> Edit role
      </h1>
      <p className="admin-sub">{item.company} — {item.role}</p>
      <ExperienceForm item={item} />
    </>
  )
}
