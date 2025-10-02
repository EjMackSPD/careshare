'use client'

import { useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Search, ExternalLink, Phone, MapPin, Utensils, Bus, Home as HomeIcon } from 'lucide-react'
import styles from './page.module.css'

type FeaturedResource = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  link: string
}

type LocalResource = {
  id: string
  name: string
  category: string
  distance?: string
  phone: string
}

const featuredResources: FeaturedResource[] = [
  {
    id: '1',
    name: 'Meals on Wheels',
    description: 'Meal delivery service for seniors who have difficulty shopping for or preparing meals.',
    icon: '🍽️',
    color: '#f97316',
    link: '#'
  },
  {
    id: '2',
    name: 'Senior Transportation Services',
    description: 'Door-to-door transportation for medical appointments and essential errands.',
    icon: '🚐',
    color: '#3b82f6',
    link: '#'
  },
  {
    id: '3',
    name: 'Eldercare Locator',
    description: 'A nationwide service that connects older Americans and their caregivers with local support resources.',
    icon: '📍',
    color: '#a855f7',
    link: '#'
  }
]

const localResources: LocalResource[] = [
  {
    id: '1',
    name: 'Community Senior Center',
    category: 'Social',
    distance: '3.1 miles away',
    phone: '(555) 123-4567'
  },
  {
    id: '2',
    name: 'Home Health Care Agency',
    category: 'Healthcare',
    distance: '3.4 miles away',
    phone: '(555) 987-6543'
  },
  {
    id: '3',
    name: 'Senior Grocery Delivery',
    category: 'Nutrition',
    distance: 'Service Area',
    phone: '(555) 456-7890'
  }
]

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Resources')

  const categories = ['All Resources', 'Nutrition', 'Social', 'Fitness', 'Healthcare', 'Transportation', 'Housing']

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

          {/* Featured Resources */}
          <section className={styles.section}>
            <h2>Featured Resources</h2>
            <div className={styles.featuredGrid}>
              {featuredResources.map((resource) => (
                <div key={resource.id} className={styles.featuredCard}>
                  <div className={styles.resourceIcon} style={{ background: resource.color }}>
                    {resource.icon}
                  </div>
                  <h3>{resource.name}</h3>
                  <p>{resource.description}</p>
                  <a href={resource.link} className={styles.learnMore}>
                    Learn More <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Resources Near You */}
          <section className={styles.section}>
            <h2>Resources Near You</h2>
            <div className={styles.localResources}>
              {localResources.map((resource) => (
                <div key={resource.id} className={styles.localCard}>
                  <div className={styles.localInfo}>
                    <div>
                      <h3>{resource.name}</h3>
                      <span className={styles.categoryTag}>{resource.category}</span>
                    </div>
                    <p className={styles.distance}>
                      <MapPin size={14} /> {resource.distance}
                    </p>
                  </div>
                  <div className={styles.localActions}>
                    <span className={styles.phone}>
                      <Phone size={14} /> {resource.phone}
                    </span>
                    <button className={styles.connectBtn}>Connect</button>
                  </div>
                </div>
              ))}
              <a href="#" className={styles.viewMoreLink}>View More Local Resources</a>
            </div>
          </section>

          {/* Resource Directory */}
          <section className={styles.section}>
            <h2>Resource Directory</h2>
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
              <div className={styles.noResources}>
                <div className={styles.emptyIcon}>🌐</div>
                <h3>No resources found</h3>
                <p>No resources available in this category</p>
              </div>
            </div>
          </section>

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

