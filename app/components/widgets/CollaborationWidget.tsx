'use client'

import Link from 'next/link'
import styles from './Widget.module.css'

export default function CollaborationWidget() {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Family Collaboration</h3>
      </div>
      
      <div className={styles.widgetContent}>
        <div className={styles.section}>
          <strong>Caregiving Team</strong>
          <div className={styles.emptyState}>
            <p>No family members added yet.</p>
          </div>
          <button className={styles.emptyButton}>👥 Invite Family Member</button>
        </div>

        <div className={styles.section}>
          <strong>Recent Messages</strong>
          <p className={styles.emptyText}>No messages yet.</p>
          <Link href="#" className={styles.viewAllLink}>View all messages</Link>
        </div>
      </div>
    </div>
  )
}

