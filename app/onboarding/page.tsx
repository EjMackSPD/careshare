'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronRight, ChevronLeft } from 'lucide-react'
import styles from './page.module.css'

type OnboardingStep = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: User Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Care Recipient Info
    elderName: '',
    elderPhone: '',
    elderAddress: '',
    elderBirthday: '',
    // Step 3: Family Info
    familyName: '',
    relationship: '',
    emergencyContact: '',
    medicalNotes: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateStep = (currentStep: OnboardingStep): boolean => {
    setError('')

    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
    }

    if (currentStep === 2) {
      if (!formData.elderName) {
        setError('Please enter the care recipient\'s name')
        return false
      }
    }

    if (currentStep === 3) {
      if (!formData.familyName) {
        setError('Please enter a family name')
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1) as OnboardingStep)
    }
  }

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1) as OnboardingStep)
  }

  const handleComplete = async () => {
    if (!validateStep(step)) return

    setLoading(true)
    try {
      // 1. Create user account
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

      // 2. Sign in
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error('Failed to sign in')
      }

      // 3. Create family
      const familyRes = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.familyName,
          elderName: formData.elderName,
          elderPhone: formData.elderPhone,
          elderAddress: formData.elderAddress,
          elderBirthday: formData.elderBirthday ? new Date(formData.elderBirthday).toISOString() : null,
          emergencyContact: formData.emergencyContact,
          medicalNotes: formData.medicalNotes,
          description: `Family care coordination for ${formData.elderName}`,
        }),
      })

      if (!familyRes.ok) {
        throw new Error('Failed to create family')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h2>Create Your Account</h2>
            <p className={styles.stepDescription}>Let's start by setting up your account</p>
            
            <div className={styles.formGroup}>
              <label>Your Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Smith"
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
                placeholder="john@example.com"
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
        )

      case 2:
        return (
          <div className={styles.stepContent}>
            <h2>Care Recipient Information</h2>
            <p className={styles.stepDescription}>Tell us about the person you're caring for</p>
            
            <div className={styles.formGroup}>
              <label>Care Recipient Name *</label>
              <input
                type="text"
                name="elderName"
                value={formData.elderName}
                onChange={handleInputChange}
                placeholder="Mary Smith"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="elderPhone"
                value={formData.elderPhone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Address</label>
              <input
                type="text"
                name="elderAddress"
                value={formData.elderAddress}
                onChange={handleInputChange}
                placeholder="123 Main Street, City, State ZIP"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Date of Birth</label>
              <input
                type="date"
                name="elderBirthday"
                value={formData.elderBirthday}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className={styles.stepContent}>
            <h2>Family Information</h2>
            <p className={styles.stepDescription}>Set up your family care group</p>
            
            <div className={styles.formGroup}>
              <label>Family Name *</label>
              <input
                type="text"
                name="familyName"
                value={formData.familyName}
                onChange={handleInputChange}
                placeholder="Smith Family Care Group"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Your Relationship</label>
              <input
                type="text"
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                placeholder="Son, Daughter, Spouse, etc."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Dr. Johnson - (555) 987-6543"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Medical Notes</label>
              <textarea
                name="medicalNotes"
                value={formData.medicalNotes}
                onChange={handleInputChange}
                placeholder="Important medical information, allergies, medications, etc."
                rows={4}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className={styles.stepContent}>
            <div className={styles.successIcon}>✅</div>
            <h2>You're All Set!</h2>
            <p className={styles.stepDescription}>Review your information before completing setup</p>
            
            <div className={styles.reviewCard}>
              <h3>Account</h3>
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
            </div>

            <div className={styles.reviewCard}>
              <h3>Care Recipient</h3>
              <p><strong>Name:</strong> {formData.elderName}</p>
              {formData.elderPhone && <p><strong>Phone:</strong> {formData.elderPhone}</p>}
              {formData.elderAddress && <p><strong>Address:</strong> {formData.elderAddress}</p>}
            </div>

            <div className={styles.reviewCard}>
              <h3>Family Group</h3>
              <p><strong>Name:</strong> {formData.familyName}</p>
              {formData.relationship && <p><strong>Your Role:</strong> {formData.relationship}</p>}
            </div>
          </div>
        )
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Left Panel - Marketing */}
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
          <h1>Coordinating Care, Together</h1>
          <p className={styles.subtitle}>
            CareShare makes it easy for families to work together in caring for their loved ones.
          </p>

          <ul className={styles.benefits}>
            <li>
              <Check size={20} className={styles.checkIcon} />
              <span>Shared calendar and task management</span>
            </li>
            <li>
              <Check size={20} className={styles.checkIcon} />
              <span>Transparent expense tracking and splitting</span>
            </li>
            <li>
              <Check size={20} className={styles.checkIcon} />
              <span>Centralized care notes and medical information</span>
            </li>
            <li>
              <Check size={20} className={styles.checkIcon} />
              <span>Real-time family communication</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel - Onboarding Form */}
      <div className={styles.rightPanel}>
        <div className={styles.onboardingCard}>
          {/* Progress Indicator */}
          <div className={styles.progressBar}>
            <div className={styles.progressSteps}>
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className={styles.progressStepWrapper}>
                  <div 
                    className={`${styles.progressStep} ${
                      stepNum <= step ? styles.progressStepActive : ''
                    } ${stepNum < step ? styles.progressStepCompleted : ''}`}
                  >
                    {stepNum < step ? <Check size={16} /> : stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`${styles.progressLine} ${stepNum < step ? styles.progressLineCompleted : ''}`} />
                  )}
                </div>
              ))}
            </div>
            <div className={styles.progressLabels}>
              <span className={step === 1 ? styles.activeLabel : ''}>Account</span>
              <span className={step === 2 ? styles.activeLabel : ''}>Care Info</span>
              <span className={step === 3 ? styles.activeLabel : ''}>Family</span>
              <span className={step === 4 ? styles.activeLabel : ''}>Review</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* Step Content */}
          {renderStep()}

          {/* Navigation Buttons */}
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
            
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className={styles.nextBtn}
                disabled={loading}
              >
                Continue
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className={styles.completeBtn}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Complete Setup'}
              </button>
            )}
          </div>

          {/* Footer Links */}
          <div className={styles.onboardingFooter}>
            <p>Already have an account? <Link href="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
