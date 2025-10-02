import Link from 'next/link'
import Image from 'next/image'
import styles from './Navigation.module.css'

type NavigationProps = {
  showAuthLinks?: boolean
  backLink?: {
    href: string
    label: string
  }
}

export default function Navigation({ showAuthLinks = false, backLink }: NavigationProps) {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        <Image 
          src="/careshare-logo.png" 
          alt="CareShare Logo" 
          width={180} 
          height={68}
          priority
        />
      </Link>
      
      <div className={styles.navRight}>
        {backLink && (
          <Link href={backLink.href} className={styles.backLink}>
            ← {backLink.label}
          </Link>
        )}
        
        {showAuthLinks && (
          <div className={styles.navLinks}>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/family">My Families</Link>
            <Link href="/profile">My Profile</Link>
            <Link href="/api/auth/signout">Sign out</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

