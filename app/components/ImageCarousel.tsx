'use client'

import { useState, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import styles from './ImageCarousel.module.css'

type CarouselImage = {
  src: string
  alt: string
}

type ImageCarouselProps = {
  images?: CarouselImage[]
}

export default function ImageCarousel({ images = [] }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (images.length === 0 || !isPlaying) {
      return
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [images.length, isPlaying])

  if (images.length === 0) {
    return null
  }

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured images"
    >
      {images.map((image, index) => (
        <div
          key={index}
          className={`${styles.slide} ${
            index === currentIndex ? styles.active : ''
          }`}
          style={{ backgroundImage: `url(${image.src})` }}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${images.length}: ${image.alt}`}
          aria-hidden={index === currentIndex ? undefined : true}
        />
      ))}
      <div className={styles.overlay} />

      <div className={styles.controls}>
        {/* Carousel indicators */}
        <div className={styles.indicators} role="group" aria-label="Slide navigation">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.indicator} ${
                index === currentIndex ? styles.indicatorActive : ''
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Show slide ${index + 1} of ${images.length}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>

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
  )
}
