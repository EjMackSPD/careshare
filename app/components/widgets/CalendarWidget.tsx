'use client'

import Link from 'next/link'
import styles from './Widget.module.css'

export default function CalendarWidget() {
  const today = new Date()
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Simple calendar grid (placeholder)
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay()

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Upcoming Calendar</h3>
        <Link href="/dashboard/calendar" className={styles.addButton}>+ Add Event</Link>
      </div>
      
      <div className={styles.widgetContent}>
        <div className={styles.calendarHeader}>
          <span>←</span>
          <strong>{monthName}</strong>
          <span>→</span>
        </div>

        <div className={styles.calendarGrid}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className={styles.calendarDay}>{day}</div>
          ))}
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className={styles.calendarDate}></div>
          ))}
          {Array(Math.min(daysInMonth, 14)).fill(null).map((_, i) => (
            <div 
              key={i + 1} 
              className={`${styles.calendarDate} ${i + 1 === today.getDate() ? styles.today : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className={styles.upcomingEvents}>
          <strong>Upcoming Events</strong>
          <p className={styles.emptyText}>No upcoming events.</p>
        </div>

        <Link href="/dashboard/calendar" className={styles.viewAllLink}>Schedule an event</Link>
      </div>
    </div>
  )
}

