'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Mail, Phone, Calendar, User, Info } from 'lucide-react'
import styles from './page.module.css'

type Member = {
  id: string
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string | null
    email: string
    createdAt: string
  }
}

type Family = {
  id: string
  name: string
  elderName: string | null
}

export default function MemberProfilePage() {
  const params = useParams()
  const familyId = params.familyId as string
  const memberId = params.memberId as string
  const [member, setMember] = useState<Member | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    messagesPosted: 0,
    contributionAmount: 0
  })

  useEffect(() => {
    fetchMemberData()
  }, [familyId, memberId])

  const fetchMemberData = async () => {
    try {
      // Fetch family members
      const membersRes = await fetch(`/api/families/${familyId}/members`)
      if (membersRes.ok) {
        const membersData = await membersRes.json()
        const currentMember = membersData.find((m: Member) => m.userId === memberId)
        setMember(currentMember || null)
      }

      // Fetch family info
      const familiesRes = await fetch('/api/families')
      if (familiesRes.ok) {
        const familiesData = await familiesRes.json()
        const currentFamily = familiesData.families?.find((f: Family) => f.id === familyId)
        setFamily(currentFamily || null)
      }

      // TODO: Fetch member stats (tasks, messages, contributions)
      // For now, using placeholder values
      setStats({
        tasksCompleted: 12,
        messagesPosted: 48,
        contributionAmount: 450.00
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching member data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation showAuthLinks={true} />
        <div className={styles.layout}>
          <LeftNavigation />
          <main className={styles.main}>
            <div className={styles.loading}>Loading...</div>
          </main>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className={styles.container}>
        <Navigation showAuthLinks={true} />
        <div className={styles.layout}>
          <LeftNavigation />
          <main className={styles.main}>
            <div className={styles.error}>
              <h2>Member not found</h2>
              <Link href={`/family/${familyId}`} className={styles.backLink}>
                ← Back to Family
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const isCareManager = member.role === 'CARE_MANAGER'

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <Link href={`/family/${familyId}`} className={styles.backLink}>
              ← Back to {family?.name || 'Family'}
            </Link>
          </div>

          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarLarge}>
                {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
              </div>
              <div className={styles.profileInfo}>
                <h1>{member.user.name || 'Family Member'}</h1>
                <p className={styles.email}>
                  <Mail size={16} />
                  {member.user.email}
                </p>
                <span className={`${styles.roleBadge} ${isCareManager ? styles.careManagerBadge : styles.familyMemberBadge}`}>
                  {isCareManager ? '⭐ Care Manager' : 'Family Member'}
                </span>
              </div>
            </div>

            <div className={styles.profileMeta}>
              <div className={styles.metaItem}>
                <Calendar size={18} />
                <div>
                  <span className={styles.metaLabel}>Joined</span>
                  <span className={styles.metaValue}>
                    {new Date(member.joinedAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✓</div>
              <div className={styles.statContent}>
                <h3>{stats.tasksCompleted}</h3>
                <p>Tasks Completed</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💬</div>
              <div className={styles.statContent}>
                <h3>{stats.messagesPosted}</h3>
                <p>Messages Posted</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <h3>${stats.contributionAmount.toFixed(2)}</h3>
                <p>Total Contributions</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.activitySection}>
            <h2>Recent Activity</h2>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>✓</div>
                <div className={styles.activityContent}>
                  <h4>Completed task: "Schedule doctor appointment"</h4>
                  <p>2 days ago</p>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>💬</div>
                <div className={styles.activityContent}>
                  <h4>Posted a message in Family Chat</h4>
                  <p>5 days ago</p>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>💰</div>
                <div className={styles.activityContent}>
                  <h4>Paid medication expense ($245.50)</h4>
                  <p>1 week ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className={styles.actionsCard}>
            <h3>Contact {member.user.name?.split(' ')[0] || 'Member'}</h3>
            <div className={styles.actionButtons}>
              <a href={`mailto:${member.user.email}`} className={styles.actionBtn}>
                <Mail size={20} />
                Send Email
              </a>
              {isCareManager && (
                <div className={styles.infoNote}>
                  <Info size={16} />
                  This is the primary Care Manager for {family?.elderName || 'this family'}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

