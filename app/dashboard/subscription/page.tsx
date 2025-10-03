'use client'

import { useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import Footer from '@/app/components/Footer'
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
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1) // 1: Payment Info, 2: Review, 3: Success
  const [processing, setProcessing] = useState(false)
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: ''
  })

  const currentPlan = plans.find(p => p.id === selectedPlan)
  const price = billingPeriod === 'monthly' ? currentPlan?.price : currentPlan?.yearlyPrice
  const yearlyTotal = billingPeriod === 'yearly' ? (currentPlan?.yearlyPrice || 0) * 12 : 0
  
  const handleStartCheckout = () => {
    setShowCheckout(true)
    setCheckoutStep(1)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCheckoutStep(2)
  }

  const handleConfirmPayment = async () => {
    setProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      setCheckoutStep(3)
    }, 2000)
  }

  const resetCheckout = () => {
    setShowCheckout(false)
    setCheckoutStep(1)
    setPaymentData({
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvv: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingZip: ''
    })
  }

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

              <button className={styles.subscribeBtn} onClick={handleStartCheckout}>
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

          {/* Checkout Modal */}
          {showCheckout && (
            <div className={styles.modal} onClick={() => !processing && resetCheckout()}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Progress Steps */}
                <div className={styles.checkoutSteps}>
                  <div className={`${styles.step} ${checkoutStep >= 1 ? styles.activeStep : ''}`}>
                    <div className={styles.stepNumber}>1</div>
                    <span>Payment Info</span>
                  </div>
                  <div className={styles.stepLine}></div>
                  <div className={`${styles.step} ${checkoutStep >= 2 ? styles.activeStep : ''}`}>
                    <div className={styles.stepNumber}>2</div>
                    <span>Review</span>
                  </div>
                  <div className={styles.stepLine}></div>
                  <div className={`${styles.step} ${checkoutStep >= 3 ? styles.activeStep : ''}`}>
                    <div className={styles.stepNumber}>3</div>
                    <span>Complete</span>
                  </div>
                </div>

                {/* Step 1: Payment Information */}
                {checkoutStep === 1 && (
                  <form onSubmit={handlePaymentSubmit} className={styles.checkoutForm}>
                    <h2>Payment Information</h2>
                    <p className={styles.checkoutSubtitle}>
                      Subscribe to {currentPlan?.name} - ${price?.toFixed(2)}/{billingPeriod === 'monthly' ? 'month' : 'month (billed yearly)'}
                    </p>

                    <div className={styles.formSection}>
                      <h3>Card Details</h3>
                      <div className={styles.formGroup}>
                        <label>Card Number *</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                          maxLength={19}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Cardholder Name *</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={paymentData.cardName}
                          onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                          required
                        />
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Expiry Date *</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={paymentData.expiry}
                            onChange={(e) => setPaymentData({...paymentData, expiry: e.target.value})}
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>CVV *</label>
                          <input
                            type="text"
                            placeholder="123"
                            value={paymentData.cvv}
                            onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <h3>Billing Address</h3>
                      <div className={styles.formGroup}>
                        <label>Street Address *</label>
                        <input
                          type="text"
                          placeholder="123 Main St"
                          value={paymentData.billingAddress}
                          onChange={(e) => setPaymentData({...paymentData, billingAddress: e.target.value})}
                          required
                        />
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>City *</label>
                          <input
                            type="text"
                            placeholder="Springfield"
                            value={paymentData.billingCity}
                            onChange={(e) => setPaymentData({...paymentData, billingCity: e.target.value})}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>State *</label>
                          <input
                            type="text"
                            placeholder="IL"
                            value={paymentData.billingState}
                            onChange={(e) => setPaymentData({...paymentData, billingState: e.target.value})}
                            maxLength={2}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>ZIP Code *</label>
                          <input
                            type="text"
                            placeholder="62701"
                            value={paymentData.billingZip}
                            onChange={(e) => setPaymentData({...paymentData, billingZip: e.target.value})}
                            maxLength={5}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.checkoutActions}>
                      <button type="button" className={styles.cancelBtn} onClick={resetCheckout}>
                        Cancel
                      </button>
                      <button type="submit" className={styles.nextBtn}>
                        Review Order →
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2: Review & Confirm */}
                {checkoutStep === 2 && (
                  <div className={styles.reviewSection}>
                    <h2>Review Your Order</h2>
                    
                    <div className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <h3>Order Summary</h3>
                      </div>
                      
                      <div className={styles.reviewItem}>
                        <span>Plan:</span>
                        <strong>{currentPlan?.name}</strong>
                      </div>
                      <div className={styles.reviewItem}>
                        <span>Billing Period:</span>
                        <strong>{billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}</strong>
                      </div>
                      {billingPeriod === 'yearly' && (
                        <div className={styles.reviewItem}>
                          <span>You Save:</span>
                          <strong className={styles.savings}>17% (${((currentPlan?.price || 0) * 12 - yearlyTotal).toFixed(2)}/year)</strong>
                        </div>
                      )}
                      <div className={styles.reviewItem}>
                        <span className={styles.totalText}>Total Today:</span>
                        <strong className={styles.totalPrice}>${price?.toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <h3>Payment Method</h3>
                      </div>
                      <div className={styles.reviewItem}>
                        <span>Card:</span>
                        <strong>•••• •••• •••• {paymentData.cardNumber.slice(-4)}</strong>
                      </div>
                      <div className={styles.reviewItem}>
                        <span>Name:</span>
                        <strong>{paymentData.cardName}</strong>
                      </div>
                    </div>

                    <div className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <h3>Billing Address</h3>
                      </div>
                      <p className={styles.addressText}>
                        {paymentData.billingAddress}<br/>
                        {paymentData.billingCity}, {paymentData.billingState} {paymentData.billingZip}
                      </p>
                    </div>

                    <div className={styles.checkoutActions}>
                      <button type="button" className={styles.backBtn} onClick={() => setCheckoutStep(1)}>
                        ← Back
                      </button>
                      <button 
                        type="button" 
                        className={styles.confirmBtn} 
                        onClick={handleConfirmPayment}
                        disabled={processing}
                      >
                        {processing ? 'Processing...' : `Confirm & Pay $${price?.toFixed(2)}`}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Success */}
                {checkoutStep === 3 && (
                  <div className={styles.successSection}>
                    <div className={styles.successIcon}>✓</div>
                    <h2>Subscription Activated!</h2>
                    <p className={styles.successMessage}>
                      Welcome to CareShare {currentPlan?.name}! Your subscription is now active.
                    </p>

                    <div className={styles.successDetails}>
                      <div className={styles.successItem}>
                        <span>Plan:</span>
                        <strong>{currentPlan?.name}</strong>
                      </div>
                      <div className={styles.successItem}>
                        <span>Amount Charged:</span>
                        <strong>${price?.toFixed(2)}</strong>
                      </div>
                      <div className={styles.successItem}>
                        <span>Next Billing Date:</span>
                        <strong>
                          {new Date(Date.now() + (billingPeriod === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>

                    <p className={styles.confirmationNote}>
                      A confirmation email has been sent to your email address.
                    </p>

                    <button className={styles.doneBtn} onClick={resetCheckout}>
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
