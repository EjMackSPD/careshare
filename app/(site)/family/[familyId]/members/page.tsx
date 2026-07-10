'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  UserPlus,
  Trash2,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  UserCheck,
  X,
  Activity,
  ArrowRight,
} from 'lucide-react'
import styles from './page.module.css'

const MANAGER_ROLES = ['OWNER', 'PRIMARY_CAREGIVER', 'FAMILY_ADMIN']
const ROLE_OPTIONS = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'PRIMARY_CAREGIVER', label: 'Primary Caregiver' },
  { value: 'FAMILY_ADMIN', label: 'Family Admin' },
  { value: 'CONTRIBUTOR', label: 'Contributor' },
  { value: 'VIEWER', label: 'Viewer' },
  { value: 'CARE_RECIPIENT', label: 'Care Recipient' },
]

function roleLabel(role: string) {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role.replaceAll('_', ' ')
}

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

type RegisteredUser = {
  id: string
  name: string | null
  email: string
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
  registeredUser?: RegisteredUser | null
}

type Candidate = {
  id: string
  name: string | null
  email: string
  alreadyInvited: boolean
}

type Family = {
  id: string
  name: string
  members: Member[]
  currentUserRole?: string | null
  canManage?: boolean
}

export default function FamilyMembers() {
  const params = useParams()
  const familyId = params.familyId as string
  const [family, setFamily] = useState<Family | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('VIEWER')
  const [inviting, setInviting] = useState(false)
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null)
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Add-existing-member (search) state
  const [showAddExisting, setShowAddExisting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Candidate[]>([])
  const [searching, setSearching] = useState(false)
  const [addRole, setAddRole] = useState('CONTRIBUTOR')
  const [addingUserId, setAddingUserId] = useState<string | null>(null)

  // Pending-invitation action state
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const refreshInvitations = async () => {
    try {
      const response = await fetch(`/api/families/${familyId}/invitations`)
      if (response.ok) {
        setInvitations(await response.json())
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
  }

  const refreshMembers = async () => {
    try {
      const response = await fetch(`/api/families/${familyId}/members`)
      if (response.ok) {
        const data = await response.json()
        setFamily((current) =>
          current
            ? {
                ...current,
                members: data.members ?? [],
                currentUserRole: data.currentUserRole ?? current.currentUserRole,
                canManage: data.canManage ?? current.canManage,
              }
            : current
        )
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  useEffect(() => {
    async function loadFamily() {
      try {
        // Single-family endpoint authorizes operational admins even when they are
        // not a member, so admins can manage any family here.
        const response = await fetch(`/api/families/${familyId}`)
        if (response.ok) {
          const currentFamily = await response.json()
          const membersRes = await fetch(`/api/families/${familyId}/members`)
          const membersData = membersRes.ok
            ? await membersRes.json()
            : { members: [], currentUserRole: null, canManage: false }
          setFamily({
            ...currentFamily,
            members: membersData.members ?? [],
            currentUserRole: membersData.currentUserRole ?? null,
            canManage: !!membersData.canManage,
          })
        }
      } catch (error) {
        console.error('Error fetching family:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFamily()
    refreshInvitations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [message])

  // Debounced search for existing users.
  useEffect(() => {
    if (!showAddExisting) return
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/families/${familyId}/members/search?q=${encodeURIComponent(q)}`
        )
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.users ?? [])
        }
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, showAddExisting, familyId])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    setInviting(true)
    try {
      const response = await fetch(`/api/families/${familyId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      if (response.ok) {
        setInviteEmail('')
        setInviteRole('VIEWER')
        setShowInviteForm(false)
        refreshInvitations()
        setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}.` })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to send invitation.' })
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      setMessage({ type: 'error', text: 'Failed to send invitation.' })
    } finally {
      setInviting(false)
    }
  }

  const handleAddExisting = async (candidate: Candidate) => {
    setAddingUserId(candidate.id)
    try {
      const response = await fetch(`/api/families/${familyId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: candidate.id, role: addRole }),
      })

      if (response.ok) {
        await Promise.all([refreshMembers(), refreshInvitations()])
        setSearchResults((current) => current.filter((c) => c.id !== candidate.id))
        setMessage({
          type: 'success',
          text: `${candidate.name || candidate.email} added to the family.`,
        })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to add member.' })
      }
    } catch (error) {
      console.error('Error adding member:', error)
      setMessage({ type: 'error', text: 'Failed to add member.' })
    } finally {
      setAddingUserId(null)
    }
  }

  const handleApproveInvitation = async (invitation: Invitation) => {
    setApprovingId(invitation.id)
    try {
      const response = await fetch(
        `/api/families/${familyId}/invitations/${invitation.id}`,
        { method: 'POST' }
      )

      if (response.ok) {
        await Promise.all([refreshMembers(), refreshInvitations()])
        setMessage({
          type: 'success',
          text: `${invitation.registeredUser?.name || invitation.email} added to the family.`,
        })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to add member.' })
      }
    } catch (error) {
      console.error('Error approving invitation:', error)
      setMessage({ type: 'error', text: 'Failed to add member.' })
    } finally {
      setApprovingId(null)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    setCancelingId(invitationId)
    try {
      const response = await fetch(
        `/api/families/${familyId}/invitations/${invitationId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        refreshInvitations()
        setMessage({ type: 'success', text: 'Invitation cancelled.' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to cancel invitation.' })
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error)
      setMessage({ type: 'error', text: 'Failed to cancel invitation.' })
    } finally {
      setCancelingId(null)
    }
  }

  const handleRoleChange = async (memberId: string, role: string) => {
    setSavingMemberId(memberId)
    try {
      const response = await fetch(`/api/families/${familyId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (response.ok) {
        const updated = await response.json()
        setFamily((current) =>
          current
            ? {
                ...current,
                members: current.members.map((m) => (m.id === memberId ? { ...m, role: updated.role } : m)),
              }
            : current
        )
        setMessage({ type: 'success', text: 'Role updated.' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to update role.' })
      }
    } catch (error) {
      console.error('Error updating role:', error)
      setMessage({ type: 'error', text: 'Failed to update role.' })
    } finally {
      setSavingMemberId(null)
    }
  }

  const handleRemove = async (memberId: string) => {
    setSavingMemberId(memberId)
    try {
      const response = await fetch(`/api/families/${familyId}/members/${memberId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFamily((current) =>
          current ? { ...current, members: current.members.filter((m) => m.id !== memberId) } : current
        )
        setMessage({ type: 'success', text: 'Member removed.' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to remove member.' })
      }
    } catch (error) {
      console.error('Error removing member:', error)
      setMessage({ type: 'error', text: 'Failed to remove member.' })
    } finally {
      setSavingMemberId(null)
      setPendingRemoval(null)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.layout}>
          <main className={styles.main}>
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading family members...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!family) {
    return (
      <div className={styles.container}>
        <div className={styles.layout}>
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
      </div>
    )
  }

  const canManage =
    family.canManage ??
    (!!family.currentUserRole && MANAGER_ROLES.includes(family.currentUserRole))

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.header}>
            <div>
              <h1>Family Members</h1>
              <p className={styles.subtitle}>{family.name}</p>
            </div>
            {canManage && (
              <div className={styles.headerActions}>
                <button
                  onClick={() => {
                    setShowAddExisting((v) => !v)
                    setShowInviteForm(false)
                  }}
                  className={`${styles.inviteBtn} ${styles.secondaryBtn}`}
                >
                  <Search size={16} />
                  {showAddExisting ? 'Cancel' : 'Add Existing'}
                </button>
                <button
                  onClick={() => {
                    setShowInviteForm((v) => !v)
                    setShowAddExisting(false)
                  }}
                  className={styles.inviteBtn}
                >
                  <UserPlus size={16} />
                  {showInviteForm ? 'Cancel' : 'Invite by Email'}
                </button>
              </div>
            )}
          </div>

          {message && (
            <div className={`${styles.banner} ${message.type === 'success' ? styles.bannerSuccess : styles.bannerError}`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {message.text}
            </div>
          )}

          {showAddExisting && canManage && (
            <div className={styles.inviteForm}>
              <div className={styles.searchRow}>
                <div className={styles.searchInputWrap}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search registered members by name or email"
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <select value={addRole} onChange={(e) => setAddRole(e.target.value)}>
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {searchQuery.trim().length >= 2 && (
                <div className={styles.searchResults}>
                  {searching && <p className={styles.searchHint}>Searching…</p>}
                  {!searching && searchResults.length === 0 && (
                    <p className={styles.searchHint}>
                      No registered users match. Use “Invite by Email” to invite someone new.
                    </p>
                  )}
                  {searchResults.map((candidate) => (
                    <div key={candidate.id} className={styles.searchResult}>
                      <div className={styles.searchResultAvatar}>
                        {(candidate.name || candidate.email).charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.searchResultInfo}>
                        <strong>{candidate.name || candidate.email}</strong>
                        <span>{candidate.email}</span>
                      </div>
                      {candidate.alreadyInvited && (
                        <span className={styles.invitedTag}>Invited</span>
                      )}
                      <button
                        type="button"
                        className={styles.addBtn}
                        disabled={addingUserId === candidate.id}
                        onClick={() => handleAddExisting(candidate)}
                      >
                        {addingUserId === candidate.id ? 'Adding…' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showInviteForm && canManage && (
            <form onSubmit={handleInvite} className={styles.inviteForm}>
              <div className={styles.formRow}>
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
                <div className={styles.formGroup}>
                  <label>Role</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={inviting}>
                {inviting ? 'Sending…' : 'Send Invite'}
              </button>
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

                {canManage ? (
                  <div className={styles.memberActions}>
                    <select
                      className={styles.roleSelect}
                      value={member.role}
                      disabled={savingMemberId === member.id}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {pendingRemoval === member.id ? (
                      <>
                        <button
                          type="button"
                          className={styles.confirmRemoveBtn}
                          disabled={savingMemberId === member.id}
                          onClick={() => handleRemove(member.id)}
                        >
                          Confirm?
                        </button>
                        <button
                          type="button"
                          className={styles.cancelRemoveBtn}
                          disabled={savingMemberId === member.id}
                          onClick={() => setPendingRemoval(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        aria-label="Remove member"
                        onClick={() => setPendingRemoval(member.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className={`${styles.role} ${styles[member.role.toLowerCase()] ?? ''}`}>
                    {roleLabel(member.role)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {invitations.length > 0 && (
            <div className={styles.invitationsSection}>
              <h3><Mail size={16} /> Pending Invitations</h3>
              <div className={styles.invitationsList}>
                {invitations.map((invitation) => (
                  <div key={invitation.id} className={styles.invitationItem}>
                    <div className={styles.invitationMain}>
                      <p className={styles.invitationEmail}>{invitation.email}</p>
                      <p className={styles.invitationMeta}>
                        Invited by {invitation.inviter.name || invitation.inviter.email} ·{' '}
                        {new Date(invitation.createdAt).toLocaleDateString()}
                        {invitation.registeredUser && ' · Registered ✓'}
                      </p>
                    </div>
                    <div className={styles.invitationActions}>
                      <span className={styles.invitationRole}>
                        <Clock size={12} />
                        {roleLabel(invitation.role)}
                      </span>
                      {canManage && invitation.registeredUser && (
                        <button
                          type="button"
                          className={styles.approveBtn}
                          disabled={approvingId === invitation.id}
                          onClick={() => handleApproveInvitation(invitation)}
                        >
                          <UserCheck size={14} />
                          {approvingId === invitation.id ? 'Adding…' : 'Add now'}
                        </button>
                      )}
                      {canManage && (
                        <button
                          type="button"
                          className={styles.cancelInviteBtn}
                          aria-label="Cancel invitation"
                          disabled={cancelingId === invitation.id}
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.info}>
            <h3>Family Collaboration</h3>
            <p>
              All members can view family events and costs. Owners, primary caregivers, and family
              admins can invite members, change roles, and remove access. Registered users can be
              added directly with “Add Existing”; anyone else can be invited by email.
            </p>
          </div>

          {canManage && (
            <Link href="/dashboard/family-interactions" className={styles.interactionsLink}>
              <Activity size={16} />
              <span>See how each member is engaging — logins, notes, messages, and tasks</span>
              <ArrowRight size={15} />
            </Link>
          )}
        </main>
      </div>
    </div>
  )
}
