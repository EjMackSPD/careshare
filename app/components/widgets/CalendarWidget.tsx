'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cake, CalendarClock, ShoppingCart, Stethoscope, Users } from 'lucide-react'
import styles from './Widget.module.css'

type Event = {
  id: string
  title: string
  eventDate: string
  type: string
}

function getEventIcon(type: string) {
  switch (type) {
    case 'BIRTHDAY':
      return Cake
    case 'APPOINTMENT':
      return Stethoscope
    case 'FOOD_DELIVERY':
      return ShoppingCart
    case 'VISIT':
      return Users
    default:
      return CalendarClock
  }
}

export default function CalendarWidget() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const familiesRes = await fetch('/api/families')
        if (!familiesRes.ok) return

        const familiesData = await familiesRes.json()
        const families = Array.isArray(familiesData) ? familiesData : []
        if (families.length === 0) return

        const allEvents: Event[] = []
        for (const family of families) {
          const eventsRes = await fetch(`/api/families/${family.id}/events`)
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json()
            allEvents.push(...eventsData)
          }
        }

        setEvents(allEvents)
      } catch (error) {
        console.error('CalendarWidget - Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const today = new Date()
  const upcomingEvents = events
    .filter((event) => new Date(event.eventDate) >= today)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 4)

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Upcoming Events</h3>
        <Link href="/dashboard/calendar" className={styles.addButton}>+ Add Event</Link>
      </div>

      <div className={styles.widgetContent}>
        {loading ? (
          <p className={styles.emptyText}>Loading...</p>
        ) : upcomingEvents.length === 0 ? (
          <p className={styles.emptyText}>No upcoming events.</p>
        ) : (
          <ul className={styles.eventsList}>
            {upcomingEvents.map((event) => {
              const EventIcon = getEventIcon(event.type)
              return (
              <li key={event.id} className={styles.eventItem}>
                <div className={styles.eventIcon}>
                  <EventIcon size={15} />
                </div>
                <span className={styles.eventTitle}>{event.title}</span>
                <span className={styles.eventDate}>
                  {new Date(event.eventDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </li>
              )
            })}
          </ul>
        )}

        <Link href="/dashboard/calendar" className={styles.viewAllLink}>View full calendar</Link>
      </div>
    </div>
  )
}
