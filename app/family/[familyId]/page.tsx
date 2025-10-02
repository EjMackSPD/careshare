'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

type Family = {
  id: string
  name: string
  elderName: string | null
  description: string | null
  members: Array<{
    user: {
      id: string
      name: string
      email: string
    }
    role: string
  }>
}

export default function FamilyDetail() {
  const params = useParams()
  const router = useRouter()
  const familyId = params.familyId as string
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFamily()
  }, [familyId])

  const fetchFamily = async () => {
    try {
      const response = await fetch('/api/families')
      if (!response.ok) throw new Error('Failed to fetch families')
      
      const families = await response.json()
      const currentFamily = families.find((f: Family) => f.id === familyId)
      
      if (!currentFamily) {
        setError('Family not found')
        setLoading(false)
        return
      }
      
      setFamily(currentFamily)
      setLoading(false)
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (error || !family) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>{error || 'Family not found'}</h2>
          <Link href="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.logo}>CareShare</Link>
        <Link href="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1>{family.name}</h1>
            {family.elderName && (
              <p className={styles.elderName}>Care for: {family.elderName}</p>
            )}
            {family.description && (
              <p className={styles.description}>{family.description}</p>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Family Members</h2>
            <div className={styles.membersList}>
              {family.members.map((member) => (
                <div key={member.user.id} className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <h3>{member.user.name}</h3>
                    <p>{member.user.email}</p>
                  </div>
                  <span className={styles.memberRole}>{member.role}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Quick Actions</h2>
            <div className={styles.actionsGrid}>
              <Link href={`/family/${familyId}/events`} className={styles.actionCard}>
                <span className={styles.actionIcon}>📅</span>
                <h3>Events</h3>
                <p>View and manage upcoming events</p>
              </Link>
              <Link href={`/family/${familyId}/costs`} className={styles.actionCard}>
                <span className={styles.actionIcon}>💰</span>
                <h3>Costs</h3>
                <p>Track shared expenses</p>
              </Link>
              <Link href={`/family/${familyId}/members`} className={styles.actionCard}>
                <span className={styles.actionIcon}>👥</span>
                <h3>Members</h3>
                <p>Manage family members</p>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

