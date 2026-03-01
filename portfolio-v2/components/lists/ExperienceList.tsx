'use client'

import { useEffect, useState } from 'react'
import ExperienceCard from '@/components/cards/ExperienceCard'
import styles from './ExperienceList.module.css'

interface Experience {
  id: string
  company: string
  role: string
  team: string
  period: string
  upcoming?: boolean
  color: string
  accent: string
  logo: string
  logoFallback: string
  description: string
  tags: string[]
  highlights?: string[]
  responsibilities?: string[]
}

interface ExperienceListProps {
  experiences: Experience[]
}

export default function ExperienceList({ experiences }: ExperienceListProps) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      setHighlightedId(hash)
      const timer = setTimeout(() => {
        setHighlightedId(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div className={styles.experienceGrid}>
      {experiences.map((exp) => (
        <ExperienceCard 
          key={exp.id} 
          experience={exp} 
          detailed 
          highlighted={highlightedId === exp.id}
        />
      ))}
    </div>
  )
}
