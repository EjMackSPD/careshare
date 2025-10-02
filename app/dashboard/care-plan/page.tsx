'use client'

import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Heart } from 'lucide-react'
import styles from '../page.module.css'

export default function CarePlanPage() {
  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1><Heart size={32} style={{display: 'inline', marginRight: '0.5rem'}} />Care Plan</h1>
          </div>

          <div className={styles.emptyState}>
            <h2>Personalized Care Plan</h2>
            <p>Create and manage daily care routines, medications, exercises, and activities. Coming soon!</p>
          </div>
        </main>
      </div>
    </div>
  )
}

