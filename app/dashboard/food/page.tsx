'use client'

import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { UtensilsCrossed } from 'lucide-react'
import styles from '../page.module.css'

export default function FoodPage() {
  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1><UtensilsCrossed size={32} style={{display: 'inline', marginRight: '0.5rem'}} />Food Delivery</h1>
          </div>

          <div className={styles.emptyState}>
            <h2>Meal Planning & Delivery</h2>
            <p>Schedule regular food deliveries and coordinate meal planning for your loved ones. Coming soon!</p>
          </div>
        </main>
      </div>
    </div>
  )
}

