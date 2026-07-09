import Link from "next/link"
import styles from "./AccessibleRecipientView.module.css"

type Member = {
  id: string
  name: string
  role: string
}

type EventItem = {
  id: string
  title: string
  eventDate: string
  location: string | null
}

type TaskItem = {
  id: string
  title: string
  dueDate: string | null
}

type MessageItem = {
  id: string
  text: string
  authorName: string
  createdAt: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(value))
}

function formatRole(role: string) {
  return role.replace(/_/g, " ").toLowerCase()
}

export default function AccessibleRecipientView({
  userName,
  familyName,
  members,
  events,
  tasks,
  messages,
}: {
  userName: string
  familyName: string
  members: Member[]
  events: EventItem[]
  tasks: TaskItem[]
  messages: MessageItem[]
}) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{familyName}</p>
        <h1>Hello, {userName}</h1>
      </header>

      <section className={styles.section} aria-labelledby="care-circle-heading">
        <h2 id="care-circle-heading">Your care circle</h2>
        <ul className={styles.list}>
          {members.map((member) => (
            <li key={member.id} className={styles.listItem}>
              <span className={styles.itemTitle}>{member.name}</span>
              <span className={styles.itemMeta}>{formatRole(member.role)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading">Today &amp; upcoming</h2>
        {events.length === 0 && tasks.length === 0 ? (
          <p className={styles.emptyText}>Nothing coming up right now.</p>
        ) : (
          <ul className={styles.list}>
            {events.map((event) => (
              <li key={event.id} className={styles.listItem}>
                <span className={styles.itemTitle}>{event.title}</span>
                <span className={styles.itemMeta}>
                  {formatDate(event.eventDate)}
                  {event.location ? ` · ${event.location}` : ""}
                </span>
              </li>
            ))}
            {tasks.map((task) => (
              <li key={task.id} className={styles.listItem}>
                <span className={styles.itemTitle}>{task.title}</span>
                <span className={styles.itemMeta}>
                  {task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section} aria-labelledby="messages-heading">
        <h2 id="messages-heading">Recent messages</h2>
        {messages.length === 0 ? (
          <p className={styles.emptyText}>No messages yet.</p>
        ) : (
          <ul className={styles.list}>
            {messages.map((message) => (
              <li key={message.id} className={styles.listItem}>
                <span className={styles.itemTitle}>{message.authorName}</span>
                <p className={styles.messageText}>{message.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/signout" className={styles.signOutButton}>
        Sign out
      </Link>
    </main>
  )
}
