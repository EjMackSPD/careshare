'use client'

import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Calendar } from 'lucide-react'
import styles from '../page.module.css'

export default function CalendarPage() {
  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1><Calendar size={32} style={{display: 'inline', marginRight: '0.5rem'}} />Calendar</h1>
          </div>

          <div className={styles.emptyState}>
            <h2>Unified Calendar View</h2>
            <p>See all events, appointments, and important dates in one place. Coming soon!</p>
          </div>
        </main>
      </div>
    </div>
  )
}

