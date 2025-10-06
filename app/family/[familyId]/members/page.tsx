'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import Footer from '@/app/components/Footer'
import styles from './page.module.css'

type Member = {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  role: string
  joinedAt: string
}

type Invitation = {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  inviter: {
    name: string | null
    email: string
  }
}

type Family = {
  id: string
  name: string
  members: Member[]
}

export default function FamilyMembers() {
  const params = useParams()
  const familyId = params.familyId as string
  const [family, setFamily] = useState<Family | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchFamily()
  }, [familyId])

  const fetchFamily = async () => {
    try {
      const response = await fetch('/api/families')
      if (response.ok) {
        const families = await response.json()
        const currentFamily = families.find((f: Family) => f.id === familyId)
        setFamily(currentFamily || null)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching family:', error)
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement invite functionality
    alert('Invite feature coming soon! Share the family link with your family members.')
    setInviteEmail('')
    setShowInviteForm(false)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (!family) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Family not found</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navigation backLink={{ href: `/family/${familyId}`, label: 'Back to Family' }} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1>Family Members</h1>
            <p className={styles.subtitle}>{family.name}</p>
          </div>
          <button onClick={() => setShowInviteForm(!showInviteForm)} className={styles.inviteBtn}>
            {showInviteForm ? 'Cancel' : '+ Invite Member'}
          </button>
        </div>

        {showInviteForm && (
          <form onSubmit={handleInvite} className={styles.inviteForm}>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                placeholder="member@example.com"
              />
            </div>
            <button type="submit" className={styles.submitBtn}>Send Invite</button>
          </form>
        )}

        <div className={styles.membersList}>
          {family.members.map((member) => (
            <div key={member.id} className={styles.memberCard}>
              <div className={styles.memberAvatar}>
                {member.user.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.memberInfo}>
                <h3>{member.user.name}</h3>
                <p className={styles.memberEmail}>{member.user.email}</p>
                <p className={styles.joinedDate}>
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`${styles.role} ${styles[member.role.toLowerCase()]}`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.info}>
          <h3>👥 Family Collaboration</h3>
          <p>
            All members can view family events and costs. Organizers have additional
            permissions to manage family settings and invite new members.
          </p>
        </div>
      </main>
    </div>
    <Footer />
  </div>
  )
}

