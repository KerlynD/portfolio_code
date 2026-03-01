'use client'

import { useEffect, useState } from 'react'
import styles from './AboutSideNav.module.css'

const navItems = [
  { id: 'about', label: 'Me' },
  { id: 'experience', label: 'Experience' },
  { id: 'communities', label: 'Community' },
]

export default function AboutSideNav() {
  const [activeId, setActiveId] = useState('about')

  useEffect(() => {
    const handleScroll = () => {
      const viewportHalf = window.innerHeight / 2
      let current = navItems[0].id
      for (const { id } of navItems) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= viewportHalf && rect.bottom >= viewportHalf) {
            current = id
            break
          }
          if (rect.top < viewportHalf) {
            current = id
          }
        }
      }
      setActiveId(current)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => scrollTo(item.id)}
          className={`${styles.link} ${activeId === item.id ? styles.active : ''}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
