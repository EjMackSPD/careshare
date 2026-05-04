import Link from "next/link"
import styles from "../success.module.css"

export default function JoinFamilyPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>Family Join Guidance</span>
        <h1>You&apos;re ready to join the care circle</h1>
        <p>
          Your profile is saved. In this first version, the family organizer still needs to
          invite you into the shared workspace if you do not already have an invite link.
        </p>

        <div className={styles.actions}>
          <Link href="/login" className={styles.primaryAction}>
            Go to login
          </Link>
          <Link href="/contact" className={styles.secondaryAction}>
            Need help joining?
          </Link>
        </div>
      </section>
    </main>
  )
}
