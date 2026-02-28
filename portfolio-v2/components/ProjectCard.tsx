'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './ProjectCard.module.css'

interface Project {
  id: string
  name: string
  description: string
  shortDescription?: string
  tags: string[]
  color: string
  emoji: string
  featured?: boolean
  wip?: boolean
  hackathon?: string
  image?: string
  links?: {
    live?: string
    github?: string
    devpost?: string
  }
  details?: string[]
}

interface ProjectCardProps {
  project: Project
  featured?: boolean
  detailed?: boolean
  highlighted?: boolean
}

export default function ProjectCard({ project, featured = false, detailed = false, highlighted = false }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlighted])

  if (featured) {
    return (
      <div 
        id={project.id}
        ref={cardRef}
        className={`${styles.featuredCard} ${highlighted ? styles.highlighted : ''}`}
        style={{ 
          background: project.color,
          ...(highlighted && { '--highlight-color': project.color } as React.CSSProperties)
        }}
      >
        <div className={styles.featuredContent}>
          <div className={styles.emoji}>{project.emoji}</div>
          <h3 className={styles.featuredTitle}>{project.name}</h3>
          <p className={styles.featuredDescription}>{project.description}</p>
          <div className={styles.tags}>
            {project.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          {detailed && project.links && (
            <div className={styles.links}>
              {project.links.live && (
                <Link href={project.links.live} target="_blank" className={styles.link}>
                  Live ↗
                </Link>
              )}
              {project.links.github && (
                <Link href={project.links.github} target="_blank" className={styles.link}>
                  GitHub ↗
                </Link>
              )}
            </div>
          )}
        </div>
        <div className={styles.featuredNumber}>01</div>
      </div>
    )
  }

  return (
    <div 
      id={project.id}
      ref={cardRef}
      className={`${styles.card} ${highlighted ? styles.highlighted : ''}`}
      style={{ 
        background: project.color, 
        opacity: project.wip ? 0.8 : 1,
        ...(highlighted && { '--highlight-color': project.color } as React.CSSProperties)
      }}
    >
      {detailed && project.image && (
        <div className={styles.imageWrapper}>
          <Image 
            src={project.image}
            alt={project.name}
            width={400}
            height={200}
            className={styles.image}
          />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.emoji}>{project.emoji}</div>
        <h3 className={styles.title}>
          {project.name}
          {project.wip && <span className={styles.wipBadge}>WIP</span>}
        </h3>
        {project.hackathon && (
          <span className={styles.hackathonBadge}>{project.hackathon}</span>
        )}
        <p className={styles.description}>
          {detailed ? project.description : (project.shortDescription || project.description)}
        </p>
        
        {detailed && project.details && project.details.length > 0 && (
          <ul className={styles.details}>
            {project.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        )}

        <div className={styles.tags}>
          {project.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        {detailed && project.links && Object.keys(project.links).length > 0 && (
          <div className={styles.links}>
            {project.links.live && (
              <Link href={project.links.live} target="_blank" className={styles.linkButton}>
                Live Site ↗
              </Link>
            )}
            {project.links.github && (
              <Link href={project.links.github} target="_blank" className={styles.linkButtonSecondary}>
                Source Code ↗
              </Link>
            )}
            {project.links.devpost && (
              <Link href={project.links.devpost} target="_blank" className={styles.linkButton}>
                Devpost ↗
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
