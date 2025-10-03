'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Wallet, 
  Heart, 
  BookOpen, 
  Users, 
  UsersRound,
  Gift, 
  UtensilsCrossed,
  Infinity,
  CreditCard,
  Menu,
  X
} from 'lucide-react'
import styles from './LeftNavigation.module.css'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/finances', label: 'Finances', icon: Wallet },
  { href: '/dashboard/care-plan', label: 'Care Plan', icon: Heart },
  { href: '/dashboard/resources', label: 'Resources', icon: BookOpen },
  { href: '/family', label: 'Families', icon: UsersRound },
  { href: '/dashboard/family-collaboration', label: 'Family Chat', icon: Users },
  { href: '/dashboard/gifts', label: 'Gift Marketplace', icon: Gift },
  { href: '/dashboard/food', label: 'Food Delivery', icon: UtensilsCrossed },
  { href: '/dashboard/legacy', label: 'Live Forever', icon: Infinity },
  { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
]

export default function LeftNavigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className={styles.menuButton} 
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={closeMenu}
              >
                <Icon size={20} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

