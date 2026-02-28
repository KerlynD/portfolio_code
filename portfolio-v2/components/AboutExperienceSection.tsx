import Image from 'next/image'
import Link from 'next/link'
import siteConfig from '@/data/siteConfig.json'
import experiences from '@/data/experiences.json'
import styles from './AboutExperienceSection.module.css'

export default function AboutExperienceSection() {
  const resumeUrl = (siteConfig.links as { resume?: string }).resume || '#'

  return (
    <section id="experience" className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Experience</h2>
        <Link 
          href={resumeUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.resumeLink}
        >
          Resume
          <svg width="12" height="12" viewBox="0 0 12 12" className={styles.externalIcon}>
            <path d="M10 10H2V2h3V0H0v12h12V7h-2v3zM7 0v2h1.586L5.293 5.293 4 3.586 8.414 0H7z" fill="currentColor"/>
          </svg>
        </Link>
      </div>

      <ul className={styles.list}>
        {experiences.map((exp) => (
          <li key={exp.id} className={styles.item}>
            <div 
              className={styles.logo}
              style={{ background: (exp as { logoBackground?: string }).logoBackground ?? '#E8E8E8' }}
            >
              {exp.logo.startsWith('/') ? (
                <Image 
                  src={exp.logo}
                  alt={exp.company}
                  width={24}
                  height={24}
                  className={styles.logoImage}
                />
              ) : (
                <span className={styles.logoText}>{exp.logo || exp.logoFallback}</span>
              )}
            </div>
            <div className={styles.info}>
              <span className={styles.company}>{exp.company}</span>
              <span className={styles.role}>
                {exp.role}
                {exp.team && ` @ ${exp.team}`}
                {exp.period && `, ${exp.period}`}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
