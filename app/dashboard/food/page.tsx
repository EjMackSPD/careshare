'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Search, ShoppingCart, Clock, DollarSign, ExternalLink } from 'lucide-react'
import styles from './page.module.css'

type Restaurant = {
  id: string
  name: string
  category: string
  deliveryTime: string
  minOrder: number
  deliveryFee: number
  icon: string
  featured?: boolean
}

type Family = {
  id: string
  name: string
  elderName?: string
}

const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Healthy Bites',
    category: 'Healthy',
    deliveryTime: '25-35 min',
    minOrder: 15,
    deliveryFee: 3.99,
    icon: '🥦',
    featured: true
  },
  {
    id: '2',
    name: 'Comfort Kitchen',
    category: 'American',
    deliveryTime: '30-45 min',
    minOrder: 12,
    deliveryFee: 2.99,
    icon: '🍔'
  },
  {
    id: '3',
    name: 'Fresh Greens Salad Bar',
    category: 'Healthy',
    deliveryTime: '20-30 min',
    minOrder: 18,
    deliveryFee: 4.99,
    icon: '🥗',
    featured: true
  },
  {
    id: '4',
    name: "Nonna's Italian",
    category: 'Italian',
    deliveryTime: '35-50 min',
    minOrder: 20,
    deliveryFee: 4.99,
    icon: '🍝'
  },
  {
    id: '5',
    name: 'Golden Dragon',
    category: 'Chinese',
    deliveryTime: '30-45 min',
    minOrder: 15,
    deliveryFee: 3.49,
    icon: '🍱'
  },
  {
    id: '6',
    name: 'Sunrise Breakfast',
    category: 'Breakfast',
    deliveryTime: '20-30 min',
    minOrder: 12,
    deliveryFee: 2.99,
    icon: '🍳',
    featured: true
  }
]

const cuisines = ['All Cuisines', 'Healthy', 'American', 'Italian', 'Chinese', 'Breakfast']

export default function FoodDeliveryPage() {
  const [activeTab, setActiveTab] = useState('Restaurants')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('All Cuisines')
  const [families, setFamilies] = useState<Family[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const tabs = ['Restaurants', 'Menu', 'Cart']

  // Fetch families
  useEffect(() => {
    async function fetchFamilies() {
      try {
        const res = await fetch('/api/families')
        if (!res.ok) throw new Error('Failed to fetch families')
        const data = await res.json()
        setFamilies(data)
        if (data.length > 0) {
          setSelectedFamily(data[0].id)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching families:', error)
        setLoading(false)
      }
    }
    fetchFamilies()
  }, [])

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCuisine = selectedCuisine === 'All Cuisines' || restaurant.category === selectedCuisine
    return matchesSearch && matchesCuisine
  })

  const selectedFamilyData = families.find(f => f.id === selectedFamily)
  const orderForName = selectedFamilyData?.elderName || selectedFamilyData?.name || 'Select family'

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Food Delivery</h1>
              <p className={styles.subtitle}>Order food from local restaurants for your loved ones</p>
            </div>
          </div>

          <div className={styles.contentWrapper}>
            <div className={styles.leftContent}>
              {/* Order For */}
              <div className={styles.orderForSection}>
                <label>Order For</label>
                <select 
                  value={selectedFamily} 
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className={styles.familySelect}
                  disabled={loading}
                >
                  {loading ? (
                    <option>Loading...</option>
                  ) : families.length === 0 ? (
                    <option>No families found</option>
                  ) : (
                    families.map(family => (
                      <option key={family.id} value={family.id}>
                        {family.elderName || family.name}
                      </option>
                    ))
                  )}
                </select>
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

              {/* Search and Filter */}
              <div className={styles.searchFilterRow}>
                <div className={styles.searchBar}>
                  <Search size={20} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search for restaurants or cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className={styles.cuisineFilter}
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                >
                  {cuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              {/* Restaurant Cards */}
              <div className={styles.restaurantsGrid}>
                {filteredRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className={styles.restaurantCard}>
                    {restaurant.featured && (
                      <span className={styles.featuredBadge}>Featured</span>
                    )}
                    <div className={styles.restaurantIcon}>{restaurant.icon}</div>
                    <h3>{restaurant.name}</h3>
                    <p className={styles.category}>{restaurant.category}</p>
                    
                    <div className={styles.restaurantDetails}>
                      <div className={styles.detailItem}>
                        <Clock size={14} />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Min:</span>
                        <span>${restaurant.minOrder}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>
                          ${restaurant.deliveryFee.toFixed(2)} delivery
                        </span>
                      </div>
                    </div>

                    <button className={styles.orderBtn}>
                      <ExternalLink size={16} />
                      Order via DoorDash
                    </button>
                  </div>
                ))}
              </div>

              {filteredRestaurants.length === 0 && (
                <div className={styles.emptyState}>
                  <p>No restaurants found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Right Sidebar - Cart */}
            <aside className={styles.cartSidebar}>
              <div className={styles.cartHeader}>
                <h2>Your Order</h2>
                <p>Add items to your cart to place an order</p>
              </div>

              <div className={styles.emptyCart}>
                <ShoppingCart size={64} strokeWidth={1} />
                <p>Your cart is empty</p>
              </div>

              <button className={styles.checkoutBtn} disabled>
                Checkout
              </button>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
