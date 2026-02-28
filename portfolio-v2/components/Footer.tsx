import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        Designed & built by Kerlyn Difo · Open source on{' '}
        <Link 
          href="https://github.com/KerlynD" 
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          GitHub
        </Link>
      </p>
    </footer>
  )
}
