'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProviders, signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './page.module.css'

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6

type Invite = {
  email: string
  name: string
  role: string
}

const TOP_NEEDS = [
  'Bills',
  'Care coordination',
  'Communication',
  'Meals',
  'Contributions',
]

const STEP_LABELS = [
  'Account',
  'Role',
  'Family',
  'Care',
  'Invites',
  'Goals',
]

const DEFAULT_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  accountType: 'PRIMARY_CAREGIVER',
  workspaceName: '',
  workspaceDescription: '',
  caregiverRelationship: '',
  careRecipientName: '',
  careRecipientPreferredName: '',
  careRecipientPhone: '',
  careRecipientAddress: '',
  careRecipientBirthDate: '',
  careRecipientMedicalNotes: '',
  careRecipientConditions: '',
  invites: [] as Invite[],
  topNeeds: [] as string[],
}

function parseConditions(input: string) {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [formData, setFormData] = useState(DEFAULT_FORM)

  const isAuthenticated = status === 'authenticated'

  useEffect(() => {
    let cancelled = false

    async function loadProviders() {
      const providers = await getProviders()

      if (!cancelled) {
        setGoogleEnabled(Boolean(providers?.google))
      }
    }

    void loadProviders()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!isAuthenticated) {
      setPageLoading(false)
      return
    }

    let cancelled = false

    async function loadOnboarding() {
      try {
        const response = await fetch('/api/onboarding', { cache: 'no-store' })
        const data = await response.json()

        if (cancelled) {
          return
        }

        if (data.hasCompletedOnboarding) {
          router.replace('/dashboard')
          return
        }

        const saved = data.data ?? {}
        setFormData((prev) => ({
          ...prev,
          name: session?.user?.name ?? prev.name,
          email: session?.user?.email ?? prev.email,
          accountType: saved.accountType ?? prev.accountType,
          workspaceName: saved.workspaceName ?? prev.workspaceName,
          workspaceDescription:
            saved.workspaceDescription ?? prev.workspaceDescription,
          caregiverRelationship:
            saved.caregiverRelationship ?? prev.caregiverRelationship,
          careRecipientName:
            saved.careRecipient?.name ?? data.family?.careRecipient?.name ?? prev.careRecipientName,
          careRecipientPreferredName:
            saved.careRecipient?.preferredName ??
            data.family?.careRecipient?.preferredName ??
            prev.careRecipientPreferredName,
          careRecipientPhone:
            saved.careRecipient?.phone ?? data.family?.careRecipient?.phone ?? prev.careRecipientPhone,
          careRecipientAddress:
            saved.careRecipient?.address ?? data.family?.careRecipient?.address ?? prev.careRecipientAddress,
          careRecipientBirthDate:
            saved.careRecipient?.birthDate?.slice?.(0, 10) ??
            data.family?.careRecipient?.birthDate?.slice?.(0, 10) ??
            prev.careRecipientBirthDate,
          careRecipientMedicalNotes:
            saved.careRecipient?.medicalNotes ??
            data.family?.careRecipient?.medicalNotes ??
            prev.careRecipientMedicalNotes,
          careRecipientConditions: Array.isArray(saved.careRecipient?.conditions)
            ? saved.careRecipient.conditions.join(', ')
            : prev.careRecipientConditions,
          invites: saved.invites ?? prev.invites,
          topNeeds: saved.topNeeds ?? prev.topNeeds,
        }))
        setStep(Math.min(Math.max(data.onboardingStep ?? 2, 2), 6) as OnboardingStep)
      } catch (loadError) {
        setError('Unable to load your onboarding progress')
      } finally {
        if (!cancelled) {
          setPageLoading(false)
        }
      }
    }

    loadOnboarding()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, router, session?.user?.email, session?.user?.name, status])

  const progressStep = useMemo(() => (isAuthenticated ? step : 1), [isAuthenticated, step])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleInviteChange = (
    index: number,
    field: keyof Invite,
    value: string
  ) => {
    setFormData((prev) => {
      const invites = [...prev.invites]
      invites[index] = {
        ...invites[index],
        [field]: value,
      }

      return {
        ...prev,
        invites,
      }
    })
  }

  const addInvite = () => {
    setFormData((prev) => ({
      ...prev,
      invites: [
        ...prev.invites,
        {
          email: '',
          name: '',
          role: 'VIEWER',
        },
      ],
    }))
  }

  const removeInvite = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      invites: prev.invites.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  const toggleNeed = (need: string) => {
    setFormData((prev) => ({
      ...prev,
      topNeeds: prev.topNeeds.includes(need)
        ? prev.topNeeds.filter((item) => item !== need)
        : [...prev.topNeeds, need],
    }))
  }

  const buildPayload = (currentStep: OnboardingStep) => ({
    accountType: 'PRIMARY_CAREGIVER',
    currentStep,
    workspaceName: formData.workspaceName,
    workspaceDescription: formData.workspaceDescription,
    caregiverRelationship: formData.caregiverRelationship,
    careRecipient: {
      name: formData.careRecipientName,
      preferredName: formData.careRecipientPreferredName,
      phone: formData.careRecipientPhone,
      address: formData.careRecipientAddress,
      birthDate: formData.careRecipientBirthDate || null,
      medicalNotes: formData.careRecipientMedicalNotes,
      conditions: parseConditions(formData.careRecipientConditions),
    },
    invites: formData.invites,
    topNeeds: formData.topNeeds,
    notificationPreferences: {
      email: true,
      push: true,
    },
  })

  const saveDraft = async (targetStep: OnboardingStep) => {
    if (!isAuthenticated) {
      return
    }

    await fetch('/api/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(targetStep)),
    })
  }

  const validateStep = (currentStep: OnboardingStep) => {
    setError('')

    if (currentStep === 1 && !isAuthenticated) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields')
        return false
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    }

    if (currentStep === 3 && !formData.workspaceName.trim()) {
      setError('Please name your family workspace')
      return false
    }

    if (currentStep === 4 && !formData.careRecipientName.trim()) {
      setError('Please add the person receiving care')
      return false
    }

    return true
  }

  const handleAccountStep = async () => {
    const signupRes = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    })

    if (!signupRes.ok) {
      const data = await signupRes.json()
      throw new Error(data.error || 'Failed to create account')
    }

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error('Failed to sign in')
    }
  }

  const handleNext = async () => {
    if (!validateStep(step)) {
      return
    }

    setLoading(true)

    try {
      if (step === 1 && !isAuthenticated) {
        await handleAccountStep()
        setStep(2)
        router.refresh()
        return
      }

      const nextStep = Math.min(6, step + 1) as OnboardingStep
      await saveDraft(nextStep)
      setStep(nextStep)
    } catch (nextError: any) {
      setError(nextError.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = async () => {
    const previousStep = Math.max(1, step - 1) as OnboardingStep
    setLoading(true)

    try {
      await saveDraft(previousStep)
      setStep(previousStep)
    } catch (backError) {
      setError('Unable to save your progress')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!validateStep(step)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(6)),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (completeError: any) {
      setError(completeError.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    if (pageLoading) {
      return (
        <div className={styles.stepContent}>
          <h2>Loading your setup</h2>
          <p className={styles.stepDescription}>
            Pulling in your saved progress and preparing your workspace.
          </p>
        </div>
      )
    }

    switch (step) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h2>{isAuthenticated ? 'Account ready' : 'Create your account'}</h2>
            <p className={styles.stepDescription}>
              Start with Google or email, then we&apos;ll build your care workspace around you.
            </p>

            {isAuthenticated ? (
              <div className={styles.reviewCard}>
                <h3>Signed in as</h3>
                <p><strong>Name:</strong> {session?.user?.name || 'Primary Caregiver'}</p>
                <p><strong>Email:</strong> {session?.user?.email}</p>
              </div>
            ) : (
              <>
                {googleEnabled && (
                  <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/onboarding' })}
                    className={styles.completeBtn}
                    disabled={loading}
                  >
                    Continue with Google
                  </button>
                )}

                <div className={styles.reviewCard}>
                  <h3>Or create an account with email</h3>

                  <div className={styles.formGroup}>
                    <label>Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jordan Smith"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="jordan@example.com"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )
      case 2:
        return (
          <div className={styles.stepContent}>
            <h2>You&apos;re the Primary Caregiver</h2>
            <p className={styles.stepDescription}>
              We&apos;ll set you up as the initial workspace owner and primary caregiver.
            </p>

            <div className={styles.reviewCard}>
              <h3>Role bundle</h3>
              <p>
                You&apos;ll start with workspace management, member invites, sensitive care profile
                access, and the ability to assign or adjust future roles.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label>Your relationship to the person receiving care</label>
              <input
                type="text"
                name="caregiverRelationship"
                value={formData.caregiverRelationship}
                onChange={handleInputChange}
                placeholder="Daughter, spouse, son, partner, friend..."
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className={styles.stepContent}>
            <h2>Create your family workspace</h2>
            <p className={styles.stepDescription}>
              This is the shared place your family will use for updates, tasks, and bills.
            </p>

            <div className={styles.formGroup}>
              <label>Workspace name *</label>
              <input
                type="text"
                name="workspaceName"
                value={formData.workspaceName}
                onChange={handleInputChange}
                placeholder="Smith Family Care"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Short description</label>
              <textarea
                name="workspaceDescription"
                value={formData.workspaceDescription}
                onChange={handleInputChange}
                placeholder="A shared place to coordinate daily care, bills, and family updates."
                rows={4}
              />
            </div>
          </div>
        )
      case 4:
        return (
          <div className={styles.stepContent}>
            <h2>Add the person receiving care</h2>
            <p className={styles.stepDescription}>
              We&apos;ll create a first-class care recipient profile instead of storing this as loose notes.
            </p>

            <div className={styles.formGroup}>
              <label>Full name *</label>
              <input
                type="text"
                name="careRecipientName"
                value={formData.careRecipientName}
                onChange={handleInputChange}
                placeholder="Margaret Smith"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Preferred name</label>
              <input
                type="text"
                name="careRecipientPreferredName"
                value={formData.careRecipientPreferredName}
                onChange={handleInputChange}
                placeholder="Maggie"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Phone number</label>
              <input
                type="tel"
                name="careRecipientPhone"
                value={formData.careRecipientPhone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Address</label>
              <input
                type="text"
                name="careRecipientAddress"
                value={formData.careRecipientAddress}
                onChange={handleInputChange}
                placeholder="123 Main Street, City, State ZIP"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Date of birth</label>
              <input
                type="date"
                name="careRecipientBirthDate"
                value={formData.careRecipientBirthDate}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Medical notes</label>
              <textarea
                name="careRecipientMedicalNotes"
                value={formData.careRecipientMedicalNotes}
                onChange={handleInputChange}
                placeholder="Key medical context, medications, allergies, routines, or risks."
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Known conditions</label>
              <input
                type="text"
                name="careRecipientConditions"
                value={formData.careRecipientConditions}
                onChange={handleInputChange}
                placeholder="Alzheimer's, diabetes, mobility issues"
              />
            </div>
          </div>
        )
      case 5:
        return (
          <div className={styles.stepContent}>
            <h2>Invite your first family members</h2>
            <p className={styles.stepDescription}>
              You can skip this for now, but inviting even one person helps share the workload sooner.
            </p>

            {formData.invites.map((invite, index) => (
              <div className={styles.reviewCard} key={`${invite.email}-${index}`}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    value={invite.name}
                    onChange={(event) =>
                      handleInviteChange(index, 'name', event.target.value)
                    }
                    placeholder="Alex Smith"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={invite.email}
                    onChange={(event) =>
                      handleInviteChange(index, 'email', event.target.value)
                    }
                    placeholder="alex@example.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Role bundle</label>
                  <select
                    value={invite.role}
                    onChange={(event) =>
                      handleInviteChange(index, 'role', event.target.value)
                    }
                  >
                    <option value="FAMILY_ADMIN">Family Admin</option>
                    <option value="CONTRIBUTOR">Contributor</option>
                    <option value="VIEWER">Viewer</option>
                    <option value="CARE_RECIPIENT">Care Recipient</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeInvite(index)}
                  className={styles.backBtn}
                >
                  Remove
                </button>
              </div>
            ))}

            <button type="button" onClick={addInvite} className={styles.nextBtn}>
              Add family member
            </button>
          </div>
        )
      case 6:
        return (
          <div className={styles.stepContent}>
            <div className={styles.successIcon}>✅</div>
            <h2>Choose your top needs</h2>
            <p className={styles.stepDescription}>
              We&apos;ll use this to shape your dashboard and recommended next actions after setup.
            </p>

            <div className={styles.reviewCard}>
              {TOP_NEEDS.map((need) => (
                <label key={need} className={styles.formGroup}>
                  <input
                    type="checkbox"
                    checked={formData.topNeeds.includes(need)}
                    onChange={() => toggleNeed(need)}
                  />
                  <span>{need}</span>
                </label>
              ))}
            </div>

            <div className={styles.reviewCard}>
              <h3>Next actions after launch</h3>
              <p>1. Add your first bill</p>
              <p>2. Create your first care task</p>
              <p>3. Invite family members</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/careshare-logo.png"
            alt="CareShare Logo"
            width={200}
            height={76}
            priority
          />
        </Link>

        <div className={styles.marketingContent}>
          <h1>Build a trusted family care workspace</h1>
          <p className={styles.subtitle}>
            Start with the primary caregiver, the person receiving care, and the
            permissions your family actually needs.
          </p>

          <ul className={styles.benefits}>
            <li>
              <Check size={20} className={styles.checkIcon} />
              <span>Google or email sign-in with one onboarding path</span>
            </li>
            <li>
              <Check size={20} className={styles.checkIcon} />
              <span>Role bundles for owner, caregiver, admin, contributors, and viewers</span>
            </li>
            <li>
              <Check size={20} className={styles.checkIcon} />
              <span>First-class care recipient profile with save and resume</span>
            </li>
            <li>
              <Check size={20} className={styles.checkIcon} />
              <span>Recommended next steps to get your family moving quickly</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.onboardingCard}>
          <div className={styles.progressBar}>
            <div className={styles.progressSteps}>
              {[1, 2, 3, 4, 5, 6].map((stepNum) => (
                <div key={stepNum} className={styles.progressStepWrapper}>
                  <div
                    className={`${styles.progressStep} ${
                      stepNum <= progressStep ? styles.progressStepActive : ''
                    } ${stepNum < progressStep ? styles.progressStepCompleted : ''}`}
                  >
                    {stepNum < progressStep ? <Check size={16} /> : stepNum}
                  </div>
                  {stepNum < 6 && (
                    <div
                      className={`${styles.progressLine} ${
                        stepNum < progressStep ? styles.progressLineCompleted : ''
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className={styles.progressLabels}>
              {STEP_LABELS.map((label, index) => (
                <span
                  key={label}
                  className={index + 1 === progressStep ? styles.activeLabel : ''}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {renderStep()}

          <div className={styles.stepActions}>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className={styles.backBtn}
                disabled={loading}
              >
                <ChevronLeft size={20} />
                Back
              </button>
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className={styles.nextBtn}
                disabled={loading || pageLoading}
              >
                Continue
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className={styles.completeBtn}
                disabled={loading || pageLoading}
              >
                {loading ? 'Finishing setup...' : 'Launch workspace'}
              </button>
            )}
          </div>

          <div className={styles.onboardingFooter}>
            <p>
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
