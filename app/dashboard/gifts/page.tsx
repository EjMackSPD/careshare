'use client'

import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Gift } from 'lucide-react'
import styles from '../page.module.css'

export default function GiftsPage() {
  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1><Gift size={32} style={{display: 'inline', marginRight: '0.5rem'}} />Gift Marketplace</h1>
          </div>

          <div className={styles.emptyState}>
            <h2>Send Thoughtful Gifts</h2>
            <p>Browse and send gifts to your loved ones with easy family contribution splitting. Coming soon!</p>
          </div>
        </main>
      </div>
    </div>
  )
}

