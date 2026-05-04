'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import styles from './page.module.css'

export default function CreateFamily() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    elderName: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create family')
      }

      const family = await response.json()
      router.push(`/family/${family.id}`)
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Navigation backLink={{ href: '/dashboard', label: 'Back to Dashboard' }} />

      <main className={styles.main}>
        <div className={styles.formContainer}>
          <h1>Create Family Group</h1>
          <p className={styles.subtitle}>
            Start coordinating care with your family members
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>{error}</div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="name">Family Group Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Smith Family Care Group"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="elderName">Care Recipient Name</label>
              <input
                id="elderName"
                name="elderName"
                type="text"
                value={formData.elderName}
                onChange={handleChange}
                placeholder="e.g., Grandma Mary"
              />
              <small>Who are you coordinating care for?</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Brief description of your care coordination needs..."
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Family Group'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

