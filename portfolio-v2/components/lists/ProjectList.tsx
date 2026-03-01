'use client'

import { useEffect, useState } from 'react'
import ProjectCard from '@/components/cards/ProjectCard'
import styles from './ProjectList.module.css'

interface Project {
  id: string
  name: string
  description: string
  shortDescription?: string
  tags: string[]
  color: string
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

interface ProjectListProps {
  projects: Project[]
}

export default function ProjectList({ projects }: ProjectListProps) {
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
    <div className={styles.projectsGrid}>
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          detailed 
          highlighted={highlightedId === project.id}
        />
      ))}
    </div>
  )
}
