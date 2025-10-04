"use client";

import { useState } from "react";
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

const sampleEvents: Event[] = [
  // APRIL 2025 (Past)
  {
    id: "apr-1",
    title: "Cardiology Checkup",
    date: new Date(2025, 3, 5),
    type: "Healthcare",
    description: "Annual heart checkup with Dr. Martinez",
  },
  {
    id: "apr-2",
    title: "Medication Refill",
    date: new Date(2025, 3, 10),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "apr-3",
    title: "Easter Brunch",
    date: new Date(2025, 3, 20),
    type: "Social",
    description: "Family gathering for Easter",
  },
  {
    id: "apr-4",
    title: "Physical Therapy",
    date: new Date(2025, 3, 15),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "apr-5",
    title: "Home Care Visit",
    date: new Date(2025, 3, 22),
    type: "Healthcare",
    description: "Nurse home visit for wellness check",
  },

  // MAY 2025 (Past)
  {
    id: "may-1",
    title: "Dentist Cleaning",
    date: new Date(2025, 4, 8),
    type: "Healthcare",
    description: "6-month dental cleaning with Dr. Williams",
  },
  {
    id: "may-2",
    title: "Mother's Day Celebration",
    date: new Date(2025, 4, 11),
    type: "Social",
    description: "Special brunch with the family",
  },
  {
    id: "may-3",
    title: "Medication Refill",
    date: new Date(2025, 4, 12),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "may-4",
    title: "Physical Therapy",
    date: new Date(2025, 4, 19),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "may-5",
    title: "Eye Doctor Appointment",
    date: new Date(2025, 4, 22),
    type: "Healthcare",
    description: "Vision check and new glasses prescription",
  },
  {
    id: "may-6",
    title: "Grocery Delivery",
    date: new Date(2025, 4, 25),
    type: "Shopping",
    description: "Weekly grocery delivery",
  },

  // JUNE 2025 (Past)
  {
    id: "jun-1",
    title: "Grandma Birthday",
    date: new Date(2025, 5, 15),
    type: "Social",
    description: "Mom's 80th birthday celebration",
  },
  {
    id: "jun-2",
    title: "Medication Refill",
    date: new Date(2025, 5, 10),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "jun-3",
    title: "Primary Care Visit",
    date: new Date(2025, 5, 5),
    type: "Healthcare",
    description: "Follow-up with Dr. Stevens",
  },
  {
    id: "jun-4",
    title: "Physical Therapy",
    date: new Date(2025, 5, 18),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "jun-5",
    title: "Blood Work",
    date: new Date(2025, 5, 20),
    type: "Healthcare",
    description: "Quarterly lab work",
  },
  {
    id: "jun-6",
    title: "Garden Club Meeting",
    date: new Date(2025, 5, 25),
    type: "Social",
    description: "Senior garden club monthly meeting",
  },

  // JULY 2025 (Past)
  {
    id: "jul-1",
    title: "Medication Refill",
    date: new Date(2025, 6, 10),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "jul-2",
    title: "Independence Day BBQ",
    date: new Date(2025, 6, 4),
    type: "Social",
    description: "Family BBQ celebration",
  },
  {
    id: "jul-3",
    title: "Dermatology Screening",
    date: new Date(2025, 6, 12),
    type: "Healthcare",
    description: "Skin cancer screening",
  },
  {
    id: "jul-4",
    title: "Physical Therapy",
    date: new Date(2025, 6, 22),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "jul-5",
    title: "Grocery Delivery",
    date: new Date(2025, 6, 28),
    type: "Shopping",
    description: "Weekly grocery delivery",
  },

  // AUGUST 2025 (Past)
  {
    id: "aug-1",
    title: "Medication Refill",
    date: new Date(2025, 7, 10),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "aug-2",
    title: "Podiatrist Appointment",
    date: new Date(2025, 7, 8),
    type: "Healthcare",
    description: "Foot care appointment",
  },
  {
    id: "aug-3",
    title: "Physical Therapy",
    date: new Date(2025, 7, 15),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "aug-4",
    title: "Book Club",
    date: new Date(2025, 7, 20),
    type: "Social",
    description: "Senior book club meeting",
  },
  {
    id: "aug-5",
    title: "Audiology Test",
    date: new Date(2025, 7, 25),
    type: "Healthcare",
    description: "Hearing test and aid adjustment",
  },

  // SEPTEMBER 2025 (Past)
  {
    id: "sep-1",
    title: "Cardiology Follow-up",
    date: new Date(2025, 8, 3),
    type: "Healthcare",
    description: "Heart specialist follow-up",
  },
  {
    id: "sep-2",
    title: "Medication Refill",
    date: new Date(2025, 8, 10),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "sep-3",
    title: "Labor Day Picnic",
    date: new Date(2025, 8, 1),
    type: "Social",
    description: "Family picnic at the park",
  },
  {
    id: "sep-4",
    title: "Physical Therapy",
    date: new Date(2025, 8, 18),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "sep-5",
    title: "Flu Shot",
    date: new Date(2025, 8, 25),
    type: "Healthcare",
    description: "Annual flu vaccination",
  },
  {
    id: "sep-6",
    title: "Grocery Delivery",
    date: new Date(2025, 8, 28),
    type: "Shopping",
    description: "Weekly grocery delivery",
  },

  // OCTOBER 2025 (Current Month)
  {
    id: "oct-1",
    title: "Doctor Appointment",
    date: new Date(2025, 9, 5),
    type: "Healthcare",
    description: "Quarterly checkup with Dr. Stevens",
  },
  {
    id: "oct-2",
    title: "Medication Refill",
    date: new Date(2025, 9, 10),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "oct-3",
    title: "Family Dinner",
    date: new Date(2025, 9, 12),
    type: "Social",
    description: "Dinner at Italian restaurant",
  },
  {
    id: "oct-4",
    title: "Dentist Appointment",
    date: new Date(2025, 9, 15),
    type: "Healthcare",
    description: "Regular cleaning with Dr. Williams",
  },
  {
    id: "oct-5",
    title: "Physical Therapy",
    date: new Date(2025, 9, 20),
    type: "Healthcare",
    description: "Weekly PT session at wellness center",
  },
  {
    id: "oct-6",
    title: "Blood Work",
    date: new Date(2025, 9, 22),
    type: "Healthcare",
    description: "Routine lab work",
  },
  {
    id: "oct-7",
    title: "Grocery Delivery",
    date: new Date(2025, 9, 25),
    type: "Shopping",
    description: "Weekly grocery delivery",
  },
  {
    id: "oct-8",
    title: "Book Club",
    date: new Date(2025, 9, 28),
    type: "Social",
    description: "Monthly book club meeting",
  },

  // NOVEMBER 2025 (Future)
  {
    id: "nov-1",
    title: "Medication Refill",
    date: new Date(2025, 10, 8),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "nov-2",
    title: "Eye Doctor Appointment",
    date: new Date(2025, 10, 10),
    type: "Healthcare",
    description: "Annual vision exam",
  },
  {
    id: "nov-3",
    title: "Physical Therapy",
    date: new Date(2025, 10, 15),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "nov-4",
    title: "Thanksgiving Dinner",
    date: new Date(2025, 10, 27),
    type: "Social",
    description: "Family Thanksgiving celebration",
  },
  {
    id: "nov-5",
    title: "Home Care Visit",
    date: new Date(2025, 10, 20),
    type: "Healthcare",
    description: "Monthly nurse visit",
  },
  {
    id: "nov-6",
    title: "Grocery Delivery",
    date: new Date(2025, 10, 22),
    type: "Shopping",
    description: "Weekly grocery delivery",
  },

  // DECEMBER 2025 (Future)
  {
    id: "dec-1",
    title: "Medication Refill",
    date: new Date(2025, 11, 10),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "dec-2",
    title: "Cardiology Appointment",
    date: new Date(2025, 11, 5),
    type: "Healthcare",
    description: "Heart specialist visit",
  },
  {
    id: "dec-3",
    title: "Christmas Celebration",
    date: new Date(2025, 11, 25),
    type: "Social",
    description: "Family Christmas gathering",
  },
  {
    id: "dec-4",
    title: "Physical Therapy",
    date: new Date(2025, 11, 18),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "dec-5",
    title: "Holiday Meal Delivery",
    date: new Date(2025, 11, 23),
    type: "Shopping",
    description: "Special holiday meal service",
  },
  {
    id: "dec-6",
    title: "New Year Eve Party",
    date: new Date(2025, 11, 31),
    type: "Social",
    description: "Family New Year celebration",
  },

  // JANUARY 2026 (Future)
  {
    id: "jan-1",
    title: "Annual Physical",
    date: new Date(2026, 0, 15),
    type: "Healthcare",
    description: "Comprehensive annual physical exam",
  },
  {
    id: "jan-2",
    title: "Medication Refill",
    date: new Date(2026, 0, 10),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "jan-3",
    title: "Physical Therapy",
    date: new Date(2026, 0, 20),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "jan-4",
    title: "Blood Work",
    date: new Date(2026, 0, 25),
    type: "Healthcare",
    description: "Quarterly lab work",
  },
  {
    id: "jan-5",
    title: "Grocery Delivery",
    date: new Date(2026, 0, 28),
    type: "Shopping",
    description: "Weekly grocery delivery",
  },

  // FEBRUARY 2026 (Future)
  {
    id: "feb-1",
    title: "Medication Refill",
    date: new Date(2026, 1, 10),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "feb-2",
    title: "Dentist Checkup",
    date: new Date(2026, 1, 12),
    type: "Healthcare",
    description: "6-month dental cleaning",
  },
  {
    id: "feb-3",
    title: "Valentine Day Tea",
    date: new Date(2026, 1, 14),
    type: "Social",
    description: "Senior center Valentine celebration",
  },
  {
    id: "feb-4",
    title: "Physical Therapy",
    date: new Date(2026, 1, 20),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "feb-5",
    title: "Specialist Consultation",
    date: new Date(2026, 1, 25),
    type: "Healthcare",
    description: "Consultation with neurologist",
  },

  // MARCH 2026 (Future)
  {
    id: "mar-1",
    title: "Medication Refill",
    date: new Date(2026, 2, 10),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "mar-2",
    title: "Primary Care Visit",
    date: new Date(2026, 2, 8),
    type: "Healthcare",
    description: "Checkup with Dr. Stevens",
  },
  {
    id: "mar-3",
    title: "Physical Therapy",
    date: new Date(2026, 2, 15),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "mar-4",
    title: "Garden Club Spring",
    date: new Date(2026, 2, 22),
    type: "Social",
    description: "Spring garden club event",
  },
  {
    id: "mar-5",
    title: "Grocery Delivery",
    date: new Date(2026, 2, 28),
    type: "Shopping",
    description: "Weekly grocery delivery",
  },

  // APRIL 2026 (Future)
  {
    id: "apr26-1",
    title: "Eye Exam",
    date: new Date(2026, 3, 10),
    type: "Healthcare",
    description: "Annual eye examination",
  },
  {
    id: "apr26-2",
    title: "Medication Refill",
    date: new Date(2026, 3, 12),
    type: "Medication",
    description: "Monthly prescription pickup",
  },
  {
    id: "apr26-3",
    title: "Easter Dinner",
    date: new Date(2026, 3, 20),
    type: "Social",
    description: "Family Easter celebration",
  },
  {
    id: "apr26-4",
    title: "Physical Therapy",
    date: new Date(2026, 3, 18),
    type: "Healthcare",
    description: "Weekly PT session",
  },
  {
    id: "apr26-5",
    title: "Blood Work",
    date: new Date(2026, 3, 25),
    type: "Healthcare",
    description: "Quarterly lab work",
  },
];

const eventTypeColors: { [key: string]: string } = {
  Healthcare: "#3b82f6", // Blue
  Medication: "#ef4444", // Red
  Social: "#10b981", // Green
  Shopping: "#f59e0b", // Amber
  Other: "#8b5cf6", // Purple
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 2)); // October 2, 2025
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 2));
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "Healthcare",
    date: "",
    time: "",
  });

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

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventDate = new Date(`${newEvent.date}T${newEvent.time || "12:00"}`);
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: eventDate,
      type: newEvent.type,
      description: newEvent.description,
    };
    setEvents([...events, event]);
    setShowAddEvent(false);
    setNewEvent({
      title: "",
      description: "",
      type: "Healthcare",
      date: "",
      time: "",
    });
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
                      const hasEvent = hasEvents(date);
                      const eventTypes = getEventTypesForDate(date);

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
                          {hasEvent && (
                            <div className={styles.eventIndicators}>
                              {eventTypes.map((type) => (
                                <div
                                  key={type}
                                  className={styles.eventDot}
                                  style={{
                                    backgroundColor: eventTypeColors[type],
                                  }}
                                  title={type}
                                ></div>
                              ))}
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
