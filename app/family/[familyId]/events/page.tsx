'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

type Event = {
  id: string
  title: string
  description: string | null
  type: string
  eventDate: string
  location: string | null
}

export default function FamilyEvents() {
  const params = useParams()
  const familyId = params.familyId as string
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'OTHER',
    eventDate: '',
    location: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [familyId])

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/families/${familyId}/events`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching events:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/families/${familyId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchEvents()
        setShowForm(false)
        setFormData({
          title: '',
          description: '',
          type: 'OTHER',
          eventDate: '',
          location: '',
        })
      }
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.logo}>CareShare</Link>
        <Link href={`/family/${familyId}`} className={styles.backLink}>← Back to Family</Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Events & Appointments</h1>
          <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Event'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Event Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Doctor's Appointment"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="APPOINTMENT">Medical Appointment</option>
                <option value="BIRTHDAY">Birthday</option>
                <option value="FOOD_DELIVERY">Food Delivery</option>
                <option value="VISIT">Family Visit</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Dr. Smith's Office"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional details..."
              />
            </div>

            <button type="submit" className={styles.submitBtn}>Create Event</button>
          </form>
        )}

        {loading ? (
          <div className={styles.loading}>Loading events...</div>
        ) : events.length === 0 ? (
          <div className={styles.empty}>
            <p>No events scheduled yet. Add your first event to get started!</p>
          </div>
        ) : (
          <div className={styles.eventsList}>
            {events.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventType}>{event.type.replace('_', ' ')}</div>
                <h3>{event.title}</h3>
                <p className={styles.eventDate}>
                  📅 {new Date(event.eventDate).toLocaleString()}
                </p>
                {event.location && <p className={styles.eventLocation}>📍 {event.location}</p>}
                {event.description && <p className={styles.eventDescription}>{event.description}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

