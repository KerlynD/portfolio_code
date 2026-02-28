import siteConfig from '@/data/siteConfig.json'
import styles from './AboutStrip.module.css'

const infoItems = [
  { label: 'Languages', value: siteConfig.skills.languages.join(' · ') },
  { label: 'Infrastructure', value: siteConfig.skills.infrastructure.join(' · ') },
  { label: 'Currently reading', value: siteConfig.currentlyReading },
  { label: 'Based in', value: siteConfig.location },
]

export default function AboutStrip() {
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.label}>A little about me</div>
          <h2 className={styles.title}>
            {siteConfig.aboutTagline.split('distributed systems')[0]}
            <span className={styles.accent}>distributed systems.</span>
          </h2>
          <p className={styles.description}>{siteConfig.aboutDescription}</p>
        </div>
        <div className={styles.info}>
          {infoItems.map((item) => (
            <div key={item.label} className={styles.infoItem}>
              <div className={styles.infoLabel}>{item.label}</div>
              <div className={styles.infoValue}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
