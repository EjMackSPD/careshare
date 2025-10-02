'use client'

import { useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Info } from 'lucide-react'
import styles from './page.module.css'

type Service = {
  id: string
  title: string
  description: string
}

const recommendedServices: Service[] = [
  {
    id: '1',
    title: 'Regular Home Health Aide',
    description: '10-20 hours weekly'
  },
  {
    id: '2',
    title: 'Medication Management',
    description: 'Daily reminders'
  },
  {
    id: '3',
    title: 'Transportation Services',
    description: 'For medical appointments and essential errands'
  },
  {
    id: '4',
    title: 'Meal Services',
    description: 'Meal delivery 3-5 days/week'
  }
]

export default function CarePlanPage() {
  const [activeTab, setActiveTab] = useState('Current Care')
  const tabs = ['Current Care', 'Important Documents', 'Care Scenarios']

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Care Planning</h1>
              <p className={styles.subtitle}>Manage care details, documents, and future planning</p>
            </div>
            <button className={styles.editBtn}>Edit Care Plan</button>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Care Level & Needs */}
          <div className={styles.careLevelSection}>
            <h2>Care Level & Needs</h2>
            
            <div className={styles.careLevelGrid}>
              <div className={styles.careLevelCard}>
                <div className={styles.levelBadge}>
                  <span>Moderate</span>
                  <Info size={16} />
                </div>
                <p className={styles.levelDescription}>
                  Needs help with some daily activities, medication management, and transportation.
                </p>
                
                <div className={styles.costEstimate}>
                  <strong>Estimated Monthly Costs</strong>
                  <p className={styles.costRange}>$22 - $26</p>
                </div>
              </div>

              <div className={styles.careNotesCard}>
                <h3>Care Notes</h3>
                <p>
                  Martha requires regular assistance with daily activities, medication management, and transportation to 
                  medical appointments. We're looking into part-time in-home care services to supplement family support.
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Services */}
          <div className={styles.servicesSection}>
            <h2>Recommended Services</h2>
            <div className={styles.servicesGrid}>
              {recommendedServices.map((service) => (
                <div key={service.id} className={styles.serviceCard}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

