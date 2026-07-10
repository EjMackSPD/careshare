'use client'

import { useEffect, useMemo, useState } from 'react'
import { UserPlus, CheckCircle2, XCircle } from 'lucide-react'
import { useSession } from '@/app/components/AuthProvider'
import styles from './page.module.css'

const ROLE_OPTIONS = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'PRIMARY_CAREGIVER', label: 'Primary Caregiver' },
  { value: 'FAMILY_ADMIN', label: 'Family Admin' },
  { value: 'CONTRIBUTOR', label: 'Contributor' },
  { value: 'VIEWER', label: 'Viewer' },
  { value: 'CARE_RECIPIENT', label: 'Care Recipient' },
]

type AdminUser = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  familiesCount: number
}

type AdminFamily = {
  id: string
  name: string
  membersCount: number
}

export default function UsersAdminPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [families, setFamilies] = useState<AdminFamily[]>([])
  const [loading, setLoading] = useState(true)
  const [unassociatedOnly, setUnassociatedOnly] = useState(true)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [selectedFamilyId, setSelectedFamilyId] = useState('')
  const [selectedRole, setSelectedRole] = useState('CONTRIBUTOR')
  const [attaching, setAttaching] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isAdmin =
    session?.user?.role === 'ADMIN' ||
    session?.user?.roles?.includes('super-admin') ||
    session?.user?.roles?.includes('support-admin')

  const loadData = async () => {
    try {
      const [usersRes, familiesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/families'),
      ])

      if (usersRes.ok) {
        setUsers(await usersRes.json())
      }

      if (familiesRes.ok) {
        setFamilies(await familiesRes.json())
      }
    } catch (error) {
      console.error('Error loading users/families:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadData()
    } else if (status !== 'loading') {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, status])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const visibleUsers = useMemo(
    () => (unassociatedOnly ? users.filter((user) => user.familiesCount === 0) : users),
    [users, unassociatedOnly]
  )

  const openAttachPanel = (user: AdminUser) => {
    setExpandedUserId(user.id)
    setSelectedFamilyId(families[0]?.id ?? '')
    setSelectedRole('CONTRIBUTOR')
  }

  const handleAttach = async (userId: string) => {
    if (!selectedFamilyId) return

    setAttaching(true)
    try {
      const response = await fetch(`/api/families/${selectedFamilyId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: selectedRole }),
      })

      if (response.ok) {
        setExpandedUserId(null)
        setMessage({ type: 'success', text: 'User attached to family.' })
        await loadData()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to attach user to family.' })
      }
    } catch (error) {
      console.error('Error attaching user to family:', error)
      setMessage({ type: 'error', text: 'Failed to attach user to family.' })
    } finally {
      setAttaching(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.errorState}>
            <h2>Admins only</h2>
            <p>You don&apos;t have access to this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1>User Directory</h1>
            <p className={styles.subtitle}>{users.length} registered users</p>
          </div>
          <label className={styles.filterToggle}>
            <input
              type="checkbox"
              checked={unassociatedOnly}
              onChange={(e) => setUnassociatedOnly(e.target.checked)}
            />
            Show unassociated only
          </label>
        </div>

        {message && (
          <div className={`${styles.banner} ${message.type === 'success' ? styles.bannerSuccess : styles.bannerError}`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {message.text}
          </div>
        )}

        <div className={styles.usersList}>
          {visibleUsers.length === 0 && (
            <div className={styles.emptyState}>
              <p>No users match this filter.</p>
            </div>
          )}

          {visibleUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userRow}>
                <div className={styles.userAvatar}>
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <div className={styles.userInfo}>
                  <h3>{user.name || user.email}</h3>
                  <p className={styles.userEmail}>{user.email}</p>
                  <p className={styles.joinedDate}>
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {user.familiesCount === 0 ? (
                  <span className={styles.badgeWarning}>No family</span>
                ) : (
                  <span className={styles.badgeNeutral}>
                    {user.familiesCount} {user.familiesCount === 1 ? 'family' : 'families'}
                  </span>
                )}
                <button
                  type="button"
                  className={styles.attachBtn}
                  onClick={() => (expandedUserId === user.id ? setExpandedUserId(null) : openAttachPanel(user))}
                >
                  <UserPlus size={16} />
                  {expandedUserId === user.id ? 'Cancel' : 'Add to Family'}
                </button>
              </div>

              {expandedUserId === user.id && (
                <div className={styles.attachPanel}>
                  <div className={styles.formGroup}>
                    <label>Family</label>
                    <select value={selectedFamilyId} onChange={(e) => setSelectedFamilyId(e.target.value)}>
                      {families.map((family) => (
                        <option key={family.id} value={family.id}>
                          {family.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    disabled={attaching || !selectedFamilyId}
                    onClick={() => handleAttach(user.id)}
                  >
                    {attaching ? 'Attaching…' : 'Attach'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
