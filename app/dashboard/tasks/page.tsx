'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { CheckSquare } from 'lucide-react'
import styles from '../page.module.css'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  
  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1><CheckSquare size={32} style={{display: 'inline', marginRight: '0.5rem'}} />Tasks & To-Dos</h1>
          </div>

          <div className={styles.emptyState}>
            <h2>Task Management</h2>
            <p>Organize and assign caregiving tasks to family members. Coming soon!</p>
          </div>
        </main>
      </div>
    </div>
  )
}

