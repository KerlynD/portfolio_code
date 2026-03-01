'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './ExperienceCard.module.css'

interface Experience {
  id: string
  company: string
  role: string
  team: string
  period: string
  upcoming?: boolean
  color: string
  accent: string
  logoBackground?: string
  logo: string
  logoFallback: string
  description: string
  tags: string[]
  highlights?: string[]
  responsibilities?: string[]
}

interface ExperienceCardProps {
  experience: Experience
  detailed?: boolean
  highlighted?: boolean
}

export default function ExperienceCard({ experience, detailed = false, highlighted = false }: ExperienceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const hasImageLogo = experience.logo.startsWith('/')

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlighted])

  return (
    <div 
      id={experience.id}
      ref={cardRef}
      className={`${styles.card} ${highlighted ? styles.highlighted : ''}`}
      style={{ 
        background: experience.color,
        ...(highlighted && { '--highlight-color': experience.accent } as React.CSSProperties),
      }}
    >
      {experience.upcoming && (
        <div className={styles.upcomingBadge}>
          UPCOMING
        </div>
      )}
      
      <div className={styles.header}>
        <div 
          className={styles.logo}
          style={!hasImageLogo ? { background: experience.logoBackground ?? experience.accent } : undefined}
        >
          {hasImageLogo ? (
            <Image 
              src={experience.logo} 
              alt={experience.company}
              width={48}
              height={48}
              className={styles.logoImage}
            />
          ) : (
            <span className={styles.logoText}>{experience.logo || experience.logoFallback}</span>
          )}
        </div>
        <div className={styles.companyInfo}>
          <div className={styles.company}>{experience.company}</div>
          <div className={styles.period}>{experience.period}</div>
        </div>
      </div>

      <h3 className={styles.role}>{experience.role}</h3>
      <div className={styles.team} style={{ color: experience.accent }}>
        {experience.team}
      </div>

      <div className={styles.content}>
        <p className={styles.description}>{experience.description}</p>

        {detailed && experience.responsibilities && experience.responsibilities.length > 0 && (
          <ul className={styles.responsibilities}>
            {experience.responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.tags}>
        {experience.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  )
}
