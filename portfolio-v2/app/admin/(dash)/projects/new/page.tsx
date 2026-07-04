import ProjectForm from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
  return (
    <>
      <h1 className="admin-h">
        <span className="slash">/</span> New project
      </h1>
      <ProjectForm />
    </>
  )
}
