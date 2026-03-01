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
          Resume ↗
        </Link>
      </div>

      <ul className={styles.list}>
        {experiences.map((exp) => (
          <li key={exp.id} className={styles.item}>
            <div 
              className={styles.logo}
              style={!exp.logo.startsWith('/') ? { background: (exp as { logoBackground?: string }).logoBackground ?? '#E8E8E8' } : undefined}
            >
              {exp.logo.startsWith('/') ? (
                <Image 
                  src={exp.logo}
                  alt={exp.company}
                  width={48}
                  height={48}
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
