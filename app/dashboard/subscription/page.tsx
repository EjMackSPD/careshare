'use client'

import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { CreditCard } from 'lucide-react'
import styles from '../page.module.css'

export default function SubscriptionPage() {
  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1><CreditCard size={32} style={{display: 'inline', marginRight: '0.5rem'}} />Subscription</h1>
          </div>

          <div className={styles.emptyState}>
            <h2>Manage Your Plan</h2>
            <p>View and manage your CareShare subscription. Currently free during beta!</p>
          </div>
        </main>
      </div>
    </div>
  )
}

