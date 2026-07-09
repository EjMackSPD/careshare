import Link from "next/link"
import styles from "../success.module.css"

export default function JoinFamilyPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>Family Join Guidance</span>
        <h1>You&apos;re ready to join the care circle</h1>
        <p>
          Your profile is saved. If your family organizer has already invited you, sign in with
          the same email address they used and you&apos;ll see the invitation waiting for you on
          your dashboard, with a button to accept it.
        </p>

        <div className={styles.actions}>
          <Link href="/login" className={styles.primaryAction}>
            Go to login
          </Link>
          <Link href="/contact" className={styles.secondaryAction}>
            Haven&apos;t been invited yet?
          </Link>
        </div>
      </section>
    </main>
  )
}
