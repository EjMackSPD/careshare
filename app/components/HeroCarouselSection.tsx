'use client'

import { useEffect, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import styles from './HeroCarouselSection.module.css'

type CarouselImage = {
  src: string
  alt: string
}

export default function HeroCarouselSection({
  sectionId,
  headingId,
  className,
  style,
  overlayClassName,
  images,
  content,
}: {
  sectionId: string
  headingId?: string
  className: string
  style?: React.CSSProperties
  overlayClassName?: string
  images: CarouselImage[]
  content: React.ReactNode
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (images.length === 0 || !isPlaying) {
      return
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [images.length, isPlaying])

  if (images.length === 0) {
    return (
      <section id={sectionId} aria-labelledby={headingId} className={className} style={style}>
        {content}
      </section>
    )
  }

  return (
    <>
      <section
        id={sectionId}
        aria-labelledby={headingId}
        className={`${className} ${styles.fullBleed}`}
        style={style}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured images"
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
            style={{ backgroundImage: `url(${image.src})` }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${images.length}: ${image.alt}`}
            aria-hidden={index === currentIndex ? undefined : true}
          />
        ))}
        <div className={styles.slideOverlay} />
        {overlayClassName ? <div className={overlayClassName} aria-hidden="true" /> : null}
        {content}
      </section>

      <div className={styles.controlsBar}>
        <div className={styles.indicators} role="group" aria-label="Slide navigation">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show slide ${index + 1} of ${images.length}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>

        <div className={styles.timerWrap}>
          <svg className={styles.timerSvg} viewBox="0 0 40 40" aria-hidden="true">
            <circle className={styles.timerTrack} cx="20" cy="20" r="17" />
            <circle
              key={currentIndex}
              className={`${styles.timerProgress} ${isPlaying ? '' : styles.timerPaused}`}
              cx="20"
              cy="20"
              r="17"
            />
          </svg>
          <button
            type="button"
            className={styles.playPauseButton}
            onClick={() => setIsPlaying((playing) => !playing)}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </>
  )
}
