'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Lightbulb, Loader2, Plus, Sparkles } from 'lucide-react'
import type { AssistantRecommendation, AssistantSuggestedTask } from '@/types/assistant'
import styles from './CareConciergeHighlightWidget.module.css'

type CareConciergeHighlightWidgetProps = {
  familyId: string
}

function recommendationIcon(type: AssistantRecommendation['type']) {
  if (type === 'watchout') return AlertTriangle
  if (type === 'insight') return Sparkles
  return Lightbulb
}

export default function CareConciergeHighlightWidget({
  familyId,
}: CareConciergeHighlightWidgetProps) {
  const [recommendations, setRecommendations] = useState<AssistantRecommendation[]>([])
  const [suggestedTask, setSuggestedTask] = useState<AssistantSuggestedTask | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchHighlight() {
      try {
        const res = await fetch(`/api/families/${familyId}/highlight`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setRecommendations(data.recommendations || [])
        setSuggestedTask(data.suggestedTask || null)
      } catch {
        // Leave the widget in its empty state; the full concierge page still works.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchHighlight()
    return () => {
      cancelled = true
    }
  }, [familyId])

  async function handleAdd() {
    if (!familyId || !suggestedTask || adding) return
    setAdding(true)
    try {
      const res = await fetch(`/api/families/${familyId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: suggestedTask.title,
          description: suggestedTask.reason,
          priority: suggestedTask.priority,
          status: 'TODO',
          assignedMembers: [],
          dueDate: null,
        }),
      })
      if (res.ok) setAdded(true)
    } finally {
      setAdding(false)
    }
  }

  const hasContent = recommendations.length > 0 || suggestedTask

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Sparkles size={18} />
          <h3>Care Concierge Highlights</h3>
        </div>
        <Link href="/dashboard/care-concierge" className={styles.viewLink}>
          Full concierge →
        </Link>
      </div>

      {loading ? (
        <p className={styles.emptyText}>
          <Loader2 size={14} className={styles.loadingSpinner} /> Reviewing recent care
          activity…
        </p>
      ) : !hasContent ? (
        <p className={styles.emptyText}>
          No highlights yet — check back once there&apos;s more care activity to review.
        </p>
      ) : (
        <div className={styles.content}>
          {recommendations.length > 0 && (
            <ul className={styles.recommendationList}>
              {recommendations.map((rec) => {
                const Icon = recommendationIcon(rec.type)
                return (
                  <li key={rec.title} className={styles.recommendationItem}>
                    <Icon size={16} className={styles.recommendationIcon} />
                    <div>
                      <strong>{rec.title}</strong>
                      <p className={styles.recommendationDetail}>{rec.detail}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {suggestedTask && (
            <div className={styles.suggestedTask}>
              <div className={styles.suggestedTaskText}>
                <strong>{suggestedTask.title}</strong>
                <p className={styles.suggestedTaskReason}>{suggestedTask.reason}</p>
              </div>
              <button
                type="button"
                className={styles.addTaskBtn}
                onClick={handleAdd}
                disabled={added || adding || !familyId}
              >
                <Plus size={14} />
                {added ? 'Added' : adding ? 'Adding…' : 'Add'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
