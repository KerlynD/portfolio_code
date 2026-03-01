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
  wip?: boolean
  confidential?: boolean
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
  detailed?: boolean
  highlighted?: boolean
}

export default function ProjectCard({ project, detailed = false, highlighted = false }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const links = project.links

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlighted])

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

        {detailed && ((links && Object.keys(links).length > 0) || project.confidential) && (
          <div className={styles.links}>
            {links?.live && (
              <Link href={links.live} target="_blank" className={styles.linkButton}>
                Live Site ↗
              </Link>
            )}
            {links?.github && !project.confidential && (
              <Link href={links.github} target="_blank" className={styles.linkButton}>
                Source Code ↗
              </Link>
            )}
            {links?.devpost && (
              <Link href={links.devpost} target="_blank" className={styles.linkButton}>
                Devpost ↗
              </Link>
            )}
            {project.confidential && (
              <span className={styles.confidentialText}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.lockIcon}
                  aria-hidden="true"
                >
                  <path
                    d="M7 10V7a5 5 0 0 1 10 0v3m-9 0h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                This work is confidential
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
