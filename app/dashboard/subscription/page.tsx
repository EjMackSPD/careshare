'use client'

import { useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Check, Info, Users, Calendar, Wallet, UtensilsCrossed, Gift, Shield, Upload, Image as ImageIcon, Mic, Video, Book, Share2 } from 'lucide-react'
import styles from './page.module.css'

type BillingPeriod = 'monthly' | 'yearly'

type Plan = {
  id: string
  name: string
  price: number
  yearlyPrice: number
  description: string
  popular?: boolean
  features: {
    icon: any
    text: string
  }[]
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    yearlyPrice: 8.29,
    description: 'Essential caregiving coordination',
    features: [
      { icon: Users, text: 'Up to 3 family members' },
      { icon: Calendar, text: 'Basic calendar & scheduling' },
      { icon: Wallet, text: 'Basic expense tracking' },
      { icon: UtensilsCrossed, text: 'Food delivery coordination' }
    ]
  },
  {
    id: 'family',
    name: 'Family',
    price: 19.99,
    yearlyPrice: 16.59,
    description: 'Complete family caregiving solution',
    popular: true,
    features: [
      { icon: Users, text: 'Unlimited family members' },
      { icon: Calendar, text: 'Shared calendar & scheduling' },
      { icon: Wallet, text: 'Advanced expense tracking & splitting' },
      { icon: UtensilsCrossed, text: 'Food delivery coordination' },
      { icon: Gift, text: 'Gift purchasing' },
      { icon: Shield, text: 'Priority support' }
    ]
  },
  {
    id: 'forever',
    name: 'Forever',
    price: 29.99,
    yearlyPrice: 24.89,
    description: 'Complete with memory preservation',
    features: [
      { icon: Users, text: 'Unlimited family members' },
      { icon: Calendar, text: 'Advanced calendar & scheduling' },
      { icon: Wallet, text: 'Advanced expense tracking & splitting' },
      { icon: UtensilsCrossed, text: 'Food delivery coordination' },
      { icon: Gift, text: 'Gift purchasing' },
      { icon: Shield, text: 'Priority support' },
      { icon: Upload, text: 'Unlimited memory uploads' },
      { icon: ImageIcon, text: 'Photo preservation' },
      { icon: Mic, text: 'Audio recordings' },
      { icon: Video, text: 'Video memories' },
      { icon: Book, text: 'Life story collections' },
      { icon: Share2, text: 'Family sharing' }
    ]
  }
]

export default function SubscriptionPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [selectedPlan, setSelectedPlan] = useState('family')

  const currentPlan = plans.find(p => p.id === selectedPlan)
  const price = billingPeriod === 'monthly' ? currentPlan?.price : currentPlan?.yearlyPrice

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <h1>Choose Your Plan</h1>
          </div>

          {/* Demo Mode Banner */}
          <div className={styles.demoBanner}>
            <Info size={20} />
            <span>You're in demo mode. No actual billing will occur.</span>
          </div>

          {/* Billing Toggle */}
          <div className={styles.billingToggle}>
            <button
              className={`${styles.toggleBtn} ${billingPeriod === 'monthly' ? styles.activeToggle : ''}`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={`${styles.toggleBtn} ${billingPeriod === 'yearly' ? styles.activeToggle : ''}`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yearly
              <span className={styles.saveBadge}>Save 17%</span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className={styles.pricingGrid}>
            {plans.map((plan) => {
              const planPrice = billingPeriod === 'monthly' ? plan.price : plan.yearlyPrice
              const isSelected = selectedPlan === plan.id

              return (
                <div
                  key={plan.id}
                  className={`${styles.pricingCard} ${plan.popular ? styles.popularCard : ''} ${isSelected ? styles.selectedCard : ''}`}
                >
                  {plan.popular && (
                    <div className={styles.popularBadge}>Most Popular</div>
                  )}

                  <h3>{plan.name}</h3>
                  <p className={styles.planDescription}>{plan.description}</p>

                  <div className={styles.priceSection}>
                    <span className={styles.price}>${planPrice.toFixed(2)}</span>
                    <span className={styles.period}>/{billingPeriod === 'monthly' ? 'month' : 'month'}</span>
                  </div>

                  <div className={styles.features}>
                    {plan.features.map((feature, idx) => {
                      const Icon = feature.icon
                      return (
                        <div key={idx} className={styles.feature}>
                          <Icon size={18} className={styles.featureIcon} />
                          <span>{feature.text}</span>
                        </div>
                      )
                    })}
                  </div>

                  {isSelected ? (
                    <button className={styles.selectedBtn}>
                      Selected
                    </button>
                  ) : (
                    <button
                      className={styles.selectBtn}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      Select Plan
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Checkout Section */}
          <div className={styles.checkoutSection}>
            <div className={styles.checkoutCard}>
              <h2>Complete Your Subscription</h2>
              <p className={styles.checkoutSubtitle}>
                {currentPlan?.name} plan with {billingPeriod} billing
              </p>

              <div className={styles.totalSection}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalAmount}>${price?.toFixed(2)}</span>
              </div>

              <button className={styles.subscribeBtn}>
                Subscribe Now
                <span className={styles.arrow}>→</span>
              </button>
            </div>
          </div>

          {/* Guarantee */}
          <div className={styles.guarantee}>
            <Check size={20} className={styles.guaranteeIcon} />
            <div>
              <strong>30-Day Money Back Guarantee</strong>
              <p>Not satisfied? Get a full refund within the first 30 days.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
