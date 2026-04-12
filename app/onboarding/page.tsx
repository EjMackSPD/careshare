'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProviders, signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
} from 'lucide-react'
import styles from './page.module.css'
import {
  DEFAULT_ONBOARDING_DRAFT,
  type OnboardingAudienceType,
  type OnboardingDraft,
  type OnboardingInvite,
} from '@/types/onboarding'

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6

const TOP_NEEDS = [
  'Bills',
  'Care coordination',
  'Communication',
  'Meals',
  'Contributions',
]

const AUDIENCE_OPTIONS: Array<{
  value: OnboardingAudienceType
  title: string
  description: string
  nextLabel: string
  bullets: string[]
  icon: typeof HeartHandshake
}> = [
  {
    value: 'CAREGIVER_POA',
    title: 'Caregiver / Power of Attorney',
    description:
      'Start a care workspace with the authority, context, and permissions needed to coordinate confidently.',
    nextLabel: 'Authority',
    bullets: [
      'Capture relationship and decision-making status',
      'Create a trusted care workspace for one loved one',
      'Invite helpers with clear roles',
    ],
    icon: ShieldCheck,
  },
  {
    value: 'FAMILY',
    title: 'Family',
    description:
      'Bring siblings, relatives, and close supporters into one place to share updates, responsibilities, and planning.',
    nextLabel: 'Family path',
    bullets: [
      'Choose whether you are creating or joining a care circle',
      'Set up shared coordination details',
      'Invite contributors right away',
    ],
    icon: Users,
  },
  {
    value: 'CARE_CENTER',
    title: 'Care Center',
    description:
      'Set up a partnership intake so your team can explore family communication, visibility, and support workflows.',
    nextLabel: 'Organization',
    bullets: [
      'Collect organization and contact details',
      'Request a demo or partnership follow-up',
      'Finish with a dedicated next-step handoff',
    ],
    icon: Building2,
  },
  {
    value: 'INDIVIDUAL',
    title: 'Individual',
    description:
      'Start a personal care plan for yourself now, then invite family or trusted supporters when you are ready.',
    nextLabel: 'Planning style',
    bullets: [
      'Set up your own profile with self-first language',
      'Choose your top support priorities',
      'Invite helpers later without blocking setup',
    ],
    icon: UserRound,
  },
]

const STEP_LABELS: Record<OnboardingAudienceType, string[]> = {
  CAREGIVER_POA: ['Account', 'Audience', 'Authority', 'Profile', 'Workspace', 'Finish'],
  FAMILY: ['Account', 'Audience', 'Path', 'Profile', 'Setup', 'Finish'],
  CARE_CENTER: ['Account', 'Audience', 'Organization', 'Contact', 'Goals', 'Finish'],
  INDIVIDUAL: ['Account', 'Audience', 'Planning', 'About You', 'Support', 'Finish'],
}

function emptyInvite(): OnboardingInvite {
  return {
    email: '',
    name: '',
    role: 'VIEWER',
  }
}

