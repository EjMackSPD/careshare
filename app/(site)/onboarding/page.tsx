'use client'

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
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
  X,
} from 'lucide-react'
import styles from './page.module.css'
import MarketingNav from '@/app/components/MarketingNav'
import Footer from '@/app/components/Footer'
import EmailCodeForm from '@/app/components/EmailCodeForm'
import {
  DEFAULT_ONBOARDING_DRAFT,
  type OnboardingAudienceType,
  type OnboardingDraft,
  type OnboardingInvite,
} from '@/types/onboarding'
import { useSession } from '@/app/components/AuthProvider'

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6

type OnboardingPanelContent = {
  eyebrow: string
  title: string
  body: string
  bullets: string[]
  note: string
}

type SignupFields = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

type ApiErrorBody = {
  error?: string
  message?: string
}

const DEFAULT_PANEL_CONTENT: OnboardingPanelContent = {
  eyebrow: 'Guided setup',
  title: 'Build the right care workspace from the start',
  body:
    'Create your account once, choose the right path, and leave with a care workspace ready to use.',
  bullets: [
    'Stay in setup after signup with no extra login step',
    'Answer only the details needed for your care path',
    'Land directly in your next CareShare workspace or handoff',
  ],
  note: 'Everything can be refined later from your dashboard.',
}

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
  INDIVIDUAL: ['Account', 'Audience', 'About You', 'Support', 'Finish'],
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

function getNextStep(currentStep: OnboardingStep, audienceType: OnboardingAudienceType) {
  if (audienceType === 'INDIVIDUAL' && currentStep === 2) {
    return 4
  }

  return Math.min(6, currentStep + 1) as OnboardingStep
}

function getPreviousStep(currentStep: OnboardingStep, audienceType: OnboardingAudienceType) {
  if (audienceType === 'INDIVIDUAL' && currentStep === 4) {
    return 2
  }

  return Math.max(1, currentStep - 1) as OnboardingStep
}

function normalizeStepForAudience(step: OnboardingStep, audienceType: OnboardingAudienceType) {
  return audienceType === 'INDIVIDUAL' && step === 3 ? 4 : step
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

async function readApiError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as ApiErrorBody
    return data.error || data.message || fallback
  } catch {
    return fallback
  }
}

