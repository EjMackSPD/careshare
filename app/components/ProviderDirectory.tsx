'use client'

import { useState } from 'react'
import Footer from '@/app/components/Footer'
import { Search, HeartPulse, UtensilsCrossed, Car, Users, HandHeart, Scale, Stethoscope, Package, ShieldCheck, Phone, Mail, Globe, MapPin } from 'lucide-react'
import type { Provider } from '@/lib/cms'
import styles from './ProviderDirectory.module.css'

const categoryLabels: Record<string, string> = {
  HOME_HEALTH_AIDE: 'Home Health Aide',
  MEAL_DELIVERY: 'Meal Delivery',
  TRANSPORTATION: 'Transportation',
  ADULT_DAY_CARE: 'Adult Day Care',
  RESPITE_CARE: 'Respite Care',
  LEGAL_FINANCIAL: 'Legal & Financial',
  MEDICAL_EQUIPMENT: 'Medical Equipment',
}

const categoryIcons: Record<string, typeof HeartPulse> = {
  HOME_HEALTH_AIDE: HeartPulse,
  MEAL_DELIVERY: UtensilsCrossed,
  TRANSPORTATION: Car,
  ADULT_DAY_CARE: Users,
  RESPITE_CARE: HandHeart,
  LEGAL_FINANCIAL: Scale,
  MEDICAL_EQUIPMENT: Stethoscope,
}

export default function ProviderDirectory({ providers }: { providers: Provider[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['All', ...Array.from(new Set(providers.map((provider) => provider.category)))]

  const filteredProviders = providers.filter((provider) => {
    const matchesCategory = activeCategory === 'All' || provider.category === activeCategory
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Find a Provider</h1>
              <p className={styles.subtitle}>Browse vetted care providers for your family</p>
            </div>
          </div>

          <div className={styles.categoryTabs}>
            {categories.map((category) => {
              const Icon = category === 'All' ? Package : categoryIcons[category] ?? Package
              return (
                <button
                  key={category}
                  className={`${styles.categoryTab} ${activeCategory === category ? styles.activeCategory : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  <Icon size={18} />
                  {category === 'All' ? 'All' : categoryLabels[category] ?? category}
                </button>
              )
            })}
          </div>

          <div className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <section className={styles.providersSection}>
            <div className={styles.providersGrid}>
              {filteredProviders.map((provider) => {
                const Icon = categoryIcons[provider.category] ?? Package
                return (
                  <div key={provider.id} className={styles.providerCard}>
                    <div className={styles.providerHeader}>
                      <h3>{provider.name}</h3>
                      <div className={styles.categoryBadge}>
                        <Icon size={14} />
                        {categoryLabels[provider.category] ?? provider.category}
                      </div>
                    </div>

                    {provider.vetted && (
                      <div className={styles.vettedBadge}>
                        <ShieldCheck size={14} />
                        Vetted by CareShare
                      </div>
                    )}

                    <p className={styles.description}>{provider.description}</p>

                    <div className={styles.contactList}>
                      {provider.serviceArea && (
                        <span className={styles.contactItem}>
                          <MapPin size={14} /> {provider.serviceArea}
                        </span>
                      )}
                      {provider.phone && (
                        <span className={styles.contactItem}>
                          <Phone size={14} /> {provider.phone}
                        </span>
                      )}
                      {provider.email && (
                        <span className={styles.contactItem}>
                          <Mail size={14} /> {provider.email}
                        </span>
                      )}
                      {provider.website && (
                        <a
                          className={styles.contactItem}
                          href={provider.website}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Globe size={14} /> {provider.website}
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredProviders.length === 0 && (
              <div className={styles.emptyState}>
                <p>
                  {providers.length === 0
                    ? 'No providers have been added yet.'
                    : 'No providers found matching your search.'}
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  )
}
