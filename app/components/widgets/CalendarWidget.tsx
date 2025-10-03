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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showMonthPicker, setShowMonthPicker] = useState(false)

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

      console.log('CalendarWidget - Fetched events:', allEvents.length)
      console.log('CalendarWidget - Sample event:', allEvents[0])
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
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth()
    const targetDay = targetDate.getDate()
    
    return events.filter(event => {
      const eventDate = new Date(event.eventDate)
      return (
        eventDate.getFullYear() === targetYear &&
        eventDate.getMonth() === targetMonth &&
        eventDate.getDate() === targetDay
      )
    })
  }

  // Get upcoming events (next 5 events or events for selected date)
  const upcomingEvents = selectedDate
    ? events.filter(event => {
        const eventDate = new Date(event.eventDate)
        return (
          eventDate.getFullYear() === selectedDate.getFullYear() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getDate() === selectedDate.getDate()
        )
      })
    : events
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

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    console.log('CalendarWidget - Date clicked:', clickedDate.toLocaleDateString())
    console.log('CalendarWidget - Events for this date:', getEventsForDate(day))
    setSelectedDate(clickedDate)
  }

  const handleMonthYearSelect = (month: number, year: number) => {
    setCurrentMonth(new Date(year, month, 1))
    setShowMonthPicker(false)
  }

  const resetToToday = () => {
    const now = new Date()
    setCurrentMonth(now)
    setSelectedDate(now)
  }

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 10 }, (_, i) => currentYear - 2 + i)
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Upcoming Calendar</h3>
        <Link href="/dashboard/calendar" className={styles.addButton}>+ Add Event</Link>
      </div>
      
      <div className={styles.widgetContent}>
        <div className={styles.calendarHeaderWrapper}>
          <div className={styles.calendarHeader}>
            <button onClick={() => navigateMonth('prev')} className={styles.monthNav}>←</button>
            <strong 
              onClick={() => setShowMonthPicker(!showMonthPicker)} 
              className={styles.monthYearBtn}
              title="Click to select month/year"
            >
              {monthName}
            </strong>
            <button onClick={() => navigateMonth('next')} className={styles.monthNav}>→</button>
          </div>
          <button onClick={resetToToday} className={styles.todayBtn} title="Jump to today">
            Today
          </button>
        </div>

        {showMonthPicker && (
          <div className={styles.monthYearPicker}>
            <div className={styles.pickerHeader}>
              <h4>Select Month & Year</h4>
              <button onClick={() => setShowMonthPicker(false)} className={styles.closePickerBtn}>✕</button>
            </div>
            <div className={styles.yearSelect}>
              {generateYearRange().map(year => (
                <button
                  key={year}
                  onClick={() => handleMonthYearSelect(currentMonth.getMonth(), year)}
                  className={`${styles.yearBtn} ${year === currentMonth.getFullYear() ? styles.selectedYear : ''}`}
                >
                  {year}
                </button>
              ))}
            </div>
            <div className={styles.monthSelect}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                <button
                  key={month}
                  onClick={() => handleMonthYearSelect(index, currentMonth.getFullYear())}
                  className={`${styles.monthBtn} ${index === currentMonth.getMonth() ? styles.selectedMonth : ''}`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        )}

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
            const isSelected = selectedDate && 
                              day === selectedDate.getDate() && 
                              currentMonth.getMonth() === selectedDate.getMonth() && 
                              currentMonth.getFullYear() === selectedDate.getFullYear()
            
            return (
              <div 
                key={day} 
                className={`${styles.calendarDate} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''} ${dateEvents.length > 0 ? styles.hasEvents : ''}`}
                title={dateEvents.length > 0 ? `${dateEvents.length} event(s)` : ''}
                onClick={() => handleDateClick(day)}
              >
                {day}
                {dateEvents.length > 0 && <span className={styles.eventDot}></span>}
              </div>
            )
          })}
        </div>

        <div className={styles.upcomingEvents}>
          <div className={styles.eventsHeader}>
            <strong>
              {selectedDate 
                ? `Events for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'Upcoming Events'
              }
            </strong>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(null)} 
                className={styles.clearSelectionBtn}
                title="Clear selection"
              >
                ✕
              </button>
            )}
          </div>
          {loading ? (
            <p className={styles.emptyText}>Loading...</p>
          ) : upcomingEvents.length === 0 ? (
            <p className={styles.emptyText}>
              {selectedDate ? 'No events on this date.' : 'No upcoming events.'}
            </p>
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

