"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import styles from "./page.module.css";

type FamilySummary = {
  id: string;
  name: string;
  elderName?: string | null;
};

type CalendarEvent = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  type: DbEventType;
  eventDate: string;
};

type DbEventType =
  | "APPOINTMENT"
  | "VISIT"
  | "FOOD_DELIVERY"
  | "BIRTHDAY"
  | "OTHER";

type EventFormState = {
  title: string;
  description: string;
  location: string;
  type: DbEventType;
  date: string;
  time: string;
};

const EVENT_TYPE_META: Record<
  DbEventType,
  { label: string; accent: string; soft: string }
> = {
  APPOINTMENT: {
    label: "Appointment",
    accent: "#0f766e",
    soft: "rgba(15, 118, 110, 0.14)",
  },
  VISIT: {
    label: "Visit",
    accent: "#2563eb",
    soft: "rgba(37, 99, 235, 0.14)",
  },
  FOOD_DELIVERY: {
    label: "Food Delivery",
    accent: "#d97706",
    soft: "rgba(217, 119, 6, 0.14)",
  },
  BIRTHDAY: {
    label: "Birthday",
    accent: "#db2777",
    soft: "rgba(219, 39, 119, 0.14)",
  },
  OTHER: {
    label: "Other",
    accent: "#6366f1",
    soft: "rgba(99, 102, 241, 0.14)",
  },
};

const FILTER_OPTIONS: Array<DbEventType | "ALL"> = [
  "ALL",
  "APPOINTMENT",
  "VISIT",
  "FOOD_DELIVERY",
  "BIRTHDAY",
  "OTHER",
];

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatSelectedDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDayNumber(date: Date) {
  return date.toLocaleDateString("en-US", { day: "numeric" });
}

function formatEventTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function toLocalDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalTimeInput(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function createEmptyForm(date: Date): EventFormState {
  return {
    title: "",
    description: "",
    location: "",
    type: "APPOINTMENT",
    date: toLocalDateInput(date),
    time: "09:00",
  };
}

function toEventDate(form: EventFormState) {
  return new Date(`${form.date}T${form.time || "09:00"}`);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function getCalendarDays(currentMonth: Date) {
  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function matchesSearch(event: CalendarEvent, query: string) {
  if (!query.trim()) {
    return true;
  }

  const normalized = query.trim().toLowerCase();
  return [event.title, event.description ?? "", event.location ?? ""].some((value) =>
    value.toLowerCase().includes(normalized)
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [families, setFamilies] = useState<FamilySummary[]>([]);
  const [familyId, setFamilyId] = useState<string>("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<DbEventType | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>(createEmptyForm(today));

  useEffect(() => {
    async function fetchFamilies() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/families");
        if (!response.ok) {
          throw new Error("Unable to load your families");
        }

        const data = await response.json();
        const nextFamilies = Array.isArray(data) ? data : [];
        setFamilies(nextFamilies);

        if (nextFamilies.length > 0) {
          setFamilyId((currentFamilyId) => currentFamilyId || nextFamilies[0].id);
        }
      } catch (fetchError: any) {
        setError(fetchError.message || "Unable to load your calendar");
      } finally {
        setLoading(false);
      }
    }

    void fetchFamilies();
  }, []);

  useEffect(() => {
    if (!familyId) {
      setEvents([]);
      return;
    }

    async function fetchEvents() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/families/${familyId}/events`);
        if (!response.ok) {
          throw new Error("Unable to load events for this workspace");
        }

        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (fetchError: any) {
        setError(fetchError.message || "Unable to load events");
      } finally {
        setLoading(false);
      }
    }

    void fetchEvents();
  }, [familyId]);

  const filteredEvents = events.filter((event) => {
    if (activeFilter !== "ALL" && event.type !== activeFilter) {
      return false;
    }

    return matchesSearch(event, query);
  });

  const selectedEvents = filteredEvents
    .filter((event) => isSameDay(new Date(event.eventDate), selectedDate))
    .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate));

  const monthEvents = filteredEvents.filter((event) =>
    isSameMonth(new Date(event.eventDate), currentMonth)
  );

  const upcomingEvents = filteredEvents
    .filter((event) => new Date(event.eventDate) >= new Date())
    .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate))
    .slice(0, 6);

  const nextSevenDayCount = filteredEvents.filter((event) => {
    const eventDate = new Date(event.eventDate);
    const diff = eventDate.getTime() - today.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const activeFamily = families.find((family) => family.id === familyId);
  const calendarDays = getCalendarDays(currentMonth);

  function eventsForDate(date: Date) {
    return filteredEvents
      .filter((event) => isSameDay(new Date(event.eventDate), date))
      .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate));
  }

  function openCreateModal(date = selectedDate) {
    setEditingEventId(null);
    setEventForm(createEmptyForm(date));
    setIsModalOpen(true);
  }

  function openEditModal(event: CalendarEvent) {
    const date = new Date(event.eventDate);
    setEditingEventId(event.id);
    setEventForm({
      title: event.title,
      description: event.description ?? "",
      location: event.location ?? "",
      type: event.type,
      date: toLocalDateInput(date),
      time: toLocalTimeInput(date),
    });
    setIsModalOpen(true);
  }

  async function handleSubmitEvent(event: React.FormEvent) {
    event.preventDefault();

    if (!familyId) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        type: eventForm.type,
        eventDate: toEventDate(eventForm).toISOString(),
      };

      const response = await fetch(
        editingEventId
          ? `/api/events/${editingEventId}`
          : `/api/families/${familyId}/events`,
        {
          method: editingEventId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(editingEventId ? "Unable to update event" : "Unable to create event");
      }

      const savedEvent = await response.json();
      setEvents((currentEvents) => {
        if (editingEventId) {
          return currentEvents.map((currentEvent) =>
            currentEvent.id === editingEventId ? savedEvent : currentEvent
          );
        }

        return [...currentEvents, savedEvent];
      });

      const nextSelectedDate = new Date(savedEvent.eventDate);
      setSelectedDate(nextSelectedDate);
      setCurrentMonth(new Date(nextSelectedDate.getFullYear(), nextSelectedDate.getMonth(), 1));
      setIsModalOpen(false);
    } catch (submitError: any) {
      setError(submitError.message || "Unable to save event");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEvent() {
    if (!editingEventId) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${editingEventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete event");
      }

      setEvents((currentEvents) =>
        currentEvents.filter((currentEvent) => currentEvent.id !== editingEventId)
      );
      setIsModalOpen(false);
    } catch (deleteError: any) {
      setError(deleteError.message || "Unable to delete event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <section className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Scheduling Workspace</p>
              <h1>Calendar</h1>
              <p className={styles.subtitle}>
                See the month at a glance, focus on the selected day, and add or edit events
                without leaving the page.
              </p>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => {
                  setSelectedDate(today);
                  setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                }}
              >
                Today
              </button>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => openCreateModal(selectedDate)}
                disabled={!familyId}
              >
                <Plus size={18} />
                Add event
              </button>
            </div>
          </section>

          {error && <div className={styles.error}>{error}</div>}

          <section className={styles.statsRow}>
            <article className={styles.statBlock}>
              <span className={styles.statLabel}>Active workspace</span>
              <strong>{activeFamily?.name ?? "No workspace selected"}</strong>
              <p>{activeFamily?.elderName ? `Supporting ${activeFamily.elderName}` : "Choose a family workspace to manage events."}</p>
            </article>
            <article className={styles.statBlock}>
              <span className={styles.statLabel}>This month</span>
              <strong>{monthEvents.length} events</strong>
              <p>{getMonthLabel(currentMonth)}</p>
            </article>
            <article className={styles.statBlock}>
              <span className={styles.statLabel}>Selected day</span>
              <strong>{selectedEvents.length} scheduled</strong>
              <p>{formatSelectedDate(selectedDate)}</p>
            </article>
            <article className={styles.statBlock}>
              <span className={styles.statLabel}>Next 7 days</span>
              <strong>{nextSevenDayCount} upcoming</strong>
              <p>Filtered by your current search and type view.</p>
            </article>
          </section>

          <section className={styles.controlsRow}>
            <div className={styles.workspaceControl}>
              <label htmlFor="family-select">Workspace</label>
              <select
                id="family-select"
                value={familyId}
                onChange={(event) => setFamilyId(event.target.value)}
              >
                {families.length === 0 ? (
                  <option value="">No family workspaces available</option>
                ) : (
                  families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className={styles.searchControl}>
              <Search size={18} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, descriptions, or locations"
              />
            </div>
          </section>

          <div className={styles.filterRow}>
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`${styles.filterChip} ${
                  activeFilter === filter ? styles.filterChipActive : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === "ALL" ? "All types" : EVENT_TYPE_META[filter].label}
              </button>
            ))}
          </div>

          <section className={styles.workspace}>
            <div className={styles.calendarPane}>
              <div className={styles.monthHeader}>
                <div>
                  <h2>{getMonthLabel(currentMonth)}</h2>
                  <p>Click a day to focus, then add or edit events from the side panel.</p>
                </div>
                <div className={styles.monthActions}>
                  <button
                    type="button"
                    className={styles.iconAction}
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                      )
                    }
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconAction}
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                      )
                    }
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.weekdayRow}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className={styles.dayGrid}>
                {calendarDays.map((date) => {
                  const dayEvents = eventsForDate(date);
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isSameDay(date, today);

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      className={`${styles.dayCell} ${
                        isCurrentMonth ? "" : styles.dayCellMuted
                      } ${isSelected ? styles.dayCellSelected : ""} ${
                        isTodayDate ? styles.dayCellToday : ""
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={styles.dayCellTop}>
                        <span className={styles.dayNumber}>{formatDayNumber(date)}</span>
                        {dayEvents.length > 0 && (
                          <span className={styles.dayCount}>{dayEvents.length}</span>
                        )}
                      </div>

                      <div className={styles.dayPreviewList}>
                        {dayEvents.slice(0, 2).map((event) => (
                          <span
                            key={event.id}
                            className={styles.dayPreview}
                            style={{
                              backgroundColor: EVENT_TYPE_META[event.type].soft,
                              color: EVENT_TYPE_META[event.type].accent,
                            }}
                          >
                            {formatEventTime(event.eventDate)} {event.title}
                          </span>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className={styles.moreEvents}>+{dayEvents.length - 2} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className={styles.sidePane}>
              <section className={styles.inspectorBlock}>
                <div className={styles.inspectorHeader}>
                  <div>
                    <p className={styles.inspectorLabel}>Selected Day</p>
                    <h2>{formatSelectedDate(selectedDate)}</h2>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => openCreateModal(selectedDate)}
                    disabled={!familyId}
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>

                {loading ? (
                  <div className={styles.emptyState}>
                    <p>Loading events...</p>
                  </div>
                ) : selectedEvents.length === 0 ? (
                  <div className={styles.emptyState}>
                    <CalendarDays size={28} />
                    <h3>No events for this day</h3>
                    <p>Use the add button to drop in an appointment, visit, meal delivery, or reminder.</p>
                  </div>
                ) : (
                  <div className={styles.eventList}>
                    {selectedEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className={styles.eventRow}
                        onClick={() => openEditModal(event)}
                      >
                        <div
                          className={styles.eventAccent}
                          style={{ backgroundColor: EVENT_TYPE_META[event.type].accent }}
                        />
                        <div className={styles.eventBody}>
                          <div className={styles.eventTopLine}>
                            <span
                              className={styles.eventType}
                              style={{
                                backgroundColor: EVENT_TYPE_META[event.type].soft,
                                color: EVENT_TYPE_META[event.type].accent,
                              }}
                            >
                              {EVENT_TYPE_META[event.type].label}
                            </span>
                            <span className={styles.eventTime}>
                              <Clock3 size={14} />
                              {formatEventTime(event.eventDate)}
                            </span>
                          </div>
                          <h3>{event.title}</h3>
                          {event.location && (
                            <p className={styles.metaLine}>
                              <MapPin size={14} />
                              {event.location}
                            </p>
                          )}
                          {event.description && <p className={styles.eventDescription}>{event.description}</p>}
                        </div>
                        <Pencil size={16} className={styles.eventEditIcon} />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.inspectorBlock}>
                <div className={styles.inspectorHeader}>
                  <div>
                    <p className={styles.inspectorLabel}>Upcoming</p>
                    <h2>What&apos;s next</h2>
                  </div>
                </div>

                {upcomingEvents.length === 0 ? (
                  <div className={styles.emptyStateCompact}>
                    <p>No upcoming events match the current view.</p>
                  </div>
                ) : (
                  <div className={styles.upcomingList}>
                    {upcomingEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className={styles.upcomingRow}
                        onClick={() => {
                          const date = new Date(event.eventDate);
                          setSelectedDate(date);
                          setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                        }}
                      >
                        <span
                          className={styles.upcomingDate}
                          style={{ color: EVENT_TYPE_META[event.type].accent }}
                        >
                          {new Date(event.eventDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div>
                          <strong>{event.title}</strong>
                          <p>{EVENT_TYPE_META[event.type].label}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </section>
        </main>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.inspectorLabel}>
                  {editingEventId ? "Edit Event" : "Add Event"}
                </p>
                <h2>{editingEventId ? "Update this event" : "Add something to the calendar"}</h2>
              </div>
              <button
                type="button"
                className={styles.iconAction}
                onClick={() => setIsModalOpen(false)}
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmitEvent}>
              <div className={styles.formGroup}>
                <label htmlFor="event-title">Title</label>
                <input
                  id="event-title"
                  type="text"
                  value={eventForm.title}
                  onChange={(event) =>
                    setEventForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Doctor appointment, family dinner, delivery window..."
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="event-type">Type</label>
                  <select
                    id="event-type"
                    value={eventForm.type}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        type: event.target.value as DbEventType,
                      }))
                    }
                  >
                    {Object.entries(EVENT_TYPE_META).map(([value, meta]) => (
                      <option key={value} value={value}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="event-location">Location</label>
                  <input
                    id="event-location"
                    type="text"
                    value={eventForm.location}
                    onChange={(event) =>
                      setEventForm((current) => ({ ...current, location: event.target.value }))
                    }
                    placeholder="Clinic, home, dining room..."
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="event-date">Date</label>
                  <input
                    id="event-date"
                    type="date"
                    value={eventForm.date}
                    onChange={(event) =>
                      setEventForm((current) => ({ ...current, date: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="event-time">Time</label>
                  <input
                    id="event-time"
                    type="time"
                    value={eventForm.time}
                    onChange={(event) =>
                      setEventForm((current) => ({ ...current, time: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="event-description">Description</label>
                <textarea
                  id="event-description"
                  value={eventForm.description}
                  onChange={(event) =>
                    setEventForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={4}
                  placeholder="Add notes, prep details, what to bring, or who is involved."
                />
              </div>

              <div className={styles.modalActions}>
                {editingEventId ? (
                  <button
                    type="button"
                    className={styles.deleteAction}
                    onClick={handleDeleteEvent}
                    disabled={saving}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                ) : (
                  <span />
                )}

                <div className={styles.modalActionGroup}>
                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => setIsModalOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryAction} disabled={saving}>
                    {saving ? "Saving..." : editingEventId ? "Save changes" : "Add event"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
