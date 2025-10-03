'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import Footer from '@/app/components/Footer'
import { ArrowLeft, ExternalLink, Bookmark, Share2, FileText, Phone, MapPin } from 'lucide-react'
import styles from './page.module.css'

type Resource = {
  id: string
  title: string
  description: string | null
  category: string
  url: string | null
  fileUrl: string | null
  createdAt: string
}

export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const resourceId = params.resourceId as string
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetchResource()
  }, [resourceId])

  const fetchResource = async () => {
    try {
      // Get user's first family
      const familiesRes = await fetch('/api/families')
      if (!familiesRes.ok) return
      
      const families = await familiesRes.json()
      if (!Array.isArray(families) || families.length === 0) return
      
      const family = families[0]
      
      // Fetch all resources and find the specific one
      const resourcesRes = await fetch(`/api/families/${family.id}/resources`)
      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json()
        const foundResource = resourcesData.find((r: Resource) => r.id === resourceId)
        setResource(foundResource || null)
      }
    } catch (error) {
      console.error('Error fetching resource:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    // TODO: Save bookmark to database
  }

  const handleShare = async () => {
    if (navigator.share && resource) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description || '',
          url: resource.url || window.location.href
        })
      } catch (error) {
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation showAuthLinks={true} />
        <div className={styles.layout}>
          <LeftNavigation />
          <main className={styles.main}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading resource...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className={styles.container}>
        <Navigation showAuthLinks={true} />
        <div className={styles.layout}>
          <LeftNavigation />
          <main className={styles.main}>
            <div className={styles.error}>
              <h2>Resource not found</h2>
              <Link href="/dashboard/resources" className={styles.backLink}>
                ← Back to Resources
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          {/* Header */}
          <div className={styles.header}>
            <Link href="/dashboard/resources" className={styles.backLink}>
              <ArrowLeft size={20} />
              Back to Resources
            </Link>
          </div>

          {/* Resource Card */}
          <div className={styles.resourceCard}>
            <div className={styles.resourceHeader}>
              <div className={styles.headerContent}>
                <span className={styles.categoryBadge}>{resource.category}</span>
                <h1>{resource.title}</h1>
                <p className={styles.addedDate}>
                  Added {new Date(resource.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div className={styles.headerActions}>
                <button 
                  className={`${styles.actionBtn} ${bookmarked ? styles.bookmarked : ''}`}
                  onClick={handleBookmark}
                  title={bookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
                >
                  <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} />
                </button>
                <button 
                  className={styles.actionBtn}
                  onClick={handleShare}
                  title="Share this resource"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Description */}
            {resource.description && (
              <div className={styles.descriptionSection}>
                <h2>About This Resource</h2>
                <p className={styles.description}>{resource.description}</p>
              </div>
            )}

            {/* Resource Links */}
            <div className={styles.linksSection}>
              <h2>Access Resource</h2>
              <div className={styles.linksList}>
                {resource.url && (
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.resourceLink}
                  >
                    <ExternalLink size={20} />
                    <div>
                      <h3>Visit Website</h3>
                      <p>{new URL(resource.url).hostname}</p>
                    </div>
                  </a>
                )}
                {resource.fileUrl && (
                  <a 
                    href={resource.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.resourceLink}
                  >
                    <FileText size={20} />
                    <div>
                      <h3>Download Document</h3>
                      <p>View saved file or document</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className={styles.tipsSection}>
              <h2>How to Use This Resource</h2>
              <ul className={styles.tipsList}>
                <li>Visit the website or download any available documents</li>
                <li>Have your loved one's information ready (age, location, specific needs)</li>
                <li>Note any eligibility requirements or enrollment periods</li>
                <li>Save contact information for future reference</li>
                <li>Share this resource with other family members using the share button above</li>
              </ul>
            </div>

            {/* Related Categories */}
            <div className={styles.relatedSection}>
              <h3>Related Categories</h3>
              <div className={styles.relatedTags}>
                <Link href="/dashboard/resources" className={styles.relatedTag}>
                  All Resources
                </Link>
                <Link 
                  href={`/dashboard/resources?category=${encodeURIComponent(resource.category)}`}
                  className={styles.relatedTag}
                >
                  {resource.category}
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

