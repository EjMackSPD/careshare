import Link from 'next/link'
import { CheckCircle2, ClipboardCheck, ArrowRight } from 'lucide-react'
import type { CarePlanCompleteness } from '@/lib/care-plan-completeness'
import styles from './CarePlanStatusBar.module.css'

export default function CarePlanStatusBar({
  completeness,
}: {
  completeness: CarePlanCompleteness
}) {
  const { percent, completedCount, totalCount, nextStep } = completeness
  const isComplete = !nextStep

  return (
    <div className={styles.bar}>
      <div className={styles.icon}>
        {isComplete ? <CheckCircle2 size={20} /> : <ClipboardCheck size={20} />}
      </div>

      <div className={styles.info}>
        <div className={styles.labelRow}>
          <strong>Care Plan {percent}% complete</strong>
          <span className={styles.count}>
            {completedCount} of {totalCount} steps
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${percent}%` }} />
        </div>
      </div>

      {nextStep ? (
        <Link href={nextStep.href} className={styles.nextStepBtn}>
          {nextStep.label}
          <ArrowRight size={15} />
        </Link>
      ) : (
        <Link href="/dashboard/care-plan" className={styles.nextStepBtn}>
          Review care plan
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  )
}
