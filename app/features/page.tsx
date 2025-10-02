import Link from 'next/link'
import styles from './page.module.css'

export default function Features() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>CareShare</Link>
        <div className={styles.navLinks}>
          <Link href="/features">Features</Link>
          <Link href="/demo">Demo</Link>
          <Link href="/login">Login</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <section className={styles.header}>
          <h1>Everything you need to coordinate care</h1>
          <p>CareShare brings families together with powerful, easy-to-use tools</p>
        </section>

        <section className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureContent}>
              <h2>💰 Cost Management</h2>
              <p className={styles.featureDescription}>
                Track all expenses related to care in one place. Split bills fairly, 
                see who's contributed what, and assign payment responsibilities.
              </p>
              <ul className={styles.featureList}>
                <li>Track all family contributions</li>
                <li>Split bills automatically or manually</li>
                <li>Set payment reminders and due dates</li>
                <li>View payment history and reports</li>
                <li>Export financial summaries</li>
              </ul>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureContent}>
              <h2>📅 Event Planning</h2>
              <p className={styles.featureDescription}>
                Never miss an important date. Plan birthdays, schedule appointments, 
                coordinate food deliveries, and organize family visits.
              </p>
              <ul className={styles.featureList}>
                <li>Shared family calendar</li>
                <li>Birthday and celebration planning</li>
                <li>Medical appointment tracking</li>
                <li>Food delivery coordination</li>
                <li>Automated reminders</li>
              </ul>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureContent}>
              <h2>👨‍👩‍👧‍👦 Family Coordination</h2>
              <p className={styles.featureDescription}>
                Bring the whole family together. Create a family group, invite members, 
                and ensure everyone knows what's happening.
              </p>
              <ul className={styles.featureList}>
                <li>Easy family group creation</li>
                <li>Role-based permissions</li>
                <li>Real-time updates for all members</li>
                <li>Task assignment and tracking</li>
                <li>Communication hub</li>
              </ul>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureContent}>
              <h2>🏥 For Care Providers</h2>
              <p className={styles.featureDescription}>
                Nursing homes and care facilities can offer CareShare to families, 
                helping them stay organized and more engaged in their loved one's care.
              </p>
              <ul className={styles.featureList}>
                <li>Admin dashboard for providers</li>
                <li>Manage multiple families</li>
                <li>Engagement analytics</li>
                <li>Family support tools</li>
                <li>White-label options available</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <h2>Ready to bring your family together?</h2>
          <Link href="/signup" className={styles.ctaButton}>
            Get Started Free
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 CareShare. All rights reserved.</p>
      </footer>
    </div>
  )
}

