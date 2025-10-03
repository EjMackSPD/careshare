'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  const buttonStyles = {
    background: 'white',
    color: '#d97706',
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: loading ? 0.7 : 1,
    whiteSpace: 'nowrap' as const
  }

  return (
    <button onClick={handleReset} disabled={loading} style={buttonStyles}>
      {loading ? '🔄 Resetting...' : '🔄 Reset Demo Data'}
    </button>
  )
}

