'use client'

import Link from 'next/link'
import styles from './Widget.module.css'

export default function TasksWidget() {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Tasks & Responsibilities</h3>
        <Link href="/dashboard/tasks" className={styles.addButton}>+ Add Task</Link>
      </div>
      
      <div className={styles.widgetContent}>
        <div className={styles.emptyState}>
          <p>No tasks found.</p>
          <button className={styles.emptyButton}>+ Add your first task</button>
        </div>
        <Link href="/dashboard/tasks" className={styles.viewAllLink}>View all tasks</Link>
      </div>
    </div>
  )
}

