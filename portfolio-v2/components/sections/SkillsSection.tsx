import siteConfig from '@/data/siteConfig.json'
import styles from './SkillsSection.module.css'

const skillCategories = [
  { key: 'languages', label: 'Languages' },
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'databases', label: 'Databases' },
  { key: 'tools', label: 'Tools' },
]

function renderCategoryIcon(categoryKey: string) {
  switch (categoryKey) {
    case 'languages':
      return (
        <svg viewBox="0 0 24 24" className={styles.categoryIconSvg} aria-hidden="true">
          <path d="M4 5h16v12H4z" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4 9h16M9 17v-8M15 17v-8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )
    case 'infrastructure':
      return (
        <svg viewBox="0 0 24 24" className={styles.categoryIconSvg} aria-hidden="true">
          <path
            d="M7 17h10a4 4 0 1 0-.9-7.9A5.5 5.5 0 0 0 5 10a3.5 3.5 0 0 0 2 7Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'databases':
      return (
        <svg viewBox="0 0 24 24" className={styles.categoryIconSvg} aria-hidden="true">
          <ellipse cx="12" cy="6.5" rx="7" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 6.5V17.5C5 19.4 8.1 21 12 21C15.9 21 19 19.4 19 17.5V6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 12c0 1.9 3.1 3.5 7 3.5s7-1.6 7-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" className={styles.categoryIconSvg} aria-hidden="true">
          <path
            d="M14.7 6.3l3 3-8.4 8.4-3 0 0-3zM13 8l3 3M5 19l4 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

export default function SkillsSection() {
  return (
    <section id="skills" className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Skills & Technologies</h2>
      </div>
      <div className={styles.grid}>
        {skillCategories.map((category) => (
          <div key={category.key} className={styles.category}>
            <h3 className={styles.categoryTitle}>
              <span className={styles.categoryIcon}>{renderCategoryIcon(category.key)}</span>
              {category.label}
            </h3>
            <div className={styles.skills}>
              {(siteConfig.skills as Record<string, string[]>)[category.key]?.map((skill) => (
                <span key={skill} className={styles.skill}>{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
