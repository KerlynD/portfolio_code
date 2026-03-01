import Header from '@/components/layout/Header'
import WorkCard from '@/components/cards/WorkCard'
import FooterMinimal from '@/components/layout/FooterMinimal'
import styles from './page.module.css'

const workItems = [
  {
    id: 'google',
    title: 'Incoming Google',
    subtitle: '2026',
    gradientImage: '/assets/experience/gradients/experience-google-gradient.png',
    href: '/experience',
    size: 'large' as const,
  },
  {
    id: 'datadog',
    title: 'Datadog',
    subtitle: '2026',
    gradientImage: '/assets/experience/gradients/experience-card-gradient.png',
    href: '/experience',
    size: 'large' as const,
  },
  {
    id: 'capitalone',
    title: 'Capital One',
    subtitle: '2025',
    gradientImage: '/assets/experience/gradients/experience-capitalone-gradient.png',
    href: '/experience',
    size: 'large' as const,
  },
  {
    id: 'columbia',
    title: 'Columbia',
    subtitle: '2024-2025',
    gradientImage: '/assets/experience/gradients/experience-columbia-gradient.png',
    href: '/experience',
    size: 'large' as const,
  },
]

const projectItems = [
  {
    id: 'url-monitor',
    title: 'URL Monitor',
    subtitle: 'Distributed Systems',
    gradient: 'linear-gradient(145deg, #0F0F1A 0%, #1A1A2E 30%, #252545 70%, #2F2F5F 100%)',
    image: '/assets/projects/figma/url-monitor-project.png',
    href: '/projects',
    size: 'large' as const,
  },
  {
    id: 'mpds',
    title: 'Multiomic Phenotypic Data Search',
    subtitle: 'Data Pipeline',
    gradient: 'linear-gradient(145deg, #FFECD2 0%, #FCB69F 50%, #FF9A9E 100%)',
    image: '/assets/projects/figma/MPDS-project.png',
    href: '/projects',
    size: 'large' as const,
  },
]

export default function Home() {
  return (
    <>
      <Header />
      
      <main className={styles.main}>
        <section className={styles.grid}>
          <div className={styles.row}>
            <div className={styles.col}>
              <WorkCard {...workItems[0]} />
            </div>
            <div className={styles.col}>
              <WorkCard {...workItems[1]} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <WorkCard {...workItems[2]} />
            </div>
            <div className={styles.col}>
              <WorkCard {...workItems[3]} />
            </div>
          </div>
        </section>

        <section className={styles.projectsSection}>
          <h2 className={styles.sectionLabel}>Projects</h2>
          <div className={styles.row}>
            <div className={styles.col}>
              <WorkCard {...projectItems[0]} />
            </div>
            <div className={styles.col}>
              <WorkCard {...projectItems[1]} />
            </div>
          </div>
        </section>
      </main>

      <FooterMinimal />
    </>
  )
}
