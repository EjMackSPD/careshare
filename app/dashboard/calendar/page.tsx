"use client";

import { useState, useEffect } from "react";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import styles from "./page.module.css";

type Event = {
  id: string;
  title: string;
  date: Date;
  type: string;
  description?: string;
};

const eventTypeColors: { [key: string]: string } = {
  Healthcare: "#3b82f6", // Blue
  Medication: "#ef4444", // Red
  Social: "#10b981", // Green
  Shopping: "#f59e0b", // Amber
  Other: "#8b5cf6", // Purple
  APPOINTMENT: "#3b82f6", // Blue (maps to Healthcare)
  VISIT: "#10b981", // Green (maps to Social)
  FOOD_DELIVERY: "#f59e0b", // Amber (maps to Shopping)
  BIRTHDAY: "#ec4899", // Pink
};

// Map database EventType to display type
const mapEventType = (dbType: string): string => {
  const typeMap: { [key: string]: string } = {
    APPOINTMENT: "Healthcare",
    VISIT: "Social",
    FOOD_DELIVERY: "Shopping",
    BIRTHDAY: "Social",
    OTHER: "Other",
  };
  return typeMap[dbType] || dbType;
};

// Map display type to database EventType
const mapDisplayTypeToDb = (displayType: string): string => {
  const reverseMap: { [key: string]: string } = {
    Healthcare: "APPOINTMENT",
    Medication: "APPOINTMENT", // Medical appointments
    Social: "VISIT",
    Shopping: "FOOD_DELIVERY",
    Other: "OTHER",
  };
  return reverseMap[displayType] || "OTHER";
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 2)); // October 2, 2025
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 2));
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "Healthcare",
    date: "",
    time: "",
  });

  // Fetch events from database
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch families
        const familiesRes = await fetch("/api/families");
        if (!familiesRes.ok) return;
        const families = await familiesRes.json();
        const familiesArray = Array.isArray(families) ? families : [];

        if (familiesArray.length > 0) {
          const family = familiesArray[0];
          setFamilyId(family.id);

          // Fetch events for the family
          const eventsRes = await fetch(`/api/families/${family.id}/events`);
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            // Map database events to component format
            const mappedEvents = eventsData.map((evt: any) => ({
              id: evt.id,
              title: evt.title,
              date: new Date(evt.eventDate),
              type: mapEventType(evt.type), // Convert DB type to display type
              description: evt.description,
            }));
            setEvents(mappedEvents);
          }
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const getEventTypesForDate = (date: Date) => {
    const dateEvents = getEventsForDate(date);
    const uniqueTypes = [...new Set(dateEvents.map((e) => e.type))];
    return uniqueTypes;
  };

  const handleDateClick = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(date);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId) return;

    try {
      const eventDate = new Date(
        `${newEvent.date}T${newEvent.time || "12:00"}`
      );

      const response = await fetch(`/api/families/${familyId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          type: mapDisplayTypeToDb(newEvent.type), // Convert display type to DB type
          eventDate: eventDate.toISOString(),
        }),
      });

      if (response.ok) {
        const createdEvent = await response.json();
        const mappedEvent: Event = {
          id: createdEvent.id,
          title: createdEvent.title,
          date: new Date(createdEvent.eventDate),
          type: mapEventType(createdEvent.type), // Convert DB type back to display type
          description: createdEvent.description,
        };
        setEvents([...events, mappedEvent]);
        setShowAddEvent(false);
        setNewEvent({
          title: "",
          description: "",
          type: "Healthcare",
          date: "",
          time: "",
        });
      }
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Please try again.");
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const selectedEvents = getEventsForDate(selectedDate);

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Calendar</h1>
              <p className={styles.subtitle}>
                Schedule and manage appointments and events
              </p>
            </div>
            <button
              className={styles.addEventBtn}
              onClick={() => setShowAddEvent(true)}
            >
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
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </span>
                  <button onClick={nextMonth} className={styles.navBtn}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Event Type Legend */}
              <div className={styles.legend}>
                {Object.entries(eventTypeColors).map(([type, color]) => (
                  <div key={type} className={styles.legendItem}>
                    <div
                      className={styles.legendDot}
                      style={{ backgroundColor: color }}
                    ></div>
                    <span>{type}</span>
                  </div>
                ))}
              </div>

              <div className={styles.calendar}>
                <div className={styles.weekDays}>
                  {daysOfWeek.map((day, i) => (
                    <div key={i} className={styles.weekDay}>
                      {day}
                    </div>
                  ))}
                </div>

                <div className={styles.daysGrid}>
                  {Array(firstDay)
                    .fill(null)
                    .map((_, i) => (
                      <div key={`empty-${i}`} className={styles.emptyDay}></div>
                    ))}

                  {Array(daysInMonth)
                    .fill(null)
                    .map((_, i) => {
                      const day = i + 1;
                      const date = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                      );
                      const isSelected = isSameDay(date, selectedDate);
                      const isTodayDate = isToday(date);
                      const dayEvents = getEventsForDate(date);
                      const hasEvent = dayEvents.length > 0;

                      return (
                        <div
                          key={day}
                          className={`${styles.day} ${
                            isSelected ? styles.selected : ""
                          } ${isTodayDate ? styles.today : ""} ${
                            hasEvent ? styles.hasEvents : ""
                          }`}
                          onClick={() => handleDateClick(day)}
                        >
                          <span className={styles.dayNumber}>{day}</span>
                          {isTodayDate && (
                            <span className={styles.todayBadge}>Today</span>
                          )}
                          {hasEvent && (
                            <div className={styles.eventCount}>
                              {dayEvents.length}{" "}
                              {dayEvents.length === 1 ? "event" : "events"}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Events Sidebar */}
            <div className={styles.eventsSidebar}>
              <div className={styles.dateHeader}>
                <CalendarIcon size={20} />
                <h3>
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
              </div>

              <div className={styles.eventsContent}>
                {selectedEvents.length === 0 ? (
                  <div className={styles.noEvents}>
                    <p>No events scheduled for this day.</p>
                    <button
                      className={styles.addEventSmallBtn}
                      onClick={() => setShowAddEvent(true)}
                    >
                      + Add Event
                    </button>
                  </div>
                ) : (
                  <div className={styles.eventsList}>
                    {selectedEvents.map((event) => (
                      <div
                        key={event.id}
                        className={styles.eventCard}
                        style={{ borderLeftColor: eventTypeColors[event.type] }}
                      >
                        <div className={styles.eventCardHeader}>
                          <div
                            className={styles.eventTypeBadge}
                            style={{
                              backgroundColor: eventTypeColors[event.type],
                            }}
                          >
                            {event.type}
                          </div>
                        </div>
                        <h4>{event.title}</h4>
                        {event.description && (
                          <p className={styles.eventDescription}>
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Event Modal */}
          {showAddEvent && (
            <div
              className={styles.modal}
              onClick={() => setShowAddEvent(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>Add New Event</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowAddEvent(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddEvent} className={styles.eventForm}>
                  <div className={styles.formGroup}>
                    <label>Event Title *</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                      placeholder="e.g., Doctor Appointment"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Type *</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, type: e.target.value })
                      }
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
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, date: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Time</label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, time: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          description: e.target.value,
                        })
                      }
                      placeholder="Additional details..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowAddEvent(false)}
                      className={styles.cancelBtn}
                    >
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
      <Footer />
    </div>
  );
}
