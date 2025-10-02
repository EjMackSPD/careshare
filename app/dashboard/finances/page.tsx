'use client'

import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Wallet } from 'lucide-react'
import styles from '../page.module.css'

export default function FinancesPage() {
  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1><Wallet size={32} style={{display: 'inline', marginRight: '0.5rem'}} />Finances</h1>
          </div>

          <div className={styles.emptyState}>
            <h2>Financial Overview</h2>
            <p>Track all caregiving expenses across families with detailed reports and analytics. Coming soon!</p>
          </div>
        </main>
      </div>
    </div>
  )
}

