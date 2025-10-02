'use client'

import { useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Search, Coffee, UtensilsCrossed, Film, Plane, Gift, Package } from 'lucide-react'
import styles from './page.module.css'

type Category = 'All' | 'Coffee' | 'Food' | 'Movies' | 'Travel' | 'Gifts'

type FeaturedGift = {
  id: string
  name: string
  vendor: string
  description: string
  price: number
  category: Category
}

type Vendor = {
  id: string
  name: string
  category: Category
  icon: string
  description: string
  longDescription: string
}

const featuredGifts: FeaturedGift[] = [
  {
    id: '1',
    name: '$25 Starbucks Gift Card',
    vendor: 'Starbucks',
    description: 'A $25 gift card for coffee, tea, and treats at Starbucks.',
    price: 25.00,
    category: 'Coffee'
  },
  {
    id: '2',
    name: '$25 Amazon Gift Card',
    vendor: 'Amazon',
    description: 'A $25 Amazon gift card for millions of items.',
    price: 25.00,
    category: 'Gifts'
  },
  {
    id: '3',
    name: '3 Month Netflix Subscription',
    vendor: 'Netflix',
    description: 'A 3-month subscription to Netflix Standard with HD.',
    price: 46.47,
    category: 'Movies'
  },
  {
    id: '4',
    name: '$100 Airbnb Gift Card',
    vendor: 'Airbnb',
    description: 'A $100 gift card for stays anywhere on Airbnb.',
    price: 100.00,
    category: 'Travel'
  }
]

const vendors: Vendor[] = [
  {
    id: '1',
    name: 'Starbucks',
    category: 'Coffee',
    icon: '☕',
    description: 'Treat your loved one to their favorite coffee and snacks at ...',
    longDescription: 'Treat your loved one to their favorite coffee and snacks at Starbucks.'
  },
  {
    id: '2',
    name: 'Amazon',
    category: 'Gifts',
    icon: '🎁',
    description: 'Give the gift of choice with an Amazon gift card that can be...',
    longDescription: 'Give the gift of choice with an Amazon gift card that can be used for millions of items.'
  },
  {
    id: '3',
    name: 'Netflix',
    category: 'Movies',
    icon: '🎬',
    description: 'Gift access to thousands of movies and TV shows with a Netfl...',
    longDescription: 'Gift access to thousands of movies and TV shows with a Netflix gift subscription.'
  },
  {
    id: '4',
    name: 'Cheesecake Factory',
    category: 'Food',
    icon: '🍽️',
    description: 'Treat your loved one to a delicious meal at The Cheesecake F...',
    longDescription: 'Treat your loved one to a delicious meal at The Cheesecake Factory.'
  },
  {
    id: '5',
    name: 'Airbnb',
    category: 'Travel',
    icon: '✈️',
    description: 'Gift an unforgettable stay with an Airbnb gift card that can...',
    longDescription: 'Gift an unforgettable stay with an Airbnb gift card that can be used anywhere in the world.'
  },
  {
    id: '6',
    name: 'AMC Theatres',
    category: 'Movies',
    icon: '🎬',
    description: 'Treat your loved one to a movie night with popcorn and their...',
    longDescription: 'Treat your loved one to a movie night with popcorn and their favorite snacks.'
  },
  {
    id: '7',
    name: "Dunkin' Donuts",
    category: 'Coffee',
    icon: '☕',
    description: "America runs on Dunkin'! Gift your loved one their favorite ...",
    longDescription: "America runs on Dunkin'! Gift your loved one their favorite coffee and donuts."
  },
  {
    id: '8',
    name: 'Olive Garden',
    category: 'Food',
    icon: '🍽️',
    description: 'Treat your loved one to an Italian feast at Olive Garden....',
    longDescription: 'Treat your loved one to an Italian feast at Olive Garden.'
  },
  {
    id: '9',
    name: 'DoorDash',
    category: 'Food',
    icon: '🍽️',
    description: 'Food delivery service from local restaurants...',
    longDescription: 'Food delivery service from local restaurants.'
  },
  {
    id: '10',
    name: 'Uber Eats',
    category: 'Food',
    icon: '🍽️',
    description: 'Food delivery service with wide coverage area...',
    longDescription: 'Food delivery service with wide coverage area.'
  }
]

const categoryIcons = {
  All: Package,
  Coffee: Coffee,
  Food: UtensilsCrossed,
  Movies: Film,
  Travel: Plane,
  Gifts: Gift
}

export default function GiftMarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories: Category[] = ['All', 'Coffee', 'Food', 'Movies', 'Travel', 'Gifts']

  const filteredVendors = vendors.filter(vendor => {
    const matchesCategory = activeCategory === 'All' || vendor.category === activeCategory
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredFeaturedGifts = featuredGifts.filter(gift => {
    const matchesCategory = activeCategory === 'All' || gift.category === activeCategory
    return matchesCategory
  })

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Gift Marketplace</h1>
              <p className={styles.subtitle}>Purchase gift cards and services for your loved ones</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className={styles.categoryTabs}>
            {categories.map((category) => {
              const Icon = categoryIcons[category]
              return (
                <button
                  key={category}
                  className={`${styles.categoryTab} ${activeCategory === category ? styles.activeCategory : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  <Icon size={18} />
                  {category}
                </button>
              )
            })}
          </div>

          {/* Search Bar */}
          <div className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Featured Gifts */}
          {filteredFeaturedGifts.length > 0 && (
            <section className={styles.featuredSection}>
              <h2>✨ Featured Gifts</h2>
              <div className={styles.featuredGrid}>
                {filteredFeaturedGifts.map((gift) => (
                  <div key={gift.id} className={styles.featuredCard}>
                    <h3>{gift.name}</h3>
                    <p className={styles.vendor}>{gift.vendor}</p>
                    <p className={styles.description}>{gift.description}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.price}>${gift.price.toFixed(2)}</span>
                      <button className={styles.purchaseBtn}>Purchase</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Vendors */}
          <section className={styles.vendorsSection}>
            <h2>All Vendors</h2>
            <div className={styles.vendorsGrid}>
              {filteredVendors.map((vendor) => {
                const Icon = categoryIcons[vendor.category]
                return (
                  <div key={vendor.id} className={styles.vendorCard}>
                    <div className={styles.vendorHeader}>
                      <h3>{vendor.name}</h3>
                      <div className={styles.categoryBadge}>
                        <Icon size={14} />
                        {vendor.category}
                      </div>
                    </div>
                    <p className={styles.vendorDescription}>{vendor.description}</p>
                    <p className={styles.vendorLongDescription}>{vendor.longDescription}</p>
                    <button className={styles.viewCardsBtn}>
                      <Gift size={16} />
                      View gift cards
                    </button>
                  </div>
                )
              })}
            </div>

            {filteredVendors.length === 0 && (
              <div className={styles.emptyState}>
                <p>No vendors found matching your search.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
