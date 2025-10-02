'use client'

import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { BookOpen } from 'lucide-react'
import styles from '../page.module.css'

export default function ResourcesPage() {
  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1><BookOpen size={32} style={{display: 'inline', marginRight: '0.5rem'}} />Resources</h1>
          </div>

          <div className={styles.emptyState}>
            <h2>Care Resources & Documents</h2>
            <p>Store important documents, contacts, and helpful resources for caregiving. Coming soon!</p>
          </div>
        </main>
      </div>
    </div>
  )
}

