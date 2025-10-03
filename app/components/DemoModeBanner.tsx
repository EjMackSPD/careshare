'use client'

import ResetDemoButton from './ResetDemoButton'
import styles from './DemoModeBanner.module.css'

type DemoModeBannerProps = {
  userEmail?: string | null
}

export default function DemoModeBanner({ userEmail }: DemoModeBannerProps) {
  const isDemoMode = userEmail === 'demo@careshare.app'

  if (!isDemoMode) return null

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.leftContent}>
          <span className={styles.icon}>🎭</span>
          <div className={styles.text}>
            <strong>Demo Mode Active</strong>
            <span>You're exploring CareShare with sample data. Sign up to create your own family group!</span>
          </div>
        </div>
        <ResetDemoButton />
      </div>
    </div>
  )
}

