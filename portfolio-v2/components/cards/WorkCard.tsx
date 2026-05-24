'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import styles from './WorkCard.module.css'

interface WorkCardProps {
  id?: string
  title: string
  subtitle: string
  image?: string
  gradientImage?: string
  gradient?: string
  logo?: string
  logoText?: string
  href?: string
  size?: 'large' | 'medium'
  photos?: string[]
}

export default function WorkCard({
  id,
  title,
  subtitle,
  image,
  gradientImage,
  gradient,
  logo,
  logoText,
  href,
  size = 'medium',
  photos = [],
}: WorkCardProps) {
  const hasGradientImage = !!gradientImage
  const hasLogo = !!logo || !!logoText

  const slides = hasGradientImage ? [gradientImage!, ...photos] : []
  const hasCarousel = slides.length > 1

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!hasCarousel) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [hasCarousel, slides.length])

  const Card = (
    <div
      className={`${styles.card} ${styles.uniform} ${size === 'large' ? styles.large : styles.medium}`}
      style={{ background: !hasGradientImage ? (gradient || '#F5F5F5') : undefined }}
    >
      {hasGradientImage ? (
        hasCarousel ? (
          <div className={styles.carouselWrapper}>
            <div
              className={styles.carouselTrack}
              style={{
                height: `${slides.length * 100}%`,
                transform: `translateY(-${currentIndex * (100 / slides.length)}%)`,
              }}
            >
              {slides.map((src, i) => (
                <div
                  key={i}
                  className={styles.carouselSlide}
                  style={{ height: `${100 / slides.length}%` }}
                >
                  <Image
                    src={src}
                    alt={title}
                    fill
                    className={styles.gradientImage}
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
            <div className={styles.carouselOverlay} />
          </div>
        ) : (
          <div className={styles.gradientImageWrapper}>
            <Image
              src={gradientImage}
              alt={title}
              fill
              className={styles.gradientImage}
              priority
            />
          </div>
        )
      ) : (
        <div className={styles.logoContainer}>
          {logo ? (
            <Image
              src={logo}
              alt={title}
              width={size === 'large' ? 120 : 80}
              height={size === 'large' ? 120 : 80}
              className={styles.logoImage}
            />
          ) : logoText ? (
            <span className={styles.logoText}>{logoText}</span>
          ) : image ? (
            <Image
              src={image}
              alt={title}
              fill
              className={styles.fullImage}
            />
          ) : null}
        </div>
      )}
      <div className={styles.label}>
        <span className={styles.title}>{title}</span>
        <span className={styles.dot}>•</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>
    </div>
  )

  if (href) {
    const fullHref = id ? `${href}#${id}` : href
    return <Link href={fullHref} className={styles.link}>{Card}</Link>
  }

  return Card
}
