'use client'

import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Infinity } from 'lucide-react'
import styles from '../page.module.css'

export default function LegacyPage() {
  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1><Infinity size={32} style={{display: 'inline', marginRight: '0.5rem'}} />Live Forever</h1>
          </div>

          <div className={styles.emptyState}>
            <h2>Digital Legacy & Memories</h2>
            <p>Preserve stories, memories, and important life lessons for future generations. Coming soon!</p>
          </div>
        </main>
      </div>
    </div>
  )
}

