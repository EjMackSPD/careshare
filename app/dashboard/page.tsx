import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navigation from "../components/Navigation";
import LeftNavigation from "../components/LeftNavigation";
import DemoInitButton from "../components/DemoInitButton";
import Footer from "../components/Footer";
import CareRecipientWidget from "../components/widgets/CareRecipientWidget";
import TasksWidget from "../components/widgets/TasksWidget";
import FinancialWidget from "../components/widgets/FinancialWidget";
import CalendarWidget from "../components/widgets/CalendarWidget";
import CollaborationWidget from "../components/widgets/CollaborationWidget";
import ResourcesWidget from "../components/widgets/ResourcesWidget";
import CarePlanWidget from "../components/widgets/CarePlanWidget";
import styles from "./page.module.css";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
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
              status: "PENDING",
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
              eventDate: "asc",
            },
          },
          tasks: {
            select: {
              id: true,
              status: true,
              assignedTo: true,
            },
          },
        },
      },
    },
  });

  const families = familyMembers.map((fm) => fm.family);

  // Calculate task statistics
  const allTasks = families.flatMap(f => f.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
  const unassignedTasks = allTasks.filter(t => 
    t.status !== 'COMPLETED' && (!t.assignedTo || t.assignedTo.trim() === '')
  ).length;
  const openTasks = allTasks.filter(t => t.status !== 'COMPLETED').length;

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.header}>
            <div>
              <h1>Welcome back, {user.name || "there"}!</h1>
              <p className={styles.headerSubtitle}>
                Here's what's happening with your families
              </p>
            </div>
            <Link href="/family/create" className={styles.createBtn}>
              + Create Family Group
            </Link>
          </div>

          {families.length > 0 && (
            <>
              {/* Task Statistics Row */}
              <div className={styles.taskStats}>
                <div className={styles.taskStatCard}>
                  <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                    <span className={styles.statEmoji}>📋</span>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{totalTasks}</h3>
                    <p>Total Tasks</p>
                  </div>
                </div>
                <div className={styles.taskStatCard}>
                  <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                    <span className={styles.statEmoji}>🔄</span>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{openTasks}</h3>
                    <p>Open Tasks</p>
                  </div>
                </div>
                <div className={styles.taskStatCard}>
                  <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    <span className={styles.statEmoji}>⚠️</span>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{unassignedTasks}</h3>
                    <p>Unassigned</p>
                  </div>
                  {unassignedTasks > 0 && (
                    <Link href="/dashboard/tasks?tab=unassigned" className={styles.assignNowBtn}>
                      Assign Now
                    </Link>
                  )}
                </div>
                <div className={styles.taskStatCard}>
                  <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <span className={styles.statEmoji}>✓</span>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{completedTasks}</h3>
                    <p>Completed</p>
                  </div>
                </div>
              </div>

              {/* Other Statistics */}
              <div className={styles.quickStats}>
                <div className={styles.statCard}>
                  <h3>{families.length}</h3>
                  <p>Active Families</p>
                </div>
                <div className={styles.statCard}>
                  <h3>{families.reduce((sum, f) => sum + f.events.length, 0)}</h3>
                  <p>Upcoming Events</p>
                </div>
                <div className={styles.statCard}>
                  <h3>{families.reduce((sum, f) => sum + f.costs.length, 0)}</h3>
                  <p>Pending Costs</p>
                </div>
                <div className={styles.statCard}>
                  <h3>
                    $
                    {families
                      .reduce(
                        (sum, f) =>
                          sum + f.costs.reduce((s, c) => s + c.amount, 0),
                        0
                      )
                      .toFixed(2)}
                  </h3>
                  <p>Total Pending</p>
                </div>
              </div>
            </>
          )}

          {/* Quick Links */}
          {families.length > 0 && (
            <div className={styles.quickLinks}>
              <h2>Quick Actions</h2>
              <div className={styles.linksGrid}>
                <Link href="/dashboard/tasks" className={styles.quickLink}>
                  <span className={styles.linkIcon}>✓</span>
                  <span>Manage Tasks</span>
                </Link>
                <Link href="/dashboard/calendar" className={styles.quickLink}>
                  <span className={styles.linkIcon}>📅</span>
                  <span>View Calendar</span>
                </Link>
                <Link href="/dashboard/finances" className={styles.quickLink}>
                  <span className={styles.linkIcon}>💰</span>
                  <span>Track Finances</span>
                </Link>
                <Link href="/dashboard/care-plan" className={styles.quickLink}>
                  <span className={styles.linkIcon}>❤️</span>
                  <span>Care Plan</span>
                </Link>
                <Link href="/dashboard/gifts" className={styles.quickLink}>
                  <span className={styles.linkIcon}>🎁</span>
                  <span>Send Gift</span>
                </Link>
                <Link href="/dashboard/food" className={styles.quickLink}>
                  <span className={styles.linkIcon}>🍽️</span>
                  <span>Order Food</span>
                </Link>
              </div>
            </div>
          )}

          {families.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>No families yet</h2>
              <p>Create your first family group to start coordinating care</p>
              {user.email === "demo@careshare.app" ? (
                <DemoInitButton />
              ) : (
                <Link href="/family/create" className={styles.primaryBtn}>
                  Create Family Group
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Widget Grid */}
              <div className={styles.widgetGrid}>
                <div className={styles.widgetLarge}>
                  <CareRecipientWidget
                    elderName={families[0]?.elderName}
                    elderAge={
                      families[0]?.elderBirthday
                        ? new Date().getFullYear() -
                          new Date(families[0].elderBirthday).getFullYear()
                        : undefined
                    }
                    familyId={families[0]?.id}
                  />
                </div>
                <div className={styles.widgetMedium}>
                  <TasksWidget />
                </div>
                <div className={styles.widgetMedium}>
                  <FinancialWidget />
                </div>
                <div className={styles.widgetMedium}>
                  <CalendarWidget />
                </div>
                <div className={styles.widgetMedium}>
                  <CollaborationWidget />
                </div>
                <div className={styles.widgetLarge}>
                  <ResourcesWidget />
                </div>
                <div className={styles.widgetLarge}>
                  <CarePlanWidget />
                </div>
              </div>

              <div className={styles.dashboard}>
                {families.map((family) => (
                  <div key={family.id} className={styles.familySection}>
                    <div className={styles.familyHeader}>
                      <div>
                        <h2>{family.name}</h2>
                        {family.elderName && (
                          <p className={styles.elderName}>
                            Care for {family.elderName}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/family/${family.id}`}
                        className={styles.viewLink}
                      >
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
                                  {event.type === "BIRTHDAY" && "🎂"}
                                  {event.type === "APPOINTMENT" && "🏥"}
                                  {event.type === "FOOD_DELIVERY" && "🍽️"}
                                  {event.type === "VISIT" && "👋"}
                                  {event.type === "OTHER" && "📅"}
                                </span>
                                <div>
                                  <strong>{event.title}</strong>
                                  <br />
                                  <small>
                                    {new Date(
                                      event.eventDate
                                    ).toLocaleDateString()}
                                  </small>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        <Link
                          href={`/family/${family.id}/events`}
                          className={styles.cardLink}
                        >
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
                        <Link
                          href={`/family/${family.id}/costs`}
                          className={styles.cardLink}
                        >
                          View all costs
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
