'use client'

import styles from './Widget.module.css'

type CareRecipientWidgetProps = {
  elderName?: string | null
  elderAge?: number
  wellness?: string
  medications?: number
  nextAppointment?: string
}

export default function CareRecipientWidget({ 
  elderName = 'Martha Johnson', 
  elderAge = 78,
  wellness = 'Good',
  medications = 3,
  nextAppointment = '2 days'
}: CareRecipientWidgetProps) {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <div className={styles.careRecipientInfo}>
          <div className={styles.avatar}>
            {elderName?.charAt(0) || 'M'}
          </div>
          <div>
            <h3>{elderName}</h3>
            <p>{elderAge} years old</p>
          </div>
        </div>
      </div>
      
      <div className={styles.widgetContent}>
        <div className={styles.statusBadges}>
          <span className={styles.badge}>Wellness: {wellness}</span>
          <span className={styles.badge}>{medications} Medications Today</span>
          <span className={styles.badge}>Doctor Appt: {nextAppointment}</span>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Recent Notes</strong>
            <p className={styles.emptyText}>No recent notes.</p>
          </div>
          <div className={styles.infoItem}>
            <strong>Last Visit</strong>
            <p className={styles.emptyText}>No recent visits recorded.</p>
          </div>
          <div className={styles.infoItem}>
            <strong>Next Bills Due</strong>
            <p className={styles.emptyText}>No upcoming bills.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

