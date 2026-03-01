import Image from 'next/image'
import siteConfig from '@/data/siteConfig.json'
import styles from './AchievementsSection.module.css'

function renderAchievementIcon(iconKey: string) {
  if (iconKey === 'graduation') {
    return (
      <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
        <path
          d="M3 9l9-4 9 4-9 4-9-4Zm3.5 1.6V15c0 1.8 2.4 3.2 5.5 3.2s5.5-1.4 5.5-3.2v-4.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={styles.iconSvg} aria-hidden="true">
      <path
        d="M8 4h8v3a4 4 0 0 0 3 3.9v1.1a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-1.1A4 4 0 0 0 8 7V4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 17v2.5M14 17v2.5M8 21h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function AchievementsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Achievements & Leadership</h2>
      </div>
      <div className={styles.grid}>
        {siteConfig.achievements.map((achievement, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.icon}>
              {achievement.icon.startsWith('/') ? (
                <Image 
                  src={achievement.icon} 
                  alt={achievement.title}
                  width={32}
                  height={32}
                  className={styles.iconImage}
                />
              ) : (
                renderAchievementIcon(achievement.icon)
              )}
            </div>
            <div className={styles.content}>
              <h3 className={styles.cardTitle}>{achievement.title}</h3>
              <p className={styles.organization}>{achievement.organization}</p>
              <p className={styles.description}>{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
