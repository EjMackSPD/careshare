import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { FamilyRole } from '@prisma/client'
import Link from 'next/link'
import styles from './page.module.css'

const caregiverRoles = new Set(['OWNER', 'PRIMARY_CAREGIVER', 'FAMILY_ADMIN'])

export default async function FamiliesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const familyCountInclude = {
    _count: {
      select: {
        members: true,
        events: true,
        costs: true,
      },
    },
  }

  const [familyMembers, adminFamilies] = await Promise.all([
    prisma.familyMember.findMany({
      where: { userId: (user as any).id },
      include: { family: { include: familyCountInclude } },
    }),
    prisma.adminFamily.findMany({
      where: { adminId: (user as any).id },
      include: { family: { include: familyCountInclude } },
    }),
  ])

  const memberFamilyIds = new Set(familyMembers.map((fm) => fm.family.id))

  const families = [
    ...familyMembers.map((fm) => ({
      ...fm.family,
      role: fm.role as FamilyRole | null,
      isProviderManaged: false,
    })),
    ...adminFamilies
      .filter((af) => !memberFamilyIds.has(af.family.id))
      .map((af) => ({
        ...af.family,
        role: null as FamilyRole | null,
        isProviderManaged: true,
      })),
  ]

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
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
                  {family.isProviderManaged ? (
                    <span className={styles.badge}>🏢 Care Provider Access</span>
                  ) : (
                    family.role &&
                    caregiverRoles.has(family.role) && (
                      <span className={styles.badge}>⭐ Care Team Lead</span>
                    )
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
    </div>
  )
}

