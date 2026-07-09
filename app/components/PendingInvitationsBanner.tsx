"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import styles from "./PendingInvitationsBanner.module.css"

export type PendingInvitation = {
  id: string
  role: string
  message: string | null
  familyName: string
  elderName: string | null
  inviterName: string | null
}

export default function PendingInvitationsBanner({
  invitations,
}: {
  invitations: PendingInvitation[]
}) {
  const router = useRouter()
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (invitations.length === 0) {
    return null
  }

  async function respond(invitationId: string, action: "accept" | "decline") {
    setPendingAction(invitationId)
    setError(null)

    try {
      const response = await fetch(`/api/invitations/${invitationId}/${action}`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Something went wrong")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <section className={styles.banner} aria-labelledby="pending-invitations-heading">
      <div className={styles.header}>
        <h2 id="pending-invitations-heading">
          {invitations.length === 1 ? "You have a pending invitation" : "You have pending invitations"}
        </h2>
        <p>Join a care circle to start coordinating with the family.</p>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.list}>
        {invitations.map((invitation) => (
          <div key={invitation.id} className={styles.card}>
            <div className={styles.cardBody}>
              <strong className={styles.familyName}>{invitation.familyName}</strong>
              <p className={styles.meta}>
                {invitation.inviterName ? `Invited by ${invitation.inviterName} · ` : ""}
                Role: {invitation.role.replace(/_/g, " ").toLowerCase()}
              </p>
              {invitation.message && <p className={styles.message}>&ldquo;{invitation.message}&rdquo;</p>}
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.acceptButton}
                disabled={pendingAction === invitation.id}
                onClick={() => respond(invitation.id, "accept")}
              >
                Accept
              </button>
              <button
                type="button"
                className={styles.declineButton}
                disabled={pendingAction === invitation.id}
                onClick={() => respond(invitation.id, "decline")}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
