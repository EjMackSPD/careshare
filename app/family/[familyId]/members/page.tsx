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
    fetchInvitations()
  }, [familyId])

  const fetchFamily = async () => {
    try {
      const response = await fetch('/api/families')
      if (response.ok) {
        const families = await response.json()
        const familiesArray = Array.isArray(families) ? families : []
        const currentFamily = familiesArray.find((f: any) => f.id === familyId)
        
        if (currentFamily) {
          // Fetch members separately
          const membersRes = await fetch(`/api/families/${familyId}/members`)
          if (membersRes.ok) {
            const members = await membersRes.json()
            setFamily({
              ...currentFamily,
              members
            })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching family:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/families/${familyId}/invitations`)
      if (response.ok) {
        const data = await response.json()
        setInvitations(data)
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    setInviting(true)
    try {
      const response = await fetch(`/api/families/${familyId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: 'FAMILY_MEMBER' }),
      })

      if (response.ok) {
        setInviteEmail('')
        setShowInviteForm(false)
        fetchInvitations()
        alert('Invitation sent successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation showAuthLinks={true} />
        <div className={styles.layout}>
          <LeftNavigation />
          <main className={styles.main}>
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading family members...</p>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    )
  }

  if (!family) {
    return (
      <div className={styles.container}>
        <Navigation showAuthLinks={true} />
        <div className={styles.layout}>
          <LeftNavigation />
          <main className={styles.main}>
            <div className={styles.errorState}>
              <h2>Family not found</h2>
              <p>The family you're looking for doesn't exist or you don't have access to it.</p>
              <Link href="/family" className={styles.backBtn}>
                View All Families
              </Link>
            </div>
          </main>
        </div>
        <Footer />
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
                {(member.user.name || member.user.email).charAt(0).toUpperCase()}
              </div>
              <div className={styles.memberInfo}>
                <h3>{member.user.name || member.user.email}</h3>
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

