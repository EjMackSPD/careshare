'use client'

import Link from 'next/link'
import styles from './Widget.module.css'

type Resource = {
  id: string
  title: string
  category: string
  url: string | null
}

type ResourcesWidgetProps = {
  resources?: Resource[]
}

export default function ResourcesWidget({ resources = [] }: ResourcesWidgetProps) {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Community Resources & Support</h3>
        <Link href="/dashboard/resources" className={styles.addButton}>+ Add</Link>
      </div>

      <div className={styles.widgetContent}>
        {resources.length === 0 ? (
          <>
            <div className={styles.emptyState}>
              <p>No community resources added yet.</p>
            </div>
            <Link href="/dashboard/resources" className={styles.emptyButton}>
              Browse Resources
            </Link>
          </>
        ) : (
          <>
            <ul className={styles.resourcesList}>
              {resources.slice(0, 4).map((resource) => (
                <li key={resource.id} className={styles.resourceItem}>
                  <span className={styles.resourceTitle}>{resource.title}</span>
                  <span className={styles.resourceCategory}>{resource.category}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/resources" className={styles.viewAllLink}>
              View all resources
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
