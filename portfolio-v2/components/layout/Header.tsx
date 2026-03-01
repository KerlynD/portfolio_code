'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Header.module.css'

const navTabs = [
  { href: '/', label: 'Work' },
  { href: '/experience', label: 'Experience' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
]

export default function Header() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className={styles.header}>
      <div className={styles.profile}>
        <Image 
          src="/assets/profile/profile.jpg"
          alt="Kerlyn Angel Difo"
          width={32}
          height={32}
          className={styles.avatar}
        />
        <div className={styles.info}>
          <h1 className={styles.name}>kerlyn angel difo</h1>
          <p className={styles.tagline}>
            Learning to build systems and create meaningful projects
          </p>
          <p className={styles.previously}>
            Currently at <span className={styles.company}>Datadog</span>
          </p>
          <p className={styles.previously}>
            Previously at <span className={styles.company}>Capital One</span> & <span className={styles.company}>Columbia</span>
          </p>
        </div>
      </div>

      <nav className={styles.tabs}>
        {navTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${isActive(tab.href) ? styles.active : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
