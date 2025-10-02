import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from './page.module.css'

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  if ((user as any).role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Fetch admin's managed families
  const adminFamilies = await prisma.adminFamily.findMany({
    where: {
      adminId: (user as any).id,
    },
    include: {
      family: {
        include: {
          _count: {
            select: {
              members: true,
              events: true,
              costs: true,
            },
          },
          costs: {
            where: {
              status: 'PENDING',
            },
          },
        },
      },
    },
  })

  const families = adminFamilies.map(af => af.family)
  
  // Calculate stats
  const totalFamilies = families.length
  const totalMembers = families.reduce((sum, f) => sum + f._count.members, 0)
  const totalEvents = families.reduce((sum, f) => sum + f._count.events, 0)
  const pendingCosts = families.reduce((sum, f) => sum + f.costs.length, 0)

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <h1 className={styles.logo}>CareShare Admin</h1>
        <div className={styles.navLinks}>
          <Link href="/admin">Dashboard</Link>
          <Link href="/api/auth/signout">Sign out</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.name || 'Admin'}</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👨‍👩‍👧‍👦</div>
            <div className={styles.statNumber}>{totalFamilies}</div>
            <div className={styles.statLabel}>Families</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statNumber}>{totalMembers}</div>
            <div className={styles.statLabel}>Total Members</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statNumber}>{totalEvents}</div>
            <div className={styles.statLabel}>Total Events</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statNumber}>{pendingCosts}</div>
            <div className={styles.statLabel}>Pending Costs</div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Managed Families</h2>
          {families.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No families assigned yet</p>
            </div>
          ) : (
            <div className={styles.familyGrid}>
              {families.map((family) => (
                <div key={family.id} className={styles.familyCard}>
                  <h3>{family.name}</h3>
                  {family.elderName && (
                    <p className={styles.elderName}>Care for {family.elderName}</p>
                  )}
                  <div className={styles.familyStats}>
                    <div>
                      <strong>{family._count.members}</strong> members
                    </div>
                    <div>
                      <strong>{family._count.events}</strong> events
                    </div>
                    <div>
                      <strong>{family.costs.length}</strong> pending costs
                    </div>
                  </div>
                  <div className={styles.familyMeta}>
                    <small>Created {new Date(family.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

