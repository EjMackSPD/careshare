'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './DemoInitButton.module.css'

export default function ResetDemoButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReset = async () => {
    if (!confirm('This will delete all current demo data and create fresh sample data. Continue?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/demo/reset', {
        method: 'POST'
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset demo data')
      }

      alert('Demo data has been reset! Refreshing page...')
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error('Reset demo error:', error)
      alert(error instanceof Error ? error.message : 'Failed to reset demo data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleReset} disabled={loading} className={styles.button}>
      {loading ? '🔄 Resetting Demo Data...' : '🔄 Reset Demo Data'}
    </button>
  )
}

