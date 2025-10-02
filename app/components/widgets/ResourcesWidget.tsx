'use client'

import Link from 'next/link'
import styles from './Widget.module.css'

export default function ResourcesWidget() {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Community Resources & Support</h3>
      </div>
      
      <div className={styles.widgetContent}>
        <div className={styles.emptyState}>
          <p>No community resources available at this time.</p>
        </div>
        <button className={styles.emptyButton}>Search for Resources</button>
      </div>
    </div>
  )
}

