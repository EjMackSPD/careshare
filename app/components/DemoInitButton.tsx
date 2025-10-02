'use client'

export default function DemoInitButton() {
  const handleInit = async () => {
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      } else {
        alert('Failed to initialize demo data. Please try again.')
      }
    } catch (error) {
      console.error('Error initializing demo:', error)
      alert('Failed to initialize demo data')
    }
  }

  return (
    <>
      <p style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '1rem' }}>
        It looks like demo data wasn't set up. Click below to initialize:
      </p>
      <button 
        onClick={handleInit}
        style={{
          background: '#2563eb',
          color: 'white',
          padding: '1rem 2rem',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Initialize Demo Data
      </button>
    </>
  )
}