function parseConditions(input: string) {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getWorkspaceMode(audienceType: OnboardingAudienceType) {
  if (audienceType === 'CARE_CENTER') {
    return 'PARTNER'
  }

  if (audienceType === 'INDIVIDUAL') {
    return 'SOLO'
  }

  return 'FAMILY'
}

function getAudienceContent(audienceType: OnboardingAudienceType) {
  return AUDIENCE_OPTIONS.find((option) => option.value === audienceType) ?? AUDIENCE_OPTIONS[0]
}

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [formData, setFormData] = useState<OnboardingDraft>(DEFAULT_ONBOARDING_DRAFT)

  const isAuthenticated = status === 'authenticated'
  const audienceContent = useMemo(
    () => getAudienceContent(formData.audienceType),
    [formData.audienceType]
  )
  const stepLabels = STEP_LABELS[formData.audienceType]
  const progressStep = useMemo(() => (isAuthenticated ? step : 1), [isAuthenticated, step])

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

        const saved = { ...DEFAULT_ONBOARDING_DRAFT, ...(data.data ?? {}) } as OnboardingDraft
        saved.workspaceMode = getWorkspaceMode(saved.audienceType)

        if (data.hasCompletedOnboarding) {
          if (saved.audienceType === 'CARE_CENTER') {
            router.replace('/onboarding/partner-complete')
            return
          }

          if (
            saved.audienceType === 'FAMILY' &&
            saved.careContext.familyIntent === 'JOIN' &&
            !data.familyId
          ) {
            router.replace('/onboarding/join-family')
            return
          }

          router.replace('/dashboard')
          return
        }

        setFormData({
          ...saved,
          currentStep: saved.currentStep ?? 1,
          workspaceMode: getWorkspaceMode(saved.audienceType),
          careRecipient: {
            ...DEFAULT_ONBOARDING_DRAFT.careRecipient,
            ...saved.careRecipient,
          },
          careContext: {
            ...DEFAULT_ONBOARDING_DRAFT.careContext,
            ...saved.careContext,
          },
          organization: {
            ...DEFAULT_ONBOARDING_DRAFT.organization,
            ...saved.organization,
          },
          invites: saved.invites ?? [],
          notificationPreferences:
            saved.notificationPreferences ?? DEFAULT_ONBOARDING_DRAFT.notificationPreferences,
          topNeeds: saved.topNeeds ?? [],
        })
        setStep(Math.min(Math.max(data.onboardingStep ?? 2, 2), 6) as OnboardingStep)
      } catch (loadError) {
        setError('Unable to load your onboarding progress')
      } finally {
        if (!cancelled) {
          setPageLoading(false)
        }
      }
    }

    void loadOnboarding()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, router, status])

  const setAudience = (audienceType: OnboardingAudienceType) => {
    setFormData((prev) => ({
      ...prev,
      audienceType,
      workspaceMode: getWorkspaceMode(audienceType),
      careContext: {
        ...prev.careContext,
        selfManaged: audienceType === 'INDIVIDUAL',
        familyIntent: audienceType === 'FAMILY' ? prev.careContext.familyIntent : 'CREATE',
      },
      invites:
        audienceType === 'CARE_CENTER'
          ? []
          : prev.invites.length > 0
            ? prev.invites
            : audienceType === 'INDIVIDUAL'
              ? []
              : [emptyInvite()],
    }))
  }

  const updateForm = <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateCareContext = (field: keyof OnboardingDraft['careContext'], value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      careContext: {
        ...prev.careContext,
        [field]: value,
      },
    }))
  }

  const updateCareRecipient = (field: keyof OnboardingDraft['careRecipient'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      careRecipient: {
        ...prev.careRecipient,
        [field]: value,
      },
    }))
  }

  const updateOrganization = (field: keyof OnboardingDraft['organization'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      organization: {
        ...prev.organization,
        [field]: value,
      },
    }))
  }

  const handleInviteChange = (index: number, field: keyof OnboardingInvite, value: string) => {
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
      invites: [...prev.invites, emptyInvite()],
    }))
  }

  const removeInvite = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      invites: prev.invites.filter((_, inviteIndex) => inviteIndex !== index),
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
    ...formData,
    currentStep,
    workspaceMode: getWorkspaceMode(formData.audienceType),
    careRecipient: {
      ...formData.careRecipient,
      conditions: parseConditions(formData.careRecipient.conditions).join(', '),
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
      const name = (document.querySelector('input[name="signup-name"]') as HTMLInputElement | null)?.value
      const email = (document.querySelector('input[name="signup-email"]') as HTMLInputElement | null)?.value
      const password = (document.querySelector('input[name="signup-password"]') as HTMLInputElement | null)?.value
      const confirmPassword = (
        document.querySelector('input[name="signup-confirm-password"]') as HTMLInputElement | null
      )?.value

      if (!name || !email || !password) {
        setError('Please fill in all required fields')
        return false
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    }

    if (currentStep === 3) {
      if (
        formData.audienceType === 'CAREGIVER_POA' &&
        !formData.careContext.caregiverRelationship.trim()
      ) {
        setError('Please add your relationship to the person you support')
        return false
      }

      if (formData.audienceType === 'CARE_CENTER' && !formData.organization.name.trim()) {
        setError('Please add your organization name')
        return false
      }
    }

    if (currentStep === 4) {
      if (
        formData.audienceType !== 'CARE_CENTER' &&
        !formData.careRecipient.name.trim()
      ) {
        setError(
          formData.audienceType === 'INDIVIDUAL'
            ? 'Please tell us who this personal plan is for'
            : 'Please add the person receiving care'
        )
        return false
      }

      if (
        formData.audienceType === 'CARE_CENTER' &&
        (!formData.organization.contactName.trim() ||
          !formData.organization.contactEmail.trim())
      ) {
        setError('Please add a primary contact name and email')
        return false
      }
    }

    if (currentStep === 5) {
      if (
        (formData.audienceType === 'CAREGIVER_POA' ||
          (formData.audienceType === 'FAMILY' &&
            formData.careContext.familyIntent === 'CREATE')) &&
        !formData.workspaceName.trim()
      ) {
        setError('Please name your workspace')
        return false
      }

      if (
        formData.audienceType === 'FAMILY' &&
        formData.careContext.familyIntent === 'JOIN' &&
        !formData.careContext.joinContactEmail.trim()
      ) {
        setError('Please add the organizer email for the care circle you are joining')
        return false
      }
    }

    return true
  }

  const handleAccountStep = async () => {
    const name = (document.querySelector('input[name="signup-name"]') as HTMLInputElement | null)?.value ?? ''
    const email = (document.querySelector('input[name="signup-email"]') as HTMLInputElement | null)?.value ?? ''
    const password =
      (document.querySelector('input[name="signup-password"]') as HTMLInputElement | null)?.value ?? ''

    const signupRes = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })

    if (!signupRes.ok) {
      const data = await signupRes.json()
      throw new Error(data.error || 'Failed to create account')
    }

    const result = await signIn('credentials', {
      email,
      password,
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

      router.push(data.redirectTo || '/dashboard')
      router.refresh()
    } catch (completeError: any) {
      setError(completeError.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const renderAccountStep = () => (
    <div className={styles.stepContent}>
      <span className={styles.stepEyebrow}>Account</span>
      <h2>{isAuthenticated ? 'You are signed in' : 'Create your CareShare account'}</h2>
      <p className={styles.stepDescription}>
        Start with an account, then we&apos;ll tailor setup for the kind of care support
        you&apos;re building.
      </p>

      {isAuthenticated ? (
        <div className={styles.dataPanel}>
          <div>
            <span className={styles.dataLabel}>Name</span>
            <strong>{session?.user?.name || 'CareShare member'}</strong>
          </div>
          <div>
            <span className={styles.dataLabel}>Email</span>
            <strong>{session?.user?.email}</strong>
          </div>
        </div>
      ) : (
        <>
          {googleEnabled && (
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/onboarding' })}
              className={styles.primaryAction}
              disabled={loading}
            >
              Continue with Google
            </button>
          )}

          <div className={styles.formShell}>
            <div className={styles.formGroup}>
              <label htmlFor="signup-name">Your name *</label>
              <input id="signup-name" name="signup-name" type="text" placeholder="Jordan Smith" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="signup-email">Email address *</label>
              <input
                id="signup-email"
                name="signup-email"
                type="email"
                placeholder="jordan@example.com"
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="signup-password">Password *</label>
                <input
                  id="signup-password"
                  name="signup-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="signup-confirm-password">Confirm password *</label>
                <input
                  id="signup-confirm-password"
                  name="signup-confirm-password"
                  type="password"
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderAudienceStep = () => (
    <div className={styles.stepContent}>
      <span className={styles.stepEyebrow}>Audience</span>
      <h2>Who are you setting CareShare up for?</h2>
      <p className={styles.stepDescription}>
        Pick the path that matches your role right now. We&apos;ll shape the setup flow and
        first actions around it.
      </p>

      <div className={styles.audienceGrid}>
        {AUDIENCE_OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive = option.value === formData.audienceType

          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.audienceCard} ${isActive ? styles.audienceCardActive : ''}`}
              onClick={() => setAudience(option.value)}
            >
              <div className={styles.audienceHeader}>
                <div className={styles.audienceIcon}>
                  <Icon size={20} />
                </div>
                <span className={styles.audienceNext}>{option.nextLabel}</span>
              </div>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderContextStep = () => {
    if (formData.audienceType === 'CAREGIVER_POA') {
      return (
        <div className={styles.stepContent}>
          <span className={styles.stepEyebrow}>Authority</span>
          <h2>Tell us how you support this person</h2>
          <p className={styles.stepDescription}>
            We&apos;ll use this to frame permissions, language, and your recommended next steps.
          </p>

          <div className={styles.formGroup}>
            <label>Your relationship *</label>
            <input
              type="text"
              value={formData.careContext.caregiverRelationship}
              onChange={(event) =>
                updateCareContext('caregiverRelationship', event.target.value)
              }
              placeholder="Daughter, spouse, son, partner, friend..."
            />
          </div>

          <div className={styles.segmented}>
            {[
              ['PRIMARY_HELPER', 'Primary helper'],
              ['POWER_OF_ATTORNEY', 'Power of attorney'],
              ['LEGAL_GUARDIAN', 'Legal guardian'],
              ['FAMILY_SUPPORT', 'Family support'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`${styles.segment} ${
                  formData.careContext.decisionAuthority === value ? styles.segmentActive : ''
                }`}
                onClick={() => updateCareContext('decisionAuthority', value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )
    }

    if (formData.audienceType === 'FAMILY') {
      return (
        <div className={styles.stepContent}>
          <span className={styles.stepEyebrow}>Family Path</span>
          <h2>Are you creating a care circle or joining one?</h2>
          <p className={styles.stepDescription}>
            Choose the path that matches where your family is today.
          </p>

          <div className={styles.choiceStack}>
            {[
              ['CREATE', 'Create a care circle', 'Start the shared workspace and invite family members yourself.'],
              ['JOIN', 'Join an existing care circle', 'Finish setup, then we’ll guide you to connect with the organizer who invited you.'],
            ].map(([value, title, copy]) => (
              <button
                key={value}
                type="button"
                className={`${styles.choiceCard} ${
                  formData.careContext.familyIntent === value ? styles.choiceCardActive : ''
                }`}
                onClick={() => updateCareContext('familyIntent', value)}
              >
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <ArrowRight size={18} />
              </button>
            ))}
          </div>
        </div>
      )
    }

    if (formData.audienceType === 'CARE_CENTER') {
      return (
        <div className={styles.stepContent}>
          <span className={styles.stepEyebrow}>Organization</span>
          <h2>Introduce your care center</h2>
          <p className={styles.stepDescription}>
            This creates a partnership intake, not a family workspace.
          </p>

          <div className={styles.formGroup}>
            <label>Organization name *</label>
            <input
              type="text"
              value={formData.organization.name}
              onChange={(event) => updateOrganization('name', event.target.value)}
              placeholder="Willow Creek Assisted Living"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Organization type</label>
              <select
                value={formData.organization.type}
                onChange={(event) => updateOrganization('type', event.target.value)}
              >
                <option value="ASSISTED_LIVING">Assisted living</option>
                <option value="NURSING_HOME">Nursing home</option>
                <option value="HOME_CARE_AGENCY">Home care agency</option>
                <option value="HOSPICE">Hospice</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Estimated size</label>
              <select
                value={formData.organization.size}
                onChange={(event) => updateOrganization('size', event.target.value)}
              >
                <option value="1_10">1-10 families</option>
                <option value="11_50">11-50 families</option>
                <option value="51_200">51-200 families</option>
                <option value="201_PLUS">201+ families</option>
              </select>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.stepContent}>
        <span className={styles.stepEyebrow}>Planning Style</span>
        <h2>Start with your own plan first</h2>
        <p className={styles.stepDescription}>
          We&apos;ll set this up with self-first language so you can capture what matters now
          and invite trusted supporters later.
        </p>

        <div className={styles.choiceStack}>
          <div className={`${styles.choiceCard} ${styles.choiceCardActive}`}>
            <div>
              <h3>Personal plan, family later</h3>
              <p>Keep setup lightweight now. You can bring in family or helpers when you&apos;re ready.</p>
            </div>
            <Check size={18} />
          </div>
        </div>
      </div>
    )
  }

  const renderProfileStep = () => {
    if (formData.audienceType === 'CARE_CENTER') {
      return (
        <div className={styles.stepContent}>
          <span className={styles.stepEyebrow}>Contact</span>
          <h2>Who should we follow up with?</h2>
          <p className={styles.stepDescription}>
            Add the primary point of contact for demos, implementation, or partnership follow-up.
          </p>

          <div className={styles.formGroup}>
            <label>Contact name *</label>
            <input
              type="text"
              value={formData.organization.contactName}
              onChange={(event) => updateOrganization('contactName', event.target.value)}
              placeholder="Jordan Smith"
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                value={formData.organization.contactEmail}
                onChange={(event) => updateOrganization('contactEmail', event.target.value)}
                placeholder="jordan@willowcreek.org"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                value={formData.organization.contactPhone}
                onChange={(event) => updateOrganization('contactPhone', event.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>
      )
    }

    const isIndividual = formData.audienceType === 'INDIVIDUAL'

    return (
      <div className={styles.stepContent}>
        <span className={styles.stepEyebrow}>{isIndividual ? 'About You' : 'Profile'}</span>
        <h2>{isIndividual ? 'Build your personal care profile' : 'Add the person receiving care'}</h2>
        <p className={styles.stepDescription}>
          {isIndividual
            ? 'These details stay in one place so your care plan, reminders, and supporters start from the right context.'
            : 'We’ll create a structured profile instead of burying care details in notes later.'}
        </p>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>{isIndividual ? 'Your full name *' : 'Full name *'}</label>
            <input
              type="text"
              value={formData.careRecipient.name}
              onChange={(event) => updateCareRecipient('name', event.target.value)}
              placeholder={isIndividual ? 'Jordan Smith' : 'Margaret Smith'}
            />
          </div>
          <div className={styles.formGroup}>
            <label>{isIndividual ? 'Preferred name' : 'Preferred name'}</label>
            <input
              type="text"
              value={formData.careRecipient.preferredName}
              onChange={(event) => updateCareRecipient('preferredName', event.target.value)}
              placeholder={isIndividual ? 'Jordan' : 'Maggie'}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Phone</label>
            <input
              type="tel"
              value={formData.careRecipient.phone}
              onChange={(event) => updateCareRecipient('phone', event.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Date of birth</label>
            <input
              type="date"
              value={formData.careRecipient.birthDate}
              onChange={(event) => updateCareRecipient('birthDate', event.target.value)}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Address</label>
          <input
            type="text"
            value={formData.careRecipient.address}
            onChange={(event) => updateCareRecipient('address', event.target.value)}
            placeholder="123 Main Street, City, State ZIP"
          />
        </div>

        <div className={styles.formGroup}>
          <label>{isIndividual ? 'Medical notes and routines' : 'Medical notes'}</label>
          <textarea
            value={formData.careRecipient.medicalNotes}
            onChange={(event) => updateCareRecipient('medicalNotes', event.target.value)}
            placeholder="Key medical context, medications, allergies, routines, or risks."
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Known conditions</label>
          <input
            type="text"
            value={formData.careRecipient.conditions}
            onChange={(event) => updateCareRecipient('conditions', event.target.value)}
            placeholder="Mobility issues, diabetes, memory support"
          />
        </div>
      </div>
    )
  }

  const renderSetupStep = () => {
    if (formData.audienceType === 'CARE_CENTER') {
      return (
        <div className={styles.stepContent}>
          <span className={styles.stepEyebrow}>Goals</span>
          <h2>What kind of partnership are you exploring?</h2>
          <p className={styles.stepDescription}>
            This helps us tailor the follow-up and route your request to the right team.
          </p>

          <div className={styles.choiceStack}>
            {[
              ['DEMO_REQUEST', 'Request a product demo'],
              ['FAMILY_PORTAL', 'Offer families a shared portal'],
              ['STAFF_COORDINATION', 'Improve staff-family coordination'],
              ['PARTNERSHIP_EXPLORATION', 'Explore a broader partnership'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`${styles.choiceCard} ${
                  formData.organization.partnershipGoal === value ? styles.choiceCardActive : ''
                }`}
                onClick={() => updateOrganization('partnershipGoal', value)}
              >
                <div>
                  <h3>{label}</h3>
                </div>
                <ArrowRight size={18} />
              </button>
            ))}
          </div>

          <div className={styles.formGroup}>
            <label>Anything else we should know?</label>
            <textarea
              value={formData.organization.notes}
              onChange={(event) => updateOrganization('notes', event.target.value)}
              rows={4}
              placeholder="Current workflow, timing, family communication goals, or rollout details."
            />
          </div>
        </div>
      )
    }

    if (formData.audienceType === 'FAMILY' && formData.careContext.familyIntent === 'JOIN') {
      return (
        <div className={styles.stepContent}>
          <span className={styles.stepEyebrow}>Join Flow</span>
          <h2>We&apos;ll guide you into the existing care circle</h2>
          <p className={styles.stepDescription}>
            For this first version, we&apos;ll save your profile and route you to join guidance if you
            don&apos;t have an invite token yet.
          </p>

          <div className={styles.formGroup}>
            <label>Organizer email *</label>
            <input
              type="email"
              value={formData.careContext.joinContactEmail}
              onChange={(event) => updateCareContext('joinContactEmail', event.target.value)}
              placeholder="alex@example.com"
            />
          </div>

          <div className={styles.dataPanel}>
            <div>
              <span className={styles.dataLabel}>What happens next</span>
              <strong>We&apos;ll save your profile and send you to a join guidance screen.</strong>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.stepContent}>
        <span className={styles.stepEyebrow}>
          {formData.audienceType === 'INDIVIDUAL' ? 'Support' : 'Workspace'}
        </span>
        <h2>
          {formData.audienceType === 'INDIVIDUAL'
            ? 'Name your personal workspace and add supporters'
            : 'Create the workspace people will use together'}
        </h2>
        <p className={styles.stepDescription}>
          {formData.audienceType === 'INDIVIDUAL'
            ? 'This can stay personal for now. Invite people only if you want support right away.'
            : 'Set the shared name, describe the care circle, and invite the first people who should be involved.'}
        </p>

        <div className={styles.formGroup}>
          <label>Workspace name {formData.audienceType === 'INDIVIDUAL' ? '' : '*'}</label>
          <input
            type="text"
            value={formData.workspaceName}
            onChange={(event) => updateForm('workspaceName', event.target.value)}
            placeholder={
              formData.audienceType === 'INDIVIDUAL'
                ? "Jordan's Care Plan"
                : 'Smith Family Care'
            }
          />
        </div>

        <div className={styles.formGroup}>
          <label>Short description</label>
          <textarea
            value={formData.workspaceDescription}
            onChange={(event) => updateForm('workspaceDescription', event.target.value)}
            placeholder={
              formData.audienceType === 'INDIVIDUAL'
                ? 'A private place to organize appointments, decisions, and personal support.'
                : 'A shared place to coordinate daily care, bills, and family updates.'
            }
            rows={4}
          />
        </div>

        <div className={styles.inviteHeader}>
          <h3>{formData.audienceType === 'INDIVIDUAL' ? 'Optional supporters' : 'Invite helpers'}</h3>
          <button type="button" onClick={addInvite} className={styles.secondaryInlineAction}>
            Add person
          </button>
        </div>

        {formData.invites.length === 0 ? (
          <div className={styles.dataPanel}>
            <div>
              <span className={styles.dataLabel}>No invites yet</span>
              <strong>
                {formData.audienceType === 'INDIVIDUAL'
                  ? 'You can finish setup now and invite supporters later.'
                  : 'Add one or two people now to share the work sooner.'}
              </strong>
            </div>
          </div>
        ) : (
          <div className={styles.inviteList}>
            {formData.invites.map((invite, index) => (
              <div key={`${invite.email}-${index}`} className={styles.inviteCard}>
                <div className={styles.formRow}>
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
                </div>

                <div className={styles.inviteFooter}>
                  <div className={styles.formGroup}>
                    <label>Role</label>
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
                    className={styles.ghostAction}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderFinishStep = () => {
    if (formData.audienceType === 'CARE_CENTER') {
      return (
        <div className={styles.stepContent}>
          <span className={styles.stepEyebrow}>Finish</span>
          <h2>Review your partnership intake</h2>
          <p className={styles.stepDescription}>
            We&apos;ll route this to the right follow-up path and take you to a dedicated next-step
            screen after submission.
          </p>

          <div className={styles.summaryStack}>
            <div className={styles.summaryRow}>
              <span>Organization</span>
              <strong>{formData.organization.name || 'Not provided yet'}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Contact</span>
              <strong>{formData.organization.contactName || 'Not provided yet'}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Goal</span>
              <strong>{formData.organization.partnershipGoal.replaceAll('_', ' ')}</strong>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.stepContent}>
        <span className={styles.stepEyebrow}>Finish</span>
        <h2>
          {formData.audienceType === 'INDIVIDUAL'
            ? 'Choose your support priorities'
            : 'Choose your top needs'}
        </h2>
        <p className={styles.stepDescription}>
          We&apos;ll use this to shape the first dashboard guidance after setup.
        </p>

        <div className={styles.needGrid}>
          {TOP_NEEDS.map((need) => (
            <button
              key={need}
              type="button"
              className={`${styles.needChip} ${
                formData.topNeeds.includes(need) ? styles.needChipActive : ''
              }`}
              onClick={() => toggleNeed(need)}
            >
              {need}
            </button>
          ))}
        </div>

        <div className={styles.summaryStack}>
          <div className={styles.summaryRow}>
            <span>Workspace</span>
            <strong>
              {formData.workspaceName ||
                (formData.audienceType === 'INDIVIDUAL' ? 'Auto-name on finish' : 'Not set yet')}
            </strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Invites</span>
            <strong>{formData.invites.filter((invite) => invite.email.trim()).length}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Audience</span>
            <strong>{audienceContent.title}</strong>
          </div>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    if (pageLoading) {
      return (
        <div className={styles.stepContent}>
          <span className={styles.stepEyebrow}>Loading</span>
          <h2>Preparing your setup</h2>
          <p className={styles.stepDescription}>
            Pulling in your saved progress and getting the right onboarding path ready.
          </p>
        </div>
      )
    }

    switch (step) {
      case 1:
        return renderAccountStep()
      case 2:
        return renderAudienceStep()
      case 3:
        return renderContextStep()
      case 4:
        return renderProfileStep()
      case 5:
        return renderSetupStep()
      case 6:
      default:
        return renderFinishStep()
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.heroPanel}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/careshare-logo.png"
              alt="CareShare Logo"
              width={200}
              height={76}
              priority
            />
          </Link>

          <div className={styles.heroCopy}>
            <span className={styles.heroEyebrow}>Adaptive Onboarding</span>
            <h1>{audienceContent.title}</h1>
            <p>{audienceContent.description}</p>
          </div>

          <div className={styles.heroHighlights}>
            {audienceContent.bullets.map((bullet) => (
              <div key={bullet} className={styles.heroHighlight}>
                <Check size={18} />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <div className={styles.heroFootnote}>
            <Sparkles size={16} />
            <span>One onboarding route, tailored guidance for four kinds of care support.</span>
          </div>
        </section>

        <section className={styles.formPanel}>
          <div className={styles.progressBar}>
            <div className={styles.progressSteps}>
              {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
                <div key={stepNumber} className={styles.progressStepWrapper}>
                  <div
                    className={`${styles.progressStep} ${
                      stepNumber <= progressStep ? styles.progressStepActive : ''
                    } ${stepNumber < progressStep ? styles.progressStepCompleted : ''}`}
                  >
                    {stepNumber < progressStep ? <Check size={15} /> : stepNumber}
                  </div>
                  {stepNumber < 6 && (
                    <div
                      className={`${styles.progressLine} ${
                        stepNumber < progressStep ? styles.progressLineCompleted : ''
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className={styles.progressLabels}>
              {stepLabels.map((label, index) => (
                <span key={label} className={index + 1 === progressStep ? styles.activeLabel : ''}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.formCard}>
            {error && <div className={styles.error}>{error}</div>}

            {renderStep()}

            <div className={styles.stepActions}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className={styles.secondaryAction}
                  disabled={loading}
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
              ) : (
                <span />
              )}

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className={styles.primaryAction}
                  disabled={loading || pageLoading}
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  className={styles.primaryAction}
                  disabled={loading || pageLoading}
                >
                  {loading
                    ? 'Finishing setup...'
                    : formData.audienceType === 'CARE_CENTER'
                      ? 'Submit partnership intake'
                      : 'Launch workspace'}
                </button>
              )}
            </div>

            <div className={styles.footerNote}>
              <p>
                Already have an account? <Link href="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
