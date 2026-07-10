'use client'

import Link from 'next/link'
import styles from './Widget.module.css'

type Member = {
  id: string
  name: string
  role: string
}

type FamilyMessage = {
  id: string
  authorName: string
  message: string
  createdAt: string
}

type CollaborationWidgetProps = {
  familyId?: string
  members?: Member[]
  messages?: FamilyMessage[]
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function CollaborationWidget({
  familyId,
  members = [],
  messages = [],
}: CollaborationWidgetProps) {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Family Collaboration</h3>
      </div>

      <div className={styles.widgetContent}>
        <div className={styles.section}>
          <strong>Caregiving Team ({members.length})</strong>
          {members.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No family members added yet.</p>
            </div>
          ) : (
            <ul className={styles.membersList}>
              {members.slice(0, 4).map((member) => (
                <li key={member.id} className={styles.memberItem}>
                  <span className={styles.memberAvatar}>
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.memberName}>{member.name}</span>
                  <span className={styles.memberRole}>{formatRole(member.role)}</span>
                </li>
              ))}
            </ul>
          )}
          {familyId && (
            <Link href={`/family/${familyId}/members`} className={styles.emptyButton}>
              👥 Invite Family Member
            </Link>
          )}
        </div>

        <div className={styles.section}>
          <strong>Recent Messages</strong>
          {messages.length === 0 ? (
            <p className={styles.emptyText}>No messages yet.</p>
          ) : (
            <ul className={styles.messagesList}>
              {messages.slice(0, 3).map((message) => (
                <li key={message.id} className={styles.messageItem}>
                  <span className={styles.messageAuthor}>{message.authorName}</span>
                  <p className={styles.messageBody}>{message.message}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/family-collaboration" className={styles.viewAllLink}>
            View all messages
          </Link>
        </div>
      </div>
    </div>
  )
}
