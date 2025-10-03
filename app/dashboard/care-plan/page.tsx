'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Info } from 'lucide-react'
import styles from './page.module.css'

type Service = {
  id: string
  title: string
  description: string
  link?: string
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
    description: 'Daily reminders',
    link: '/dashboard/medications'
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

          {/* Current Care Tab */}
          {activeTab === 'Current Care' && (
            <>
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
                    service.link ? (
                      <Link key={service.id} href={service.link} className={styles.serviceCardLink}>
                        <div className={styles.serviceCard}>
                          <h3>{service.title}</h3>
                          <p>{service.description}</p>
                          <span className={styles.viewLink}>View & Manage →</span>
                        </div>
                      </Link>
                    ) : (
                      <div key={service.id} className={styles.serviceCard}>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Daily Activities */}
              <div className={styles.activitiesSection}>
                <h2>Daily Activities & Support</h2>
                <div className={styles.activitiesGrid}>
                  <div className={styles.activityCard}>
                    <div className={styles.activityIcon}>🛁</div>
                    <h3>Personal Care</h3>
                    <p>Needs assistance with bathing and dressing</p>
                    <span className={styles.supportLevel}>Daily Support Required</span>
                  </div>
                  <div className={styles.activityCard}>
                    <div className={styles.activityIcon}>🍽️</div>
                    <h3>Meal Preparation</h3>
                    <p>Can prepare simple meals with supervision</p>
                    <span className={styles.supportLevel}>Occasional Support</span>
                  </div>
                  <div className={styles.activityCard}>
                    <div className={styles.activityIcon}>🚗</div>
                    <h3>Transportation</h3>
                    <p>Requires transportation for appointments</p>
                    <span className={styles.supportLevel}>Weekly Support</span>
                  </div>
                  <div className={styles.activityCard}>
                    <div className={styles.activityIcon}>💊</div>
                    <h3>Medication</h3>
                    <p>Needs reminders and monitoring</p>
                    <span className={styles.supportLevel}>Daily Support Required</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Important Documents Tab */}
          {activeTab === 'Important Documents' && (
            <div className={styles.documentsSection}>
              <div className={styles.documentsHeader}>
                <h2>Important Documents</h2>
                <button className={styles.uploadBtn}>+ Upload Document</button>
              </div>

              <div className={styles.documentCategories}>
                {/* Medical Documents */}
                <div className={styles.documentCategory}>
                  <div className={styles.categoryHeader}>
                    <h3>📋 Medical Records</h3>
                    <span className={styles.documentCount}>3 documents</span>
                  </div>
                  <div className={styles.documentsList}>
                    <div className={styles.documentItem}>
                      <div className={styles.documentIcon}>📄</div>
                      <div className={styles.documentInfo}>
                        <h4>Medical History Summary</h4>
                        <p>Last updated: Oct 15, 2024</p>
                      </div>
                      <div className={styles.documentActions}>
                        <button className={styles.viewDocBtn}>View</button>
                        <button className={styles.downloadBtn}>Download</button>
                      </div>
                    </div>
                    <div className={styles.documentItem}>
                      <div className={styles.documentIcon}>📄</div>
                      <div className={styles.documentInfo}>
                        <h4>Current Medications List</h4>
                        <p>Last updated: Oct 20, 2024</p>
                      </div>
                      <div className={styles.documentActions}>
                        <button className={styles.viewDocBtn}>View</button>
                        <button className={styles.downloadBtn}>Download</button>
                      </div>
                    </div>
                    <div className={styles.documentItem}>
                      <div className={styles.documentIcon}>📄</div>
                      <div className={styles.documentInfo}>
                        <h4>Allergy Information</h4>
                        <p>Last updated: Sep 5, 2024</p>
                      </div>
                      <div className={styles.documentActions}>
                        <button className={styles.viewDocBtn}>View</button>
                        <button className={styles.downloadBtn}>Download</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Documents */}
                <div className={styles.documentCategory}>
                  <div className={styles.categoryHeader}>
                    <h3>⚖️ Legal Documents</h3>
                    <span className={styles.documentCount}>2 documents</span>
                  </div>
                  <div className={styles.documentsList}>
                    <div className={styles.documentItem}>
                      <div className={styles.documentIcon}>📄</div>
                      <div className={styles.documentInfo}>
                        <h4>Healthcare Power of Attorney</h4>
                        <p>Last updated: Jan 10, 2024</p>
                      </div>
                      <div className={styles.documentActions}>
                        <button className={styles.viewDocBtn}>View</button>
                        <button className={styles.downloadBtn}>Download</button>
                      </div>
                    </div>
                    <div className={styles.documentItem}>
                      <div className={styles.documentIcon}>📄</div>
                      <div className={styles.documentInfo}>
                        <h4>Living Will</h4>
                        <p>Last updated: Jan 10, 2024</p>
                      </div>
                      <div className={styles.documentActions}>
                        <button className={styles.viewDocBtn}>View</button>
                        <button className={styles.downloadBtn}>Download</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insurance Documents */}
                <div className={styles.documentCategory}>
                  <div className={styles.categoryHeader}>
                    <h3>🏥 Insurance & Financial</h3>
                    <span className={styles.documentCount}>2 documents</span>
                  </div>
                  <div className={styles.documentsList}>
                    <div className={styles.documentItem}>
                      <div className={styles.documentIcon}>📄</div>
                      <div className={styles.documentInfo}>
                        <h4>Medicare Card (Copy)</h4>
                        <p>Last updated: Aug 1, 2024</p>
                      </div>
                      <div className={styles.documentActions}>
                        <button className={styles.viewDocBtn}>View</button>
                        <button className={styles.downloadBtn}>Download</button>
                      </div>
                    </div>
                    <div className={styles.documentItem}>
                      <div className={styles.documentIcon}>📄</div>
                      <div className={styles.documentInfo}>
                        <h4>Supplemental Insurance Policy</h4>
                        <p>Last updated: Jul 15, 2024</p>
                      </div>
                      <div className={styles.documentActions}>
                        <button className={styles.viewDocBtn}>View</button>
                        <button className={styles.downloadBtn}>Download</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Care Scenarios Tab */}
          {activeTab === 'Care Scenarios' && (
            <div className={styles.scenariosSection}>
              <div className={styles.scenariosHeader}>
                <h2>Care Scenarios & Planning</h2>
                <p className={styles.subtitle}>Prepare for different situations and plan ahead</p>
              </div>

              {/* Emergency Scenarios */}
              <div className={styles.scenarioCategory}>
                <h3>Emergency Situations</h3>
                <div className={styles.scenariosGrid}>
                  <div className={styles.scenarioCard}>
                    <div className={styles.scenarioHeader}>
                      <div className={styles.scenarioIcon}>🚨</div>
                      <h4>Medical Emergency</h4>
                    </div>
                    <div className={styles.scenarioContent}>
                      <div className={styles.scenarioItem}>
                        <strong>Primary Contact:</strong>
                        <p>Dr. Sarah Johnson - (555) 987-6543</p>
                      </div>
                      <div className={styles.scenarioItem}>
                        <strong>Hospital Preference:</strong>
                        <p>Springfield Medical Center</p>
                      </div>
                      <div className={styles.scenarioItem}>
                        <strong>Family Contact Order:</strong>
                        <p>1. John (Son) - (555) 123-4567<br/>2. Sarah (Daughter) - (555) 234-5678</p>
                      </div>
                    </div>
                    <button className={styles.editScenarioBtn}>Edit Plan</button>
                  </div>

                  <div className={styles.scenarioCard}>
                    <div className={styles.scenarioHeader}>
                      <div className={styles.scenarioIcon}>🏥</div>
                      <h4>Hospitalization</h4>
                    </div>
                    <div className={styles.scenarioContent}>
                      <div className={styles.scenarioItem}>
                        <strong>Care Coordinator:</strong>
                        <p>John Johnson (Primary)</p>
                      </div>
                      <div className={styles.scenarioItem}>
                        <strong>Home Care During:</strong>
                        <p>Pet care needed - Contact neighbor Mary</p>
                      </div>
                      <div className={styles.scenarioItem}>
                        <strong>Insurance Info:</strong>
                        <p>Medicare + Supplemental (Card on file)</p>
                      </div>
                    </div>
                    <button className={styles.editScenarioBtn}>Edit Plan</button>
                  </div>
                </div>
              </div>

              {/* Care Level Changes */}
              <div className={styles.scenarioCategory}>
                <h3>Care Level Changes</h3>
                <div className={styles.scenariosGrid}>
                  <div className={styles.scenarioCard}>
                    <div className={styles.scenarioHeader}>
                      <div className={styles.scenarioIcon}>📈</div>
                      <h4>Increased Care Needs</h4>
                    </div>
                    <div className={styles.scenarioContent}>
                      <div className={styles.scenarioItem}>
                        <strong>Trigger Points:</strong>
                        <p>• Multiple falls in 30 days<br/>• Confusion or memory issues<br/>• Unable to manage medications</p>
                      </div>
                      <div className={styles.scenarioItem}>
                        <strong>Next Steps:</strong>
                        <p>1. Family meeting to discuss options<br/>2. Consult with home health agency<br/>3. Consider assisted living facilities</p>
                      </div>
                    </div>
                    <button className={styles.editScenarioBtn}>Edit Plan</button>
                  </div>

                  <div className={styles.scenarioCard}>
                    <div className={styles.scenarioHeader}>
                      <div className={styles.scenarioIcon}>🏠</div>
                      <h4>Transition to Assisted Living</h4>
                    </div>
                    <div className={styles.scenarioContent}>
                      <div className={styles.scenarioItem}>
                        <strong>Preferred Facilities:</strong>
                        <p>1. Sunshine Senior Living<br/>2. Maple Grove Community<br/>3. Heritage Assisted Living</p>
                      </div>
                      <div className={styles.scenarioItem}>
                        <strong>Budget Allocation:</strong>
                        <p>$4,500/month from estate + family contributions</p>
                      </div>
                    </div>
                    <button className={styles.editScenarioBtn}>Edit Plan</button>
                  </div>
                </div>
              </div>

              {/* End of Life Planning */}
              <div className={styles.scenarioCategory}>
                <h3>End of Life Preferences</h3>
                <div className={styles.endOfLifeCard}>
                  <div className={styles.endOfLifeContent}>
                    <div className={styles.scenarioItem}>
                      <strong>DNR Status:</strong>
                      <p>Yes - Document on file</p>
                    </div>
                    <div className={styles.scenarioItem}>
                      <strong>Hospice Preference:</strong>
                      <p>Home hospice with family present</p>
                    </div>
                    <div className={styles.scenarioItem}>
                      <strong>Funeral Arrangements:</strong>
                      <p>Pre-planned with Springfield Funeral Home<br/>Contact: (555) 789-0123</p>
                    </div>
                    <div className={styles.scenarioItem}>
                      <strong>Family Wishes:</strong>
                      <p>Memorial service at St. Mary's Church<br/>Cremation with ashes spread at the family cabin</p>
                    </div>
                  </div>
                  <button className={styles.editScenarioBtn}>Edit Preferences</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}

