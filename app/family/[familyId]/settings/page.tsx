'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

type Family = {
  id: string
  name: string
  elderName: string | null
  elderPhone: string | null
  elderAddress: string | null
  elderBirthday: string | null
  emergencyContact: string | null
  medicalNotes: string | null
  description: string | null
}

export default function FamilySettings() {
  const params = useParams()
  const router = useRouter()
  const familyId = params.familyId as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    elderName: '',
    elderPhone: '',
    elderAddress: '',
    elderBirthday: '',
    emergencyContact: '',
    medicalNotes: '',
    description: '',
  })

  useEffect(() => {
    fetchFamily()
  }, [familyId])

  const fetchFamily = async () => {
    try {
      const response = await fetch('/api/families')
      if (response.ok) {
        const families = await response.json()
        const family = families.find((f: Family) => f.id === familyId)
        if (family) {
          setFormData({
            name: family.name || '',
            elderName: family.elderName || '',
            elderPhone: family.elderPhone || '',
            elderAddress: family.elderAddress || '',
            elderBirthday: family.elderBirthday ? new Date(family.elderBirthday).toISOString().split('T')[0] : '',
            emergencyContact: family.emergencyContact || '',
            medicalNotes: family.medicalNotes || '',
            description: family.description || '',
          })
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching family:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      // TODO: Create a PATCH endpoint for updating family
      const response = await fetch(`/api/families/${familyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage('Settings saved successfully!')
        setTimeout(() => router.push(`/family/${familyId}`), 1500)
      } else {
        setMessage('Failed to save settings')
      }
    } catch (error) {
      setMessage('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.logo}>CareShare</Link>
        <Link href={`/family/${familyId}`} className={styles.backLink}>← Back to Family</Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Family Settings</h1>
          <p>Manage care recipient information and family details</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {message && (
            <div className={`${styles.message} ${message.includes('success') ? styles.success : styles.error}`}>
              {message}
            </div>
          )}

          <section className={styles.section}>
            <h2>Basic Information</h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="name">Family Group Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Smith Family Care Group"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Brief description of your care coordination..."
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2>Care Recipient Details</h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="elderName">Name</label>
              <input
                id="elderName"
                type="text"
                value={formData.elderName}
                onChange={(e) => setFormData({ ...formData, elderName: e.target.value })}
                placeholder="e.g., Grandma Mary"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="elderPhone">Phone Number</label>
                <input
                  id="elderPhone"
                  type="tel"
                  value={formData.elderPhone}
                  onChange={(e) => setFormData({ ...formData, elderPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="elderBirthday">Birthday</label>
                <input
                  id="elderBirthday"
                  type="date"
                  value={formData.elderBirthday}
                  onChange={(e) => setFormData({ ...formData, elderBirthday: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="elderAddress">Address</label>
              <input
                id="elderAddress"
                type="text"
                value={formData.elderAddress}
                onChange={(e) => setFormData({ ...formData, elderAddress: e.target.value })}
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2>Emergency & Medical Information</h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="emergencyContact">Emergency Contact</label>
              <input
                id="emergencyContact"
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Name and phone number of emergency contact"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="medicalNotes">Medical Notes & Allergies</label>
              <textarea
                id="medicalNotes"
                value={formData.medicalNotes}
                onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                rows={4}
                placeholder="List any medications, allergies, medical conditions, or important notes..."
              />
            </div>
          </section>

          <div className={styles.actions}>
            <Link href={`/family/${familyId}`} className={styles.cancelBtn}>
              Cancel
            </Link>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

