import type { Metadata } from 'next'
import Image from 'next/image'
import Header from '@/components/Header'
import AboutSideNav from '@/components/AboutSideNav'
import AboutExperienceSection from '@/components/AboutExperienceSection'
import CommunitiesSection from '@/components/CommunitiesSection'
import SkillsSection from '@/components/SkillsSection'
import FooterMinimal from '@/components/FooterMinimal'
import siteConfig from '@/data/siteConfig.json'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'About | Kerlyn Difo',
  description: 'Learn more about Kerlyn Difo, a software engineer passionate about backend systems and distributed infrastructure.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.layout}>
          <aside className={styles.sideNav}>
            <AboutSideNav />
          </aside>

          <div className={styles.content}>
            <section id="about" className={styles.aboutSection}>
              <div className={styles.aboutGrid}>
                <div className={styles.photoSection}>
                  <Image 
                    src="/assets/profile.jpg"
                    alt="Kerlyn Difo"
                    width={280}
                    height={280}
                    className={styles.photo}
                  />
                </div>
                
                <div className={styles.textSection}>
                  <h1 className={styles.title}>About Me</h1>
                  <p className={styles.bio}>
                    {siteConfig.bio}
                  </p>
                  
                  <div className={styles.details}>
                    <div className={styles.detail}>
                      <span className={styles.label}>Currently</span>
                      <span className={styles.value}>{siteConfig.currentRole}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.label}>Education</span>
                      <span className={styles.value}>{siteConfig.education}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.label}>Based in</span>
                      <span className={styles.value}>{siteConfig.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <AboutExperienceSection />
            <CommunitiesSection />
            <SkillsSection />
          </div>
        </div>
      </main>

      <FooterMinimal />
    </>
  )
}
