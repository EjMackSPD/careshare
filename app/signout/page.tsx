'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { Heart, Calendar, Users, MessageCircle, ArrowRight, Sparkles } from 'lucide-react'
import styles from './page.module.css'

export default function SignOutPage() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    // Auto sign out after component mounts
    const performSignOut = async () => {
      setSigningOut(true)
      await signOut({ redirect: false })
      setSigningOut(false)
    }
    performSignOut()
  }, [])

  return (
    <div className={styles.pageContainer}>
      <Navigation showAuthLinks={false} />
      
      <main className={styles.main}>
        <div className={styles.signoutCard}>
          {/* Success Icon */}
          <div className={styles.iconWrapper}>
            <div className={styles.successIcon}>
              <Sparkles size={48} className={styles.sparkle1} />
              <Heart size={64} className={styles.heartIcon} />
              <Sparkles size={32} className={styles.sparkle2} />
            </div>
          </div>

          {/* Main Message */}
          <h1>You've Been Signed Out</h1>
          <p className={styles.subtitle}>
            Thanks for using CareShare. Your family care coordination never stops!
          </p>

          {/* Quick Stats Reminder */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <Calendar size={32} className={styles.statIcon} />
              <h3>Your calendar awaits</h3>
              <p>Keep track of appointments and events</p>
            </div>
            <div className={styles.statCard}>
              <Users size={32} className={styles.statIcon} />
              <h3>Family collaboration</h3>
              <p>Stay connected with your care team</p>
            </div>
            <div className={styles.statCard}>
              <MessageCircle size={32} className={styles.statIcon} />
              <h3>Real-time updates</h3>
              <p>Never miss important messages</p>
            </div>
          </div>

          {/* What's Next */}
          <div className={styles.nextSteps}>
            <h2>What's Next?</h2>
            <div className={styles.nextStepsGrid}>
              <div className={styles.nextStep}>
                <div className={styles.stepNumber}>1</div>
                <div>
                  <h3>Return When Ready</h3>
                  <p>Sign back in to continue coordinating care with your family</p>
                </div>
              </div>
              <div className={styles.nextStep}>
                <div className={styles.stepNumber}>2</div>
                <div>
                  <h3>Invite Family Members</h3>
                  <p>Get more family involved in sharing the caregiving responsibilities</p>
                </div>
              </div>
              <div className={styles.nextStep}>
                <div className={styles.stepNumber}>3</div>
                <div>
                  <h3>Mobile Access</h3>
                  <p>CareShare works great on your phone - access it anywhere, anytime</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={styles.actions}>
            <Link href="/login" className={styles.primaryBtn}>
              <ArrowRight size={20} />
              Sign Back In
            </Link>
            <Link href="/" className={styles.secondaryBtn}>
              Return to Home
            </Link>
          </div>

          {/* Testimonial/Quote */}
          <div className={styles.testimonial}>
            <div className={styles.quoteIcon}>"</div>
            <p>
              CareShare has made coordinating care for my mom so much easier. 
              The whole family can stay informed and everyone knows what needs to be done.
            </p>
            <div className={styles.testimonialAuthor}>
              <strong>Sarah M.</strong>
              <span>Care Coordinator</span>
            </div>
          </div>

          {/* Footer Note */}
          <p className={styles.footerNote}>
            💡 <strong>Tip:</strong> Bookmark CareShare for quick access next time!
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

