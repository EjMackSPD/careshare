'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Shield, Users } from 'lucide-react'
import MarketingNav from '../components/MarketingNav'
import Footer from '../components/Footer'
import styles from './page.module.css'

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/login?registered=true')
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <>
      <MarketingNav />
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.heroContent}>
          <h1>Welcome to CareShare</h1>
          <p className={styles.subtitle}>
            Join thousands of families coordinating care for their loved ones
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Heart size={24} />
              </div>
              <div>
                <h3>Care Together</h3>
                <p>Bring your family together to provide the best care</p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Shield size={24} />
              </div>
              <div>
                <h3>Secure & Private</h3>
                <p>Your family&apos;s information is encrypted and protected</p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Users size={24} />
              </div>
              <div>
                <h3>Share Responsibilities</h3>
                <p>Coordinate tasks, costs, and schedules seamlessly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>Create your account</h2>
            <p>Get started with CareShare today</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>{error}</div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 6 characters"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className={styles.formFooter}>
            <p>
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}

