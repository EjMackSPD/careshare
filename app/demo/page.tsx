import Link from 'next/link'
import styles from './page.module.css'

export default function Demo() {
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
          <h1>See CareShare in action</h1>
          <p>Watch how families use CareShare to coordinate care effortlessly</p>
        </section>

        <section className={styles.demoSection}>
          <div className={styles.demoCard}>
            <h2>Step 1: Create Your Family Group</h2>
            <div className={styles.demoImage}>
              <div className={styles.placeholder}>
                <span>👨‍👩‍👧‍👦</span>
                <p>Family Group Creation</p>
              </div>
            </div>
            <p className={styles.demoDescription}>
              Set up your family group in seconds. Add the name of your loved one, 
              and invite family members by email. Everyone gets instant access.
            </p>
          </div>

          <div className={styles.demoCard}>
            <h2>Step 2: Share Costs & Bills</h2>
            <div className={styles.demoImage}>
              <div className={styles.placeholder}>
                <span>💰</span>
                <p>Cost Dashboard</p>
              </div>
            </div>
            <p className={styles.demoDescription}>
              Add expenses like medical bills, groceries, or care services. 
              Assign who pays what, set due dates, and track contributions in real-time.
            </p>
          </div>

          <div className={styles.demoCard}>
            <h2>Step 3: Plan Events Together</h2>
            <div className={styles.demoImage}>
              <div className={styles.placeholder}>
                <span>📅</span>
                <p>Event Calendar</p>
              </div>
            </div>
            <p className={styles.demoDescription}>
              Schedule doctor appointments, plan birthday celebrations, coordinate 
              food deliveries, and organize visits. Everyone stays in the loop.
            </p>
          </div>

          <div className={styles.demoCard}>
            <h2>Step 4: Stay Connected</h2>
            <div className={styles.demoImage}>
              <div className={styles.placeholder}>
                <span>📱</span>
                <p>Family Dashboard</p>
              </div>
            </div>
            <p className={styles.demoDescription}>
              Your dashboard shows upcoming events, pending costs, and family activity. 
              Get notifications so you never miss important updates.
            </p>
          </div>
        </section>

        <section className={styles.testimonial}>
          <blockquote>
            "CareShare has been a game-changer for our family. We used to struggle 
            with coordinating care for Mom, but now everything is organized and transparent. 
            Best of all, it brought us closer together."
          </blockquote>
          <p className={styles.testimonialAuthor}>— Sarah M., Family Organizer</p>
        </section>

        <section className={styles.cta}>
          <h2>Ready to try CareShare?</h2>
          <p>Join hundreds of families caring better, together.</p>
          <div className={styles.ctaButtons}>
            <Link href="/signup" className={styles.primaryBtn}>
              Start Free
            </Link>
            <Link href="/features" className={styles.secondaryBtn}>
              View All Features
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 CareShare. All rights reserved.</p>
      </footer>
    </div>
  )
}