async function assertOk(response: Response, fallback: string) {
  if (response.ok) {
    return
  }

  throw new Error(await readApiError(response, fallback))
}

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update: refreshSession } = useSession()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [conditionInput, setConditionInput] = useState('')
  const [signupFields, setSignupFields] = useState<SignupFields>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [formData, setFormData] = useState<OnboardingDraft>(DEFAULT_ONBOARDING_DRAFT)
  const [panelContent, setPanelContent] = useState<OnboardingPanelContent>(DEFAULT_PANEL_CONTENT)

  const isAuthenticated = status === 'authenticated'
  const audienceContent = useMemo(
    () => getAudienceContent(formData.audienceType),
    [formData.audienceType]
  )
  const visibleSteps = useMemo(() => {
    const internalSteps =
      formData.audienceType === 'INDIVIDUAL'
        ? ([1, 2, 4, 5, 6] as OnboardingStep[])
        : ([1, 2, 3, 4, 5, 6] as OnboardingStep[])

    return internalSteps.map((internalStep, index) => ({
      internalStep,
      label: STEP_LABELS[formData.audienceType][index],
    }))
  }, [formData.audienceType])
  const progressStep = useMemo(() => {
    if (!isAuthenticated) {
      return 1
    }

    return Math.max(
      1,
      visibleSteps.findIndex((visibleStep) => visibleStep.internalStep === step) + 1
    )
  }, [isAuthenticated, step, visibleSteps])
  const accountFullName = useMemo(() => {
    const signupName = `${signupFields.firstName.trim()} ${signupFields.lastName.trim()}`.trim()
    return signupName || session?.user?.name?.trim() || ''
  }, [session?.user?.name, signupFields.firstName, signupFields.lastName])
  const accountPreferredName = useMemo(() => {
    return signupFields.firstName.trim() || accountFullName.split(' ')[0] || ''
  }, [accountFullName, signupFields.firstName])
  const conditionTags = useMemo(
    () => parseConditions(formData.careRecipient.conditions),
    [formData.careRecipient.conditions]
  )

  useEffect(() => {
    let cancelled = false

    async function loadPanelContent() {
      try {
        const response = await fetch('/api/onboarding-content', { cache: 'no-store' })

        if (!response.ok) {
          return
        }

        const data = await response.json()

        if (!cancelled && data?.content) {
          setPanelContent({
            eyebrow: data.content.eyebrow || DEFAULT_PANEL_CONTENT.eyebrow,
            title: data.content.title || DEFAULT_PANEL_CONTENT.title,
            body: data.content.body || DEFAULT_PANEL_CONTENT.body,
            bullets: data.content.bullets?.length
              ? data.content.bullets
              : DEFAULT_PANEL_CONTENT.bullets,
            note: data.content.note || DEFAULT_PANEL_CONTENT.note,
          })
        }
      } catch {
        // Keep the local fallback content if Payload content is unavailable.
      }
    }

    void loadPanelContent()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!isAuthenticated) {
      queueMicrotask(() => setPageLoading(false))
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
        const savedStep = Math.min(Math.max(data.onboardingStep ?? 2, 2), 6) as OnboardingStep
        setStep(data.hasCompletedOnboarding ? 1 : normalizeStepForAudience(savedStep, saved.audienceType))
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
      careRecipient:
        audienceType === 'INDIVIDUAL' && accountFullName
          ? {
              ...prev.careRecipient,
              name: prev.careRecipient.name || accountFullName,
              preferredName: prev.careRecipient.preferredName || accountPreferredName,
            }
          : prev.careRecipient,
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

  const updateConditionTags = (conditions: string[]) => {
    updateCareRecipient('conditions', conditions.join(', '))
  }

  const addConditionTags = (input: string) => {
    const nextConditions = input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (nextConditions.length === 0) {
      return
    }

    const existing = new Set(conditionTags.map((item) => item.toLowerCase()))
    const uniqueConditions = nextConditions.filter((condition) => {
      const key = condition.toLowerCase()

      if (existing.has(key)) {
        return false
      }

      existing.add(key)
      return true
    })

    if (uniqueConditions.length > 0) {
      updateConditionTags([...conditionTags, ...uniqueConditions])
    }

    setConditionInput('')
  }

  const removeConditionTag = (condition: string) => {
    updateConditionTags(conditionTags.filter((item) => item !== condition))
  }

  const handleConditionKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ',') {
      return
    }

    event.preventDefault()
    addConditionTags(conditionInput)
  }

  const updateSignupField = (field: keyof SignupFields, value: string) => {
    setSignupFields((prev) => ({
      ...prev,
      [field]: value,
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

    const response = await fetch('/api/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(targetStep)),
    })

    await assertOk(response, 'Unable to save your onboarding progress')
  }

  const validateStep = (currentStep: OnboardingStep) => {
    setError('')

    if (currentStep === 1 && !isAuthenticated) {
      const firstName = signupFields.firstName.trim()
      const lastName = signupFields.lastName.trim()
      const email = signupFields.email.trim()
      const password = signupFields.password
      const confirmPassword = signupFields.confirmPassword

      if (!firstName && !lastName && !email) {
        setError('Add your name and email to continue.')
        return false
      }

      if (!firstName && !lastName) {
        setError('Add your first and last name to continue.')
        return false
      }

      if (!firstName) {
        setError('Add your first name to continue.')
        return false
      }

      if (!lastName) {
        setError('Add your last name to continue.')
        return false
      }

      if (!email) {
        setError('Add your email address to continue.')
        return false
      }

      if (!password && !confirmPassword) {
        setError('Create a password to continue.')
        return false
      }

      if (!password) {
        setError('Enter your password to continue.')
        return false
      }

      if (!confirmPassword) {
        setError('Confirm your password to continue.')
        return false
      }

      if (password.length < 6) {
        setError('Use at least 6 characters for your password.')
        return false
      }

      if (password !== confirmPassword) {
        setError('Make sure both password fields match.')
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
    const name = `${signupFields.firstName.trim()} ${signupFields.lastName.trim()}`.trim()
    const email = signupFields.email.trim().toLowerCase()
    const password = signupFields.password

    const signupRes = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })

    await assertOk(signupRes, 'Failed to create account')

    // Account created but unverified — signup emailed a magic link + code.
    // Show the inline verify step; verifying sets the session and continues.
    setAwaitingVerification(true)
  }

  const handleNext = async () => {
    if (!validateStep(step)) {
      return
    }

    setLoading(true)

    try {
      if (step === 1 && !isAuthenticated) {
        await handleAccountStep()
        return
      }

      const nextStep = getNextStep(step, formData.audienceType)
      await saveDraft(nextStep)
      setStep(nextStep)
    } catch (nextError) {
      setError(getErrorMessage(nextError, 'Something went wrong while continuing setup'))
    } finally {
      setLoading(false)
    }
  }

  const handleBack = async () => {
    const previousStep = getPreviousStep(step, formData.audienceType)
    setLoading(true)

    try {
      await saveDraft(previousStep)
      setStep(previousStep)
    } catch (backError) {
      setError(getErrorMessage(backError, 'Unable to save your progress'))
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

      await assertOk(response, 'Failed to complete onboarding')
      const data = (await response.json()) as { redirectTo?: string }

      router.push(data.redirectTo || '/dashboard')
      router.refresh()
    } catch (completeError) {
      setError(getErrorMessage(completeError, 'Something went wrong while finishing setup'))
    } finally {
      setLoading(false)
    }
  }

  const renderAccountStep = () => {
    if (awaitingVerification && !isAuthenticated) {
      return (
        <div className={styles.stepContent}>
          <span className={styles.stepEyebrow}>Verify email</span>
          <h2>Confirm your email</h2>
          <p className={styles.stepDescription}>
            We sent a magic link and a 6-digit code to keep your account secure.
            Enter the code to continue setup.
          </p>
          <div className={styles.formShell}>
            <EmailCodeForm
              email={signupFields.email.trim().toLowerCase()}
              onVerified={() => {
                void refreshSession().then(() => {
                  setAwaitingVerification(false)
                  setStep(2)
                })
              }}
            />
            <button
              type="button"
              onClick={() => setAwaitingVerification(false)}
              className={styles.secondaryInlineAction}
              style={{ marginTop: '0.75rem' }}
            >
              Use a different email
            </button>
          </div>
        </div>
      )
    }

    return (
    <div className={styles.stepContent}>
      <span className={styles.stepEyebrow}>Account</span>
      <h2>{isAuthenticated ? 'You are signed in' : 'Create your CareShare account'}</h2>
      <p className={styles.stepDescription}>
        {isAuthenticated
          ? 'We have your account ready. Continue to choose the care path that fits today.'
          : "Create your account once. We'll email you a code to confirm it, then continue setup right here."}
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
          <div className={styles.formShell}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="signup-first-name">First name *</label>
                <input
                  id="signup-first-name"
                  name="signup-first-name"
                  type="text"
                  value={signupFields.firstName}
                  onChange={(event) => updateSignupField('firstName', event.target.value)}
                  autoComplete="given-name"
                  placeholder="Jordan"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="signup-last-name">Last name *</label>
                <input
                  id="signup-last-name"
                  name="signup-last-name"
                  type="text"
                  value={signupFields.lastName}
                  onChange={(event) => updateSignupField('lastName', event.target.value)}
                  autoComplete="family-name"
                  placeholder="Smith"
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="signup-email">Email address *</label>
              <input
                id="signup-email"
                name="signup-email"
                type="email"
                value={signupFields.email}
                onChange={(event) => updateSignupField('email', event.target.value)}
                autoComplete="email"
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
                  value={signupFields.password}
                  onChange={(event) => updateSignupField('password', event.target.value)}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="signup-confirm-password">Confirm password *</label>
                <input
                  id="signup-confirm-password"
                  name="signup-confirm-password"
                  type="password"
                  value={signupFields.confirmPassword}
                  onChange={(event) => updateSignupField('confirmPassword', event.target.value)}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    )
  }

  const renderAudienceStep = () => (
    <div className={styles.stepContent}>
      <span className={styles.stepEyebrow}>Audience</span>
      <h2>Who are you setting CareShare up for?</h2>
      <p className={styles.stepDescription}>
        Pick the path that matches your role. CareShare will only ask for the details
        that make that path useful.
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
            This helps CareShare frame permissions, language, and next steps.
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
            Tell us whether to build a new shared workspace or guide you toward an existing one.
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
            This creates a partnership intake and keeps the family workspace flow out of your way.
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
          Capture what matters now. You can invite trusted supporters later.
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
            ? 'These details give your personal plan the right context from day one.'
            : 'Create the core profile your family will coordinate around.'}
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
          <div className={styles.tagInputShell}>
            {conditionTags.length > 0 && (
              <div className={styles.tagList} aria-label="Known conditions">
                {conditionTags.map((condition) => (
                  <span key={condition} className={styles.conditionChip}>
                    {condition}
                    <button
                      type="button"
                      className={styles.conditionRemove}
                      onClick={() => removeConditionTag(condition)}
                      aria-label={`Remove ${condition}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className={styles.tagEntryRow}>
              <input
                type="text"
                value={conditionInput}
                onChange={(event) => setConditionInput(event.target.value)}
                onKeyDown={handleConditionKeyDown}
                onBlur={() => addConditionTags(conditionInput)}
                placeholder={
                  conditionTags.length > 0
                    ? 'Add another condition'
                    : 'Type a condition, then press Enter'
                }
              />
              <button
                type="button"
                className={styles.inlineAddButton}
                onClick={() => addConditionTags(conditionInput)}
              >
                Add
              </button>
            </div>
          </div>
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
            This routes your request to the right follow-up path.
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
            Save your profile now. If you do not have an invite token yet, we will send you to join guidance.
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
            ? 'Keep it personal for now, or invite supporters right away.'
            : 'Name the shared workspace and invite the first helpers.'}
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
            Submit this intake and go straight to the next-step screen.
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
          These priorities shape your first dashboard guidance.
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
    <>
      <MarketingNav />
      <div className={styles.page}>
        <div className={styles.shell}>
          <section className={styles.heroPanel}>
            <div className={styles.heroCopy}>
              <h1>{panelContent.title}</h1>
              <p>{panelContent.body}</p>
            </div>

            <div className={styles.heroHighlights}>
              {panelContent.bullets.map((bullet) => (
                <div key={bullet} className={styles.heroHighlight}>
                  <Check size={18} />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            <div className={styles.heroPathCard}>
              <span>Current path</span>
              <strong>{audienceContent.title}</strong>
              <p>{audienceContent.description}</p>
            </div>

            <div className={styles.heroFootnote}>
              <Sparkles size={16} />
              <span>{panelContent.note}</span>
            </div>
          </section>

          <section className={styles.formPanel}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressSteps}
                style={{ gridTemplateColumns: `repeat(${visibleSteps.length}, minmax(0, 1fr))` }}
              >
                {visibleSteps.map((visibleStep, index) => {
                  const stepNumber = index + 1

                  return (
                    <div key={visibleStep.internalStep} className={styles.progressStepWrapper}>
                    <div
                      className={`${styles.progressStep} ${
                        stepNumber <= progressStep ? styles.progressStepActive : ''
                      } ${stepNumber < progressStep ? styles.progressStepCompleted : ''}`}
                    >
                      {stepNumber < progressStep ? <Check size={15} /> : stepNumber}
                    </div>
                    {stepNumber < visibleSteps.length && (
                      <div
                        className={`${styles.progressLine} ${
                          stepNumber < progressStep ? styles.progressLineCompleted : ''
                        }`}
                      />
                    )}
                  </div>
                  )
                })}
              </div>

              <div
                className={styles.progressLabels}
                style={{ gridTemplateColumns: `repeat(${visibleSteps.length}, minmax(0, 1fr))` }}
              >
                {visibleSteps.map((visibleStep, index) => {
                  const stepNumber = index + 1
                  const labelClassName = `${stepNumber === progressStep ? styles.activeLabel : ''} ${
                    stepNumber < progressStep ? styles.completedLabel : ''
                  }`

                  return (
                    <span key={visibleStep.label} className={labelClassName}>
                      {visibleStep.label}
                    </span>
                  )
                })}
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

                {awaitingVerification && step === 1 ? (
                  <span />
                ) : step < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={styles.primaryAction}
                    disabled={loading || pageLoading}
                  >
                    {loading && step === 1 && !isAuthenticated ? 'Creating account...' : 'Continue'}
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
      <Footer />
    </>
  )
}
