'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Widget.module.css'

type Event = {
  id: string
  title: string
  eventDate: string
  type: string
}

export default function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      // Fetch all families
      const familiesRes = await fetch('/api/families')
      if (!familiesRes.ok) return

      const familiesData = await familiesRes.json()
      if (!familiesData.families || familiesData.families.length === 0) return

      // Fetch events from all families
      const allEvents: Event[] = []
      for (const family of familiesData.families) {
        const eventsRes = await fetch(`/api/families/${family.id}/events`)
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json()
          allEvents.push(...eventsData)
        }
      }

      setEvents(allEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString()
    return events.filter(event => {
      const eventDate = new Date(event.eventDate).toDateString()
      return eventDate === dateStr
    })
  }

  // Get upcoming events (next 5 events)
  const upcomingEvents = events
    .filter(event => new Date(event.eventDate) >= today)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5)

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Upcoming Calendar</h3>
        <Link href="/dashboard/calendar" className={styles.addButton}>+ Add Event</Link>
      </div>
      
      <div className={styles.widgetContent}>
        <div className={styles.calendarHeader}>
          <button onClick={() => navigateMonth('prev')} className={styles.monthNav}>←</button>
          <strong>{monthName}</strong>
          <button onClick={() => navigateMonth('next')} className={styles.monthNav}>→</button>
        </div>

        <div className={styles.calendarGrid}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className={styles.calendarDay}>{day}</div>
          ))}
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className={styles.calendarDate}></div>
          ))}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1
            const dateEvents = getEventsForDate(day)
            const isToday = day === today.getDate() && 
                           currentMonth.getMonth() === today.getMonth() && 
                           currentMonth.getFullYear() === today.getFullYear()
            
            return (
              <div 
                key={day} 
                className={`${styles.calendarDate} ${isToday ? styles.today : ''} ${dateEvents.length > 0 ? styles.hasEvents : ''}`}
                title={dateEvents.length > 0 ? `${dateEvents.length} event(s)` : ''}
              >
                {day}
                {dateEvents.length > 0 && <span className={styles.eventDot}></span>}
              </div>
            )
          })}
        </div>

        <div className={styles.upcomingEvents}>
          <strong>Upcoming Events</strong>
          {loading ? (
            <p className={styles.emptyText}>Loading...</p>
          ) : upcomingEvents.length === 0 ? (
            <p className={styles.emptyText}>No upcoming events.</p>
          ) : (
            <ul className={styles.eventsList}>
              {upcomingEvents.map(event => (
                <li key={event.id} className={styles.eventItem}>
                  <span className={styles.eventTitle}>{event.title}</span>
                  <span className={styles.eventDate}>
                    {new Date(event.eventDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link href="/dashboard/calendar" className={styles.viewAllLink}>View Full Calendar</Link>
      </div>
    </div>
  )
}

