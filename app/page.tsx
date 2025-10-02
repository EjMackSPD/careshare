import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'
import ImageCarousel from './components/ImageCarousel'
import { Wallet, CalendarDays, Users, Building2 } from 'lucide-react'

export default function Home() {
  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            <Image 
              src="/careshare-logo.png" 
              alt="CareShare Logo" 
              width={200} 
              height={75}
              priority
            />
          </Link>
          <div className={styles.navLinks}>
            <Link href="/features">Features</Link>
            <Link href="/demo">Demo</Link>
            <Link href="/login">Login</Link>
            <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <ImageCarousel />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Caring for loved ones, <span>together</span>
          </h1>
          <p className={styles.heroSubtitle}>
            CareShare helps families coordinate care for elderly relatives. 
            Share costs, organize events, and manage responsibilities—all in one place.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/signup" className={styles.primaryBtn}>
              Get Started Free
            </Link>
            <Link href="/demo" className={styles.secondaryBtn}>
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.benefits}>
        <h2 className={styles.sectionTitle}>Why CareShare?</h2>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Wallet size={48} strokeWidth={1.5} />
            </div>
            <h3>Split Costs Fairly</h3>
            <p>Track expenses and contributions transparently. No more awkward money conversations.</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <CalendarDays size={48} strokeWidth={1.5} />
            </div>
            <h3>Coordinate Events</h3>
            <p>Plan birthdays, appointments, and food deliveries together. Everyone stays in the loop.</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Users size={48} strokeWidth={1.5} />
            </div>
            <h3>Bring Family Together</h3>
            <p>Share the responsibility of care. Everyone contributes in their own way.</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Building2 size={48} strokeWidth={1.5} />
            </div>
            <h3>For Care Providers</h3>
            <p>Nursing homes can offer CareShare to help families stay organized and engaged.</p>
          </div>
        </div>
      </section>

      <section className={styles.demoCta}>
        <div className={styles.demoContent}>
          <div className={styles.demoText}>
            <h2>See CareShare in Action</h2>
            <p>Experience the platform with a fully interactive demo account. No signup required!</p>
            <ul className={styles.demoFeatures}>
              <li>✓ Pre-loaded with realistic caregiving scenarios</li>
              <li>✓ Explore all features and functionality</li>
              <li>✓ See how families coordinate care together</li>
              <li>✓ Test task management, calendars, and finances</li>
            </ul>
          </div>
          <div className={styles.demoAction}>
            <Link href="/login" className={styles.demoBtn}>
              🎭 Try Demo Walkthrough
            </Link>
            <p className={styles.demoNote}>Click "Try Demo Mode" on the login page</p>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Ready to get started?</h2>
        <p>Join families who are caring better, together.</p>
        <Link href="/signup" className={styles.primaryBtn}>
          Create Your Family Group
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div>
            <Image 
              src="/careshare-logo.png" 
              alt="CareShare Logo" 
              width={180} 
              height={68}
              className={styles.footerLogo}
            />
            <p>Coordinating care for those who matter most</p>
          </div>
          <div>
            <Link href="/admin">Care Provider Portal</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2025 CareShare. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
