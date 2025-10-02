'use client'

import { useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react'
import styles from './page.module.css'

type Event = {
  id: string
  title: string
  date: Date
  type: string
  description?: string
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Doctor Appointment',
    date: new Date(2025, 9, 5), // October 5
    type: 'Healthcare',
    description: 'Annual checkup with Dr. Stevens'
  },
  {
    id: '2',
    title: 'Medication Refill',
    date: new Date(2025, 9, 10),
    type: 'Medication',
    description: 'Pick up monthly prescriptions'
  }
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 2)) // October 2, 2025
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 2))
  const [events, setEvents] = useState<Event[]>(sampleEvents)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'Healthcare',
    date: '',
    time: '',
  })

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return isSameDay(date, today)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date))
  }

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(date)
  }

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    const eventDate = new Date(`${newEvent.date}T${newEvent.time || '12:00'}`)
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: eventDate,
      type: newEvent.type,
      description: newEvent.description,
    }
    setEvents([...events, event])
    setShowAddEvent(false)
    setNewEvent({
      title: '',
      description: '',
      type: 'Healthcare',
      date: '',
      time: '',
    })
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const selectedEvents = getEventsForDate(selectedDate)

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Calendar</h1>
              <p className={styles.subtitle}>Schedule and manage appointments and events</p>
            </div>
            <button className={styles.addEventBtn} onClick={() => setShowAddEvent(true)}>
              + Add Event
            </button>
          </div>

          <div className={styles.calendarLayout}>
            {/* Calendar View */}
            <div className={styles.calendarCard}>
              <div className={styles.calendarHeader}>
                <h2>Calendar</h2>
                <div className={styles.monthNav}>
                  <button onClick={previousMonth} className={styles.navBtn}>
                    <ChevronLeft size={20} />
                  </button>
                  <span className={styles.monthYear}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <button onClick={nextMonth} className={styles.navBtn}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className={styles.calendar}>
                <div className={styles.weekDays}>
                  {daysOfWeek.map((day, i) => (
                    <div key={i} className={styles.weekDay}>{day}</div>
                  ))}
                </div>

                <div className={styles.daysGrid}>
                  {Array(firstDay).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} className={styles.emptyDay}></div>
                  ))}
                  
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const isSelected = isSameDay(date, selectedDate)
                    const isTodayDate = isToday(date)
                    const hasEvent = hasEvents(date)

                    return (
                      <div
                        key={day}
                        className={`${styles.day} ${isSelected ? styles.selected : ''} ${isTodayDate ? styles.today : ''}`}
                        onClick={() => handleDateClick(day)}
                      >
                        <span>{day}</span>
                        {hasEvent && <div className={styles.eventDot}></div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Events Sidebar */}
            <div className={styles.eventsSidebar}>
              <div className={styles.dateHeader}>
                <CalendarIcon size={20} />
                <h3>{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
              </div>

              <div className={styles.eventsContent}>
                {selectedEvents.length === 0 ? (
                  <div className={styles.noEvents}>
                    <p>No events scheduled for this day.</p>
                    <button className={styles.addEventSmallBtn} onClick={() => setShowAddEvent(true)}>
                      + Add Event
                    </button>
                  </div>
                ) : (
                  <div className={styles.eventsList}>
                    {selectedEvents.map((event) => (
                      <div key={event.id} className={styles.eventCard}>
                        <h4>{event.title}</h4>
                        <p className={styles.eventType}>{event.type}</p>
                        {event.description && <p className={styles.eventDescription}>{event.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Event Modal */}
          {showAddEvent && (
            <div className={styles.modal} onClick={() => setShowAddEvent(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Add New Event</h2>
                  <button className={styles.closeBtn} onClick={() => setShowAddEvent(false)}>✕</button>
                </div>
                
                <form onSubmit={handleAddEvent} className={styles.eventForm}>
                  <div className={styles.formGroup}>
                    <label>Event Title *</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="e.g., Doctor Appointment"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Type *</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                      required
                    >
                      <option value="Healthcare">Healthcare</option>
                      <option value="Medication">Medication</option>
                      <option value="Social">Social Visit</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Date *</label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Time</label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Additional details..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" onClick={() => setShowAddEvent(false)} className={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      Add Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

