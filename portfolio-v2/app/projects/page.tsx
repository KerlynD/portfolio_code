import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import ProjectList from '@/components/lists/ProjectList'
import FooterMinimal from '@/components/layout/FooterMinimal'
import projects from '@/data/projects.json'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Projects | Kerlyn Angel Difo',
  description: 'A collection of projects ranging from distributed systems to full-stack applications.',
}

export default function ProjectsPage() {
  const selectedProjectOrder = ['url-monitor', 'discord-bot', 'cuny-calendar', 'mpds']
  const selectedProjects = selectedProjectOrder
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is (typeof projects)[number] => Boolean(project))

  const hackathonProjects = projects.filter((project) => project.hackathon)

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
          <ProjectList projects={selectedProjects} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hackathon Winners</h2>
          <ProjectList projects={hackathonProjects} />
        </section>
      </main>

      <FooterMinimal />
    </>
  )
}
