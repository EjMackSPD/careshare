'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (images.length === 0) {
      return
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [images.length])

  if (images.length === 0) {
    return null
  }

  return (
    <div className={styles.carousel}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`${styles.slide} ${
            index === currentIndex ? styles.active : ''
          }`}
          style={{ backgroundImage: `url(${image.src})` }}
          aria-label={image.alt}
        />
      ))}
      <div className={styles.overlay} />
      
      {/* Carousel indicators */}
      <div className={styles.indicators}>
        {images.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${
              index === currentIndex ? styles.indicatorActive : ''
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
