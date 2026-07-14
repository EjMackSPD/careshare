"use client"

import { useState } from "react"
import { AlertCircle, Landmark, Repeat, Wallet } from "lucide-react"
import styles from "./AtomicManager.module.css"

type AtomicTaskItem = {
  id: string
  operation: string
  status: string
  companyName: string | null
  distributionType: string | null
  distributionAmount: number | null
  createdAt: string
}

export default function AtomicManager({
  familyId,
  configured,
  initialTasks,
}: {
  familyId: string | null
  configured: boolean
  initialTasks: AtomicTaskItem[]
}) {
  const [tasks, setTasks] = useState<AtomicTaskItem[]>(initialTasks)
  const [launching, setLaunching] = useState<"manage" | "deposit" | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function launch(operation: "manage" | "deposit") {
    if (!familyId || launching) return

    setError(null)
    setLaunching(operation)

    try {
      const tokenRes = await fetch(`/api/families/${familyId}/atomic/access-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation }),
      })

      if (!tokenRes.ok) {
        const data = await tokenRes.json().catch(() => null)
        throw new Error(data?.error || "Failed to start session")
      }

      const { publicToken } = await tokenRes.json()

      const { Atomic } = await import("@atomicfi/transact-javascript")

      Atomic.transact({
        config: {
          publicToken,
          operation,
        },
        onFinish: async (payload: { taskId?: string }) => {
          setLaunching(null)
          if (!payload?.taskId) return

          try {
            const res = await fetch(`/api/families/${familyId}/atomic/tasks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ taskId: payload.taskId, operation }),
            })
            if (res.ok) {
              const task = await res.json()
              setTasks((current) => [task, ...current.filter((t) => t.id !== task.id)])
            }
          } catch (err) {
            console.error("Error recording Atomic task:", err)
          }
        },
        onClose: () => setLaunching(null),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session")
      setLaunching(null)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Bills &amp; Direct Deposit</h1>
              <p className={styles.subtitle}>
                Manage your own subscriptions and bills, or redirect part of your
                paycheck toward shared care costs.
              </p>
            </div>
          </div>

          {!configured && (
            <div className={styles.notConfigured}>
              <AlertCircle size={20} />
              <p>
                Bill and deposit management isn&apos;t set up yet. An AtomicFi API
                key needs to be configured before this feature is available.
              </p>
            </div>
          )}

          {configured && (
            <>
              {error && <p className={styles.errorText}>{error}</p>}

              <div className={styles.actionGrid}>
                <button
                  type="button"
                  className={styles.actionCard}
                  onClick={() => launch("manage")}
                  disabled={!familyId || launching !== null}
                >
                  <Landmark size={22} className={styles.actionIcon} />
                  <strong>Manage a bill or subscription</strong>
                  <span>
                    Connect a subscription, utility, or loan to pause, cancel, or
                    change your plan.
                  </span>
                  {launching === "manage" && <span className={styles.launchingTag}>Opening…</span>}
                </button>

                <button
                  type="button"
                  className={styles.actionCard}
                  onClick={() => launch("deposit")}
                  disabled={!familyId || launching !== null}
                >
                  <Repeat size={22} className={styles.actionIcon} />
                  <strong>Switch my direct deposit</strong>
                  <span>
                    Redirect part of your paycheck to help cover shared care
                    costs.
                  </span>
                  {launching === "deposit" && <span className={styles.launchingTag}>Opening…</span>}
                </button>
              </div>

              <section className={styles.listSection}>
                <h2>Activity</h2>
                {tasks.length === 0 ? (
                  <p className={styles.emptyText}>Nothing here yet.</p>
                ) : (
                  <div className={styles.taskList}>
                    {tasks.map((task) => (
                      <div key={task.id} className={styles.taskItem}>
                        <Wallet size={20} className={styles.taskIcon} />
                        <div className={styles.taskInfo}>
                          <strong>
                            {task.companyName ||
                              (task.operation === "deposit"
                                ? "Direct deposit switch"
                                : "Bill/subscription")}
                          </strong>
                          <span className={styles.taskMeta}>
                            {task.operation === "deposit" ? "Direct deposit" : "Manage"}
                            {" · "}
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`${styles.statusBadge} ${styles[`status_${task.status}`] || ""}`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
