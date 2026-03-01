import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import ExperienceList from '@/components/lists/ExperienceList'
import AchievementsSection from '@/components/sections/AchievementsSection'
import SkillsSection from '@/components/sections/SkillsSection'
import FooterMinimal from '@/components/layout/FooterMinimal'
import experiences from '@/data/experiences.json'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Experience | Kerlyn Angel Difo',
  description: 'Professional experience in software engineering, data engineering, and backend development.',
}

export default function ExperiencePage() {
  return (
    <>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Experience</h1>
          <p className={styles.pageDescription}>
            My professional journey in software engineering and data engineering.
          </p>
        </div>

        <section className={styles.section}>
          <ExperienceList experiences={experiences} />
        </section>

        <AchievementsSection />
        <SkillsSection />
      </main>

      <FooterMinimal />
    </>
  )
}
