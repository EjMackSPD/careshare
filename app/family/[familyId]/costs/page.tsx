'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import styles from './page.module.css'

type Member = {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
}

type Cost = {
  id: string
  description: string
  amount: number
  status: string
  splitType: string
  dueDate: string | null
  splits?: Array<{
    id: string
    amount: number
    status: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
}

export default function FamilyCosts() {
  const params = useParams()
  const familyId = params.familyId as string
  const [costs, setCosts] = useState<Cost[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [splitType, setSplitType] = useState<'EQUAL' | 'PERCENTAGE' | 'CUSTOM'>('EQUAL')
  const [splits, setSplits] = useState<{ [userId: string]: string }>({})
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    status: 'PENDING',
    dueDate: '',
  })

  useEffect(() => {
    fetchData()
  }, [familyId])

  const fetchData = async () => {
    try {
      // Fetch costs
      const costsResponse = await fetch(`/api/families/${familyId}/costs`)
      if (costsResponse.ok) {
        const costsData = await costsResponse.json()
        setCosts(costsData)
      }

      // Fetch family members
      const familiesResponse = await fetch('/api/families')
      if (familiesResponse.ok) {
        const families = await familiesResponse.json()
        const family = families.find((f: any) => f.id === familyId)
        if (family) {
          setMembers(family.members)
          // Initialize splits with equal distribution
          const initialSplits: { [key: string]: string } = {}
          family.members.forEach((member: Member) => {
            initialSplits[member.user.id] = ''
          })
          setSplits(initialSplits)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const calculateSplits = () => {
    const amount = parseFloat(formData.amount)
    if (!amount || amount <= 0) return {}

    if (splitType === 'EQUAL') {
      const splitAmount = amount / members.length
      const equalSplits: { [key: string]: number } = {}
      members.forEach((member) => {
        equalSplits[member.user.id] = splitAmount
      })
      return equalSplits
    } else if (splitType === 'PERCENTAGE') {
      const percentageSplits: { [key: string]: number } = {}
      members.forEach((member) => {
        const percentage = parseFloat(splits[member.user.id] || '0')
        percentageSplits[member.user.id] = (amount * percentage) / 100
      })
      return percentageSplits
    } else {
      // CUSTOM - dollar amounts
      const customSplits: { [key: string]: number } = {}
      members.forEach((member) => {
        customSplits[member.user.id] = parseFloat(splits[member.user.id] || '0')
      })
      return customSplits
    }
  }

  const getTotalSplit = () => {
    if (splitType === 'EQUAL') {
      return parseFloat(formData.amount) || 0
    }
    const calculatedSplits = calculateSplits()
    return Object.values(calculatedSplits).reduce((sum, val) => sum + val, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(formData.amount)
    const totalSplit = getTotalSplit()
    
    // Validation
    if (Math.abs(totalSplit - amount) > 0.01) {
      alert(`Total split ($${totalSplit.toFixed(2)}) must equal the cost amount ($${amount.toFixed(2)})`)
      return
    }

    try {
      const calculatedSplits = calculateSplits()
      
      const response = await fetch(`/api/families/${familyId}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount,
          splitType,
          splits: calculatedSplits,
        }),
      })

      if (response.ok) {
        fetchData()
        setShowForm(false)
        setSplitType('EQUAL')
        setSplits({})
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
      <Navigation backLink={{ href: `/family/${familyId}`, label: 'Back to Family' }} />

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
                <label>Total Amount *</label>
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
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Split Type *</label>
              <div className={styles.splitTypeButtons}>
                <button
                  type="button"
                  className={`${styles.splitTypeBtn} ${splitType === 'EQUAL' ? styles.active : ''}`}
                  onClick={() => setSplitType('EQUAL')}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  className={`${styles.splitTypeBtn} ${splitType === 'PERCENTAGE' ? styles.active : ''}`}
                  onClick={() => setSplitType('PERCENTAGE')}
                >
                  By Percentage
                </button>
                <button
                  type="button"
                  className={`${styles.splitTypeBtn} ${splitType === 'CUSTOM' ? styles.active : ''}`}
                  onClick={() => setSplitType('CUSTOM')}
                >
                  Custom Amount
                </button>
              </div>
            </div>

            {splitType !== 'EQUAL' && (
              <div className={styles.splitsSection}>
                <h4>Split Among Members</h4>
                {members.map((member) => (
                  <div key={member.user.id} className={styles.splitRow}>
                    <span className={styles.memberName}>{member.user.name}</span>
                    <div className={styles.splitInput}>
                      <input
                        type="number"
                        step={splitType === 'PERCENTAGE' ? '0.1' : '0.01'}
                        value={splits[member.user.id] || ''}
                        onChange={(e) => setSplits({ ...splits, [member.user.id]: e.target.value })}
                        placeholder={splitType === 'PERCENTAGE' ? '0%' : '$0.00'}
                        required
                      />
                      <span className={styles.splitUnit}>
                        {splitType === 'PERCENTAGE' ? '%' : '$'}
                      </span>
                      {splitType === 'CUSTOM' && formData.amount && (
                        <span className={styles.splitCalculated}>
                          = {((parseFloat(splits[member.user.id] || '0') / parseFloat(formData.amount)) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div className={styles.splitTotal}>
                  <strong>Total:</strong>
                  <span className={getTotalSplit() === parseFloat(formData.amount) ? styles.valid : styles.invalid}>
                    ${getTotalSplit().toFixed(2)} / ${parseFloat(formData.amount || '0').toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {splitType === 'EQUAL' && members.length > 0 && formData.amount && (
              <div className={styles.equalSplitPreview}>
                <p>Each of {members.length} members will pay: <strong>${(parseFloat(formData.amount) / members.length).toFixed(2)}</strong></p>
              </div>
            )}

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
                  <div>
                    <h3>{cost.description}</h3>
                    {cost.splitType && (
                      <span className={styles.splitBadge}>{cost.splitType.replace('_', ' ')}</span>
                    )}
                  </div>
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
                
                {cost.splits && cost.splits.length > 0 && (
                  <div className={styles.splitsBreakdown}>
                    <h4>Split Breakdown:</h4>
                    <div className={styles.splitsList}>
                      {cost.splits.map((split) => (
                        <div key={split.id} className={styles.splitItem}>
                          <span className={styles.splitMember}>{split.user.name}</span>
                          <div className={styles.splitDetails}>
                            <span className={styles.splitAmount}>${split.amount.toFixed(2)}</span>
                            <span className={`${styles.splitStatus} ${styles[split.status.toLowerCase()]}`}>
                              {split.status === 'PAID' ? '✓' : '○'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

