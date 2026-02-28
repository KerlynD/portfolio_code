import siteConfig from '@/data/siteConfig.json'
import styles from './SkillsSection.module.css'

const skillCategories = [
  { key: 'languages', label: 'Languages', icon: '💻' },
  { key: 'infrastructure', label: 'Infrastructure', icon: '☁️' },
  { key: 'databases', label: 'Databases', icon: '🗄️' },
  { key: 'tools', label: 'Tools', icon: '🔧' },
]

export default function SkillsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Skills & Technologies</h2>
      </div>
      <div className={styles.grid}>
        {skillCategories.map((category) => (
          <div key={category.key} className={styles.category}>
            <h3 className={styles.categoryTitle}>
              <span className={styles.categoryIcon}>{category.icon}</span>
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
