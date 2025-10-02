'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  members: Array<{
    user: {
      id: string
      name: string
      email: string
    }
    role: string
  }>
}

type Event = {
  id: string
  title: string
  eventDate: string
  type: string
}

type Cost = {
  id: string
  description: string
  amount: number
  status: string
}

export default function FamilyDetail() {
  const params = useParams()
  const router = useRouter()
  const familyId = params.familyId as string
  const [family, setFamily] = useState<Family | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAllData()
  }, [familyId])

  const fetchAllData = async () => {
    try {
      // Fetch family
      const familiesResponse = await fetch('/api/families')
      if (!familiesResponse.ok) throw new Error('Failed to fetch families')
      
      const families = await familiesResponse.json()
      const currentFamily = families.find((f: Family) => f.id === familyId)
      
      if (!currentFamily) {
        setError('Family not found')
        setLoading(false)
        return
      }
      
      setFamily(currentFamily)

      // Fetch events
      const eventsResponse = await fetch(`/api/families/${familyId}/events`)
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData)
      }

      // Fetch costs
      const costsResponse = await fetch(`/api/families/${familyId}/costs`)
      if (costsResponse.ok) {
        const costsData = await costsResponse.json()
        setCosts(costsData)
      }
      
      setLoading(false)
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter(event => new Date(event.eventDate) >= now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 3)
  }

  const getTotalCosts = () => {
    return costs.reduce((sum, cost) => sum + cost.amount, 0)
  }

  const getPendingCosts = () => {
    return costs.filter(cost => cost.status === 'PENDING').length
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
        <Link href="/" className={styles.logo}>
          <Image 
            src="/careshare-logo.png" 
            alt="CareShare Logo" 
            width={180} 
            height={68}
            priority
          />
        </Link>
        <Link href="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1>{family.name}</h1>
              {family.elderName && (
                <p className={styles.elderName}>Care for: {family.elderName}</p>
              )}
              {family.description && (
                <p className={styles.description}>{family.description}</p>
              )}
            </div>
            <Link href={`/family/${familyId}/settings`} className={styles.settingsBtn}>
              ⚙️ Settings
            </Link>
          </div>
        </div>

        {/* Care Recipient Info Card */}
        {(family.elderPhone || family.elderAddress || family.emergencyContact) && (
          <div className={styles.careRecipientCard}>
            <h3>📋 Care Recipient Information</h3>
            <div className={styles.infoGrid}>
              {family.elderPhone && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>📞 Phone:</span>
                  <a href={`tel:${family.elderPhone}`} className={styles.infoValue}>
                    {family.elderPhone}
                  </a>
                </div>
              )}
              {family.elderAddress && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>📍 Address:</span>
                  <span className={styles.infoValue}>{family.elderAddress}</span>
                </div>
              )}
              {family.elderBirthday && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>🎂 Birthday:</span>
                  <span className={styles.infoValue}>
                    {new Date(family.elderBirthday).toLocaleDateString()}
                  </span>
                </div>
              )}
              {family.emergencyContact && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>🚨 Emergency Contact:</span>
                  <span className={styles.infoValue}>{family.emergencyContact}</span>
                </div>
              )}
              {family.medicalNotes && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>💊 Medical Notes:</span>
                  <span className={styles.infoValue}>{family.medicalNotes}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.content}>
          {/* Summary Cards */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>👥</div>
              <div className={styles.summaryInfo}>
                <h3>{family.members.length}</h3>
                <p>Family Members</p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>📅</div>
              <div className={styles.summaryInfo}>
                <h3>{getUpcomingEvents().length}</h3>
                <p>Upcoming Events</p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>💰</div>
              <div className={styles.summaryInfo}>
                <h3>${getTotalCosts().toFixed(2)}</h3>
                <p>Total Costs</p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>⏳</div>
              <div className={styles.summaryInfo}>
                <h3>{getPendingCosts()}</h3>
                <p>Pending Payments</p>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Upcoming Events</h2>
              <Link href={`/family/${familyId}/events`} className={styles.viewAllLink}>
                View All →
              </Link>
            </div>
            {getUpcomingEvents().length === 0 ? (
              <p className={styles.emptyState}>No upcoming events scheduled</p>
            ) : (
              <div className={styles.eventsList}>
                {getUpcomingEvents().map((event) => (
                  <div key={event.id} className={styles.eventItem}>
                    <div className={styles.eventDate}>
                      <span className={styles.eventMonth}>
                        {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className={styles.eventDay}>
                        {new Date(event.eventDate).getDate()}
                      </span>
                    </div>
                    <div className={styles.eventDetails}>
                      <h4>{event.title}</h4>
                      <p>{event.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Costs */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Recent Costs</h2>
              <Link href={`/family/${familyId}/costs`} className={styles.viewAllLink}>
                View All →
              </Link>
            </div>
            {costs.length === 0 ? (
              <p className={styles.emptyState}>No costs recorded yet</p>
            ) : (
              <div className={styles.costsList}>
                {costs.slice(0, 3).map((cost) => (
                  <div key={cost.id} className={styles.costItem}>
                    <div className={styles.costInfo}>
                      <h4>{cost.description}</h4>
                      <span className={`${styles.costStatus} ${styles[cost.status.toLowerCase()]}`}>
                        {cost.status}
                      </span>
                    </div>
                    <div className={styles.costAmount}>${cost.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Family Members */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Family Members</h2>
              <Link href={`/family/${familyId}/members`} className={styles.viewAllLink}>
                Manage →
              </Link>
            </div>
            <div className={styles.membersList}>
              {family.members.map((member) => (
                <div key={member.user.id} className={styles.memberCard}>
                  <div className={styles.memberAvatar}>
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.memberInfo}>
                    <h3>{member.user.name}</h3>
                    <p>{member.user.email}</p>
                  </div>
                  <span className={styles.memberRole}>{member.role}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

