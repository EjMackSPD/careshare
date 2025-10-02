'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    router.push('/demo')
  }

  return (
    <div className={styles.container}>
      {/* Left Side - Marketing Content */}
      <div className={styles.leftPanel}>
        <Link href="/" className={styles.logoLink}>
          <Image 
            src="/careshare-logo.png" 
            alt="CareShare Logo" 
            width={250} 
            height={95}
            priority
          />
        </Link>
        
        <h1 className={styles.tagline}>
          Elevating Family Caregiving through Shared Responsibility and Support
        </h1>
        
        <p className={styles.description}>
          As our loved ones age, their ability to manage daily life and finances often 
          diminishes. Our platform empowers families by making caregiving a collaborative, 
          transparent, and sustainable experience.
        </p>

        <ul className={styles.benefits}>
          <li>
            <span className={styles.checkIcon}>✓</span>
            Distribute caregiving responsibilities fairly
          </li>
          <li>
            <span className={styles.checkIcon}>✓</span>
            Track expenses and manage finances together
          </li>
          <li>
            <span className={styles.checkIcon}>✓</span>
            Stay connected with all family members
          </li>
          <li>
            <span className={styles.checkIcon}>✓</span>
            Access community resources and support
          </li>
          <li>
            <span className={styles.checkIcon}>✓</span>
            Plan for future caregiving needs proactively
          </li>
        </ul>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles.rightPanel}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>{error}</div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <button 
            onClick={handleDemoMode}
            className={styles.demoBtn}
            type="button"
          >
            🎭 Try Demo Mode
          </button>
          <p className={styles.demoText}>
            Explore CareShare with pre-populated demo data
          </p>

          <div className={styles.footer}>
            <p>
              Don't have an account? <Link href="/signup">Sign up</Link>
            </p>
            <p className={styles.adminLink}>
              <Link href="/admin/login">Care Provider Login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

