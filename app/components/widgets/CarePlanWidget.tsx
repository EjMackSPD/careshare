'use client'

import Link from 'next/link'
import styles from './Widget.module.css'

export default function CarePlanWidget() {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Care Planning & Forecasting</h3>
      </div>
      
      <div className={styles.widgetContent}>
        <div className={styles.emptyState}>
          <p>No care plan has been created yet.</p>
        </div>
        <Link href="/dashboard/care-plan">
          <button className={styles.emptyButton}>Create Care Plan</button>
        </Link>
      </div>
    </div>
  )
}

