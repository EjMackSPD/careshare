import Link from "next/link"
import styles from "../success.module.css"

export default function PartnerCompletePage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>Care Center Intake</span>
        <h1>Partnership request received</h1>
        <p>
          Your care center details are saved. The next step is a tailored follow-up for
          demos, family communication workflows, or rollout planning.
        </p>

        <div className={styles.actions}>
          <Link href="/contact" className={styles.primaryAction}>
            Contact CareShare
          </Link>
          <Link href="/features" className={styles.secondaryAction}>
            Review product features
          </Link>
        </div>
      </section>
    </main>
  )
}
