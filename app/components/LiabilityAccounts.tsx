'use client'

import { useState } from 'react'
import { AlertCircle, Landmark, Link2 } from 'lucide-react'
import styles from './LiabilityAccounts.module.css'

type LiabilityAccount = {
  id: string
  name: string | null
  mask: string | null
  liabilityType: string | null
  status: string | null
  balanceCurrent: number | null
  lastSyncedAt: string
}

export default function LiabilityAccounts({
  familyId,
  careRecipientName,
  configured,
  accounts,
}: {
  familyId: string | null
  careRecipientName: string | null
  configured: boolean
  accounts: LiabilityAccount[]
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState(careRecipientName?.split(' ')[0] || '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [linking, setLinking] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [list, setList] = useState<LiabilityAccount[]>(accounts)

  async function linkAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!familyId) return

    setLinking(true)
    setFeedback(null)

    try {
      const response = await fetch(`/api/families/${familyId}/liabilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link accounts')
      }

      setList((current) => [...data.accounts, ...current])
      setFeedback({
        type: 'success',
        text: data.accounts.length
          ? `Linked ${data.accounts.length} account${data.accounts.length === 1 ? '' : 's'}.`
          : 'No liability accounts were found for this person.',
      })
      setFormOpen(false)
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to link accounts',
      })
    } finally {
      setLinking(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Liability Accounts</h1>
              <p className={styles.subtitle}>
                Link a family member&apos;s loans and debts to keep everyone informed for financial planning
              </p>
            </div>
          </div>

          {!configured && (
            <div className={styles.notConfigured}>
              <AlertCircle size={20} />
              <p>
                Account linking isn&apos;t set up yet. A Method Financial API key needs to be
                configured before liability accounts can be linked.
              </p>
            </div>
          )}

          {configured && (
            <>
              {formOpen ? (
                <form className={styles.linkForm} onSubmit={linkAccount}>
                  <div className={styles.formRow}>
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setFormOpen(false)}
                      disabled={linking}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.confirmBtn} disabled={linking}>
                      {linking ? 'Linking…' : 'Link accounts'}
                    </button>
                  </div>
                </form>
              ) : (
                <button className={styles.linkBtn} onClick={() => setFormOpen(true)}>
                  <Link2 size={16} />
                  Link an account
                </button>
              )}

              {feedback && (
                <p className={feedback.type === 'success' ? styles.successText : styles.errorText}>
                  {feedback.text}
                </p>
              )}

              <section className={styles.listSection}>
                <h2>Linked accounts</h2>
                {list.length === 0 ? (
                  <p className={styles.emptyText}>No liability accounts linked yet.</p>
                ) : (
                  <div className={styles.accountList}>
                    {list.map((account) => (
                      <div key={account.id} className={styles.accountItem}>
                        <Landmark size={20} className={styles.accountIcon} />
                        <div>
                          <strong>{account.name || account.liabilityType || 'Account'}</strong>
                          <span className={styles.accountMeta}>
                            {account.liabilityType ? account.liabilityType.replace(/_/g, ' ') : 'Liability'}
                            {account.mask ? ` •••• ${account.mask}` : ''}
                          </span>
                        </div>
                        {typeof account.balanceCurrent === 'number' && (
                          <span className={styles.balance}>
                            ${account.balanceCurrent.toFixed(2)}
                          </span>
                        )}
                        <span className={`${styles.statusBadge} ${styles[`status_${account.status}`] || ''}`}>
                          {account.status || 'unknown'}
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
