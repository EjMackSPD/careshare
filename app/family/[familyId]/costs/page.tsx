'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

type Cost = {
  id: string
  description: string
  amount: number
  status: string
  dueDate: string | null
  assignedUser: {
    id: string
    name: string
    email: string
  } | null
}

export default function FamilyCosts() {
  const params = useParams()
  const familyId = params.familyId as string
  const [costs, setCosts] = useState<Cost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    status: 'PENDING',
    dueDate: '',
  })

  useEffect(() => {
    fetchCosts()
  }, [familyId])

  const fetchCosts = async () => {
    try {
      const response = await fetch(`/api/families/${familyId}/costs`)
      if (response.ok) {
        const data = await response.json()
        setCosts(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching costs:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/families/${familyId}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      if (response.ok) {
        fetchCosts()
        setShowForm(false)
        setFormData({
          description: '',
          amount: '',
          status: 'PENDING',
          dueDate: '',
        })
      }
    } catch (error) {
      console.error('Error creating cost:', error)
    }
  }

  const getTotalAmount = () => {
    return costs.reduce((sum, cost) => sum + cost.amount, 0)
  }

  const getPendingAmount = () => {
    return costs
      .filter((cost) => cost.status === 'PENDING')
      .reduce((sum, cost) => sum + cost.amount, 0)
  }

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.logo}>CareShare</Link>
        <Link href={`/family/${familyId}`} className={styles.backLink}>← Back to Family</Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Shared Costs</h1>
          <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Cost'}
          </button>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <h3>Total Costs</h3>
            <p className={styles.amount}>${getTotalAmount().toFixed(2)}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Pending</h3>
            <p className={styles.amount}>${getPendingAmount().toFixed(2)}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Paid</h3>
            <p className={styles.amount}>${(getTotalAmount() - getPendingAmount()).toFixed(2)}</p>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Description *</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="e.g., Medical supplies"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>Add Cost</button>
          </form>
        )}

        {loading ? (
          <div className={styles.loading}>Loading costs...</div>
        ) : costs.length === 0 ? (
          <div className={styles.empty}>
            <p>No costs recorded yet. Add your first cost to get started!</p>
          </div>
        ) : (
          <div className={styles.costsList}>
            {costs.map((cost) => (
              <div key={cost.id} className={styles.costCard}>
                <div className={styles.costHeader}>
                  <h3>{cost.description}</h3>
                  <span className={`${styles.status} ${styles[cost.status.toLowerCase()]}`}>
                    {cost.status}
                  </span>
                </div>
                <p className={styles.costAmount}>${cost.amount.toFixed(2)}</p>
                {cost.dueDate && (
                  <p className={styles.dueDate}>
                    Due: {new Date(cost.dueDate).toLocaleDateString()}
                  </p>
                )}
                {cost.assignedUser && (
                  <p className={styles.assigned}>Assigned to: {cost.assignedUser.name}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

