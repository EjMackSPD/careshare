'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Search, ExternalLink, Phone, MapPin, Utensils, Bus, Home as HomeIcon } from 'lucide-react'
import styles from './page.module.css'

type Resource = {
  id: string
  title: string
  description: string | null
  category: string
  url: string | null
  fileUrl: string | null
}

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Resources')
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [familyId, setFamilyId] = useState<string | null>(null)

  const categories = ['All Resources', 'Healthcare', 'Nutrition', 'Social', 'Transportation', 'Housing', 'Legal', 'Financial']

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      // Get user's first family
      const familiesRes = await fetch('/api/families')
      if (!familiesRes.ok) {
        console.log('ResourcesPage - Failed to fetch families:', familiesRes.status)
        return
      }
      
      const familiesData = await familiesRes.json()
      console.log('ResourcesPage - Families data:', familiesData)
      
      // API returns array directly, not wrapped in object
      const families = Array.isArray(familiesData) ? familiesData : []
      
      if (families.length === 0) {
        console.log('ResourcesPage - No families found')
        return
      }
      
      const family = families[0]
      setFamilyId(family.id)
      console.log('ResourcesPage - Using family:', family.id)
      
      // Fetch resources
      const resourcesRes = await fetch(`/api/families/${family.id}/resources`)
      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json()
        console.log('ResourcesPage - Resources fetched:', resourcesData.length)
        setResources(resourcesData)
      }
    } catch (error) {
      console.error('ResourcesPage - Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter resources based on search and category
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = activeCategory === 'All Resources' || 
      resource.category.toLowerCase() === activeCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  // Group featured resources (first 3)
  const featuredResources = filteredResources.slice(0, 3)
  
  // Group by category for directory
  const resourcesByCategory = filteredResources.reduce((acc, resource) => {
    const cat = resource.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(resource)
    return acc
  }, {} as Record<string, Resource[]>)

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Community Resources</h1>
              <p className={styles.subtitle}>Discover local and online resources to support caregiving</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search for resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading resources...</p>
            </div>
          ) : (
            <>
              {/* Featured Resources */}
              {featuredResources.length > 0 && (
                <section className={styles.section}>
                  <h2>Featured Resources</h2>
                  <div className={styles.featuredGrid}>
                    {featuredResources.map((resource, index) => {
                      const colors = ['#f97316', '#3b82f6', '#a855f7']
                      const icons = ['🍽️', '🚐', '📍', '🏥', '💰', '⚖️']
                      
                      return (
                        <div key={resource.id} className={styles.featuredCard}>
                          <div className={styles.resourceIcon} style={{ background: colors[index % colors.length] }}>
                            {icons[index % icons.length]}
                          </div>
                          <h3>{resource.title}</h3>
                          <p>{resource.description}</p>
                          {resource.url && (
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className={styles.learnMore}>
                              Learn More <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Resource Directory */}
              <section className={styles.section}>
                <h2>Resource Directory</h2>
                <p className={styles.resultsCount}>
                  {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
                </p>
                
                <div className={styles.categoryTabs}>
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`${styles.categoryTab} ${activeCategory === category ? styles.active : ''}`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className={styles.directoryContent}>
                  {filteredResources.length === 0 ? (
                    <div className={styles.noResources}>
                      <div className={styles.emptyIcon}>🌐</div>
                      <h3>No resources found</h3>
                      <p>Try adjusting your search or category filter</p>
                    </div>
                  ) : (
                    <div className={styles.resourcesList}>
                      {filteredResources.map((resource) => (
                        <Link
                          key={resource.id}
                          href={`/dashboard/resources/${resource.id}`}
                          className={styles.resourceCard}
                        >
                          <div className={styles.resourceHeader}>
                            <h3>{resource.title}</h3>
                            <span className={styles.categoryBadge}>{resource.category}</span>
                          </div>
                          {resource.description && (
                            <p className={styles.resourceDescription}>
                              {resource.description.length > 150 
                                ? `${resource.description.substring(0, 150)}...` 
                                : resource.description}
                            </p>
                          )}
                          <div className={styles.viewDetails}>
                            View Details →
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Tips Section */}
          <section className={styles.tipsSection}>
            <h3>Tip: Making the Most of Resources</h3>
            <p className={styles.tipsIntro}>
              When contacting resources, have the following information ready:
            </p>
            <ul className={styles.tipsList}>
              <li>Specific needs of your loved one</li>
              <li>Insurance information (if applicable)</li>
              <li>Location and transportation requirements</li>
              <li>Questions about cost, availability, and scheduling</li>
            </ul>
            <button className={styles.downloadBtn}>Download Resource Checklist</button>
          </section>
        </main>
      </div>
    </div>
  )
}

