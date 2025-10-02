import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import styles from './page.module.css'

export default async function FamiliesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const familyMembers = await prisma.familyMember.findMany({
    where: {
      userId: (user as any).id,
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
        },
      },
    },
  })

  const families = familyMembers.map(fm => ({
    ...fm.family,
    role: fm.role,
  }))

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>My Families</h1>
          <Link href="/family/create" className={styles.createBtn}>
            + Create Family Group
          </Link>
        </div>

        {families.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No families yet</h2>
            <p>Create your first family group to start coordinating care</p>
            <Link href="/family/create" className={styles.primaryBtn}>
              Create Family Group
            </Link>
          </div>
        ) : (
          <div className={styles.familyGrid}>
            {families.map((family) => (
              <Link 
                key={family.id} 
                href={`/family/${family.id}`}
                className={styles.familyCard}
              >
                <div className={styles.familyCardHeader}>
                  <h2>{family.name}</h2>
                  {family.role === 'organizer' && (
                    <span className={styles.badge}>Organizer</span>
                  )}
                </div>
                {family.elderName && (
                  <p className={styles.elderName}>Care for {family.elderName}</p>
                )}
                {family.description && (
                  <p className={styles.description}>{family.description}</p>
                )}
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>{family._count.members}</span>
                    <span className={styles.statLabel}>Members</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>{family._count.events}</span>
                    <span className={styles.statLabel}>Events</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>{family._count.costs}</span>
                    <span className={styles.statLabel}>Costs</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

