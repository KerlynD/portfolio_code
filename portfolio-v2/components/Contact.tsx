import Link from 'next/link'
import siteConfig from '@/data/siteConfig.json'
import styles from './Contact.module.css'

export default function Contact() {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.card}>
        <div className={styles.emoji}>✉️</div>
        <h2 className={styles.title}>
          Let's build something{' '}
          <span className={styles.accent}>together.</span>
        </h2>
        <p className={styles.description}>
          I'm always open to interesting conversations about backend engineering, 
          infrastructure, and new opportunities.
        </p>
        <div className={styles.buttons}>
          <Link 
            href={siteConfig.links.email}
            className="btn btn-accent"
          >
            {siteConfig.email}
          </Link>
          <Link 
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ background: 'white' }}
          >
            GitHub ↗
          </Link>
          <Link 
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ background: 'white' }}
          >
            LinkedIn ↗
          </Link>
        </div>
      </div>
    </section>
  )
}
