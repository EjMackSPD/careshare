'use client'

import Link from 'next/link'
import styles from './Widget.module.css'

type CarePlanWidgetProps = {
  careLevel?: string | null
  careLevelDescription?: string | null
  estimatedCostMin?: number | null
  estimatedCostMax?: number | null
}

const CARE_LEVEL_LABELS: Record<string, string> = {
  LOW: 'Low',
  MODERATE: 'Moderate',
  HIGH: 'High',
  INTENSIVE: 'Intensive',
}

export default function CarePlanWidget({
  careLevel,
  careLevelDescription,
  estimatedCostMin,
  estimatedCostMax,
}: CarePlanWidgetProps) {
  const hasEstimate = estimatedCostMin != null || estimatedCostMax != null

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Care Planning & Forecasting</h3>
        <Link href="/dashboard/care-plan" className={styles.addButton}>Edit Plan</Link>
      </div>

      <div className={styles.widgetContent}>
        {careLevel ? (
          <div className={styles.carePlanSummary}>
            <div className={styles.carePlanLevelRow}>
              <span>Care Level</span>
              <strong className={styles.carePlanLevelBadge}>
                {CARE_LEVEL_LABELS[careLevel] ?? careLevel}
              </strong>
            </div>
            {hasEstimate && (
              <div className={styles.carePlanLevelRow}>
                <span>Estimated Monthly Cost</span>
                <strong>
                  {estimatedCostMin != null && estimatedCostMax != null
                    ? `$${estimatedCostMin.toLocaleString()} – $${estimatedCostMax.toLocaleString()}`
                    : `$${(estimatedCostMin ?? estimatedCostMax ?? 0).toLocaleString()}`}
                </strong>
              </div>
            )}
            {careLevelDescription && (
              <p className={styles.carePlanNotes}>{careLevelDescription}</p>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No care plan has been created yet.</p>
          </div>
        )}
        <Link href="/dashboard/care-plan" className={styles.viewAllLink}>
          View full care plan
        </Link>
      </div>
    </div>
  )
}
