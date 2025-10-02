'use client'

import { useState, useEffect } from 'react'
import styles from './ImageCarousel.module.css'

const images = [
  {
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=1920&q=80',
    alt: 'Family caring for elderly loved one'
  },
  {
    url: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1920&q=80',
    alt: 'Happy elderly woman with family'
  },
  {
    url: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=1920&q=80',
    alt: 'Multigenerational family together'
  },
  {
    url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1920&q=80',
    alt: 'Caring for elderly parent'
  }
]

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.carousel}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`${styles.slide} ${
            index === currentIndex ? styles.active : ''
          } ${isLoaded ? styles.loaded : ''}`}
          style={{ backgroundImage: `url(${image.url})` }}
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

