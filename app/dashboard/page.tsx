import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import styles from './page.module.css'

export default async function Dashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user's families
  const familyMembers = await prisma.familyMember.findMany({
    where: {
      userId: (user as any).id,
    },
    include: {
      family: {
        include: {
          costs: {
            where: {
              status: 'PENDING',
            },
            take: 5,
          },
          events: {
            where: {
              eventDate: {
                gte: new Date(),
              },
            },
            take: 5,
            orderBy: {
              eventDate: 'asc',
            },
          },
        },
      },
    },
  })

  const families = familyMembers.map(fm => fm.family)

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Welcome back, {user.name || 'there'}!</h1>
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
          <div className={styles.dashboard}>
            {families.map((family) => (
              <div key={family.id} className={styles.familySection}>
                <div className={styles.familyHeader}>
                  <div>
                    <h2>{family.name}</h2>
                    {family.elderName && (
                      <p className={styles.elderName}>Care for {family.elderName}</p>
                    )}
                  </div>
                  <Link href={`/family/${family.id}`} className={styles.viewLink}>
                    View Details →
                  </Link>
                </div>

                <div className={styles.cards}>
                  <div className={styles.card}>
                    <h3>Upcoming Events</h3>
                    {family.events.length === 0 ? (
                      <p className={styles.emptyText}>No upcoming events</p>
                    ) : (
                      <ul className={styles.list}>
                        {family.events.map((event) => (
                          <li key={event.id}>
                            <span className={styles.eventIcon}>
                              {event.type === 'BIRTHDAY' && '🎂'}
                              {event.type === 'APPOINTMENT' && '🏥'}
                              {event.type === 'FOOD_DELIVERY' && '🍽️'}
                              {event.type === 'VISIT' && '👋'}
                              {event.type === 'OTHER' && '📅'}
                            </span>
                            <div>
                              <strong>{event.title}</strong>
                              <br />
                              <small>{new Date(event.eventDate).toLocaleDateString()}</small>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link href={`/family/${family.id}/events`} className={styles.cardLink}>
                      View all events
                    </Link>
                  </div>

                  <div className={styles.card}>
                    <h3>Pending Costs</h3>
                    {family.costs.length === 0 ? (
                      <p className={styles.emptyText}>No pending costs</p>
                    ) : (
                      <ul className={styles.list}>
                        {family.costs.map((cost) => (
                          <li key={cost.id}>
                            <div>
                              <strong>{cost.description}</strong>
                              <br />
                              <small>${cost.amount.toFixed(2)}</small>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link href={`/family/${family.id}/costs`} className={styles.cardLink}>
                      View all costs
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

