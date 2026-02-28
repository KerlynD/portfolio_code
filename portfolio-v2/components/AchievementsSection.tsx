import Image from 'next/image'
import siteConfig from '@/data/siteConfig.json'
import styles from './AchievementsSection.module.css'

const iconMap: Record<string, string> = {
  graduation: '🎓',
  trophy: '🏆',
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
                <span className={styles.emoji}>
                  {iconMap[achievement.icon] || '🏆'}
                </span>
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
