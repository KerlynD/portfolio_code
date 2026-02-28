import type { Metadata } from 'next'
import Header from '@/components/Header'
import ProjectList from '@/components/ProjectList'
import FooterMinimal from '@/components/FooterMinimal'
import projects from '@/data/projects.json'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Projects | Kerlyn Difo',
  description: 'A collection of projects ranging from distributed systems to full-stack applications.',
}

export default function ProjectsPage() {
  const featuredProject = projects.find(p => p.featured)
  const otherProjects = projects.filter(p => p.id !== featuredProject?.id)

  return (
    <>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Projects</h1>
          <p className={styles.pageDescription}>
            A collection of projects I've worked on, from distributed systems to full-stack apps.
          </p>
        </div>

        <section className={styles.section}>
          <ProjectList projects={otherProjects} featuredProject={featuredProject} />
        </section>
      </main>

      <FooterMinimal />
    </>
  )
}
