import Link from 'next/link'
import siteConfig from '@/data/siteConfig.json'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`${styles.statusBadge} fade-up`}>
        <span className={styles.statusDot} />
        {siteConfig.statusMessage} · {siteConfig.currentRole}
      </div>

      <h1 className={`${styles.headline} fade-up-delay-1`}>
        Hi, I'm {siteConfig.shortName} —{' '}
        <span className={styles.accent}>software engineer</span>
        {' '}building things that scale.
      </h1>

      <p className={`${styles.bio} fade-up-delay-2`}>
        {siteConfig.bio}
      </p>

      <div className={`${styles.buttons} fade-up-delay-3`}>
        <Link href="/experience" className="btn btn-primary">
          View Experience ↓
        </Link>
        <Link href={siteConfig.links.email} className="btn btn-secondary">
          Get in touch
        </Link>
        <Link 
          href={siteConfig.links.github} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          GitHub ↗
        </Link>
      </div>

      <div className={`${styles.scrollIndicator} bounce`}>↓</div>
    </section>
  )
}
