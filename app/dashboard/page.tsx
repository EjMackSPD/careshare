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
import {
  CheckSquare,
  Calendar as CalendarIcon,
  Wallet,
  Heart,
  Gift,
  UtensilsCrossed,
  Cake,
  Stethoscope,
  UserCheck,
  Clock,
  ClipboardList,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import styles from "./page.module.css";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

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
            include: {
              assignments: true,
            },
          },
        },
      },
    },
  });

  const families = familyMembers.map((familyMember) => familyMember.family);
  const primaryFamily = families[0];
  const allTasks = families.flatMap((family) => family.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;
  const unassignedTasks = allTasks.filter((task) => {
    const hasNoAssignments = !task.assignments || task.assignments.length === 0;
    return task.status !== "COMPLETED" && hasNoAssignments;
  }).length;
  const openTasks = allTasks.filter((task) => task.status !== "COMPLETED").length;
  const pendingBills = families.reduce((sum, family) => sum + family.costs.length, 0);
  const totalDue = families.reduce(
    (sum, family) =>
      sum + family.costs.reduce((familySum, cost) => familySum + cost.amount, 0),
    0
  );
  const upcomingEvents = families.reduce(
    (sum, family) => sum + family.events.length,
    0
  );
  const activeFamilyName = primaryFamily?.name || "Your care workspace";
  const careRecipientName = primaryFamily?.elderName || "Care recipient";

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />

        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <div className={styles.eyebrow}>Care Dashboard</div>

              <div className={styles.header}>
                <div>
                  <h1>Welcome back, {user.name || "there"}.</h1>
                  <p className={styles.headerSubtitle}>
                    Track care activity, upcoming obligations, and family coordination from one working view.
                  </p>
                </div>
              </div>

              <div className={styles.heroMeta}>
                <div className={styles.heroMetaItem}>
                  <span className={styles.heroMetaLabel}>Active workspace</span>
                  <strong>{activeFamilyName}</strong>
                </div>
                <div className={styles.heroMetaItem}>
                  <span className={styles.heroMetaLabel}>Care recipient</span>
                  <strong>{careRecipientName}</strong>
                </div>
                <div className={styles.heroMetaItem}>
                  <span className={styles.heroMetaLabel}>Families</span>
                  <strong>{families.length}</strong>
                </div>
              </div>
            </div>

            {families.length > 0 && (
              <div className={styles.heroAside}>
                <div className={styles.heroAvatar}>
                  {careRecipientName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.heroAsideBody}>
                  <p className={styles.heroAsideLabel}>Current focus</p>
                  <h2>{careRecipientName}</h2>
                  <p className={styles.heroAsideText}>
                    {openTasks} open tasks, {upcomingEvents} upcoming events, and {pendingBills} pending bills across your workspace.
                  </p>
                </div>
                <div className={styles.heroActionRow}>
                  <Link href="/dashboard/tasks" className={styles.heroActionPrimary}>
                    Review Tasks
                  </Link>
                  <Link href="/family" className={styles.heroActionSecondary}>
                    Open Families
                  </Link>
                </div>
              </div>
            )}
          </section>

          {families.length > 0 && (
            <div className={styles.statsOverview}>
              <section className={styles.summaryPanel}>
                <div className={styles.summaryPanelHeader}>
                  <div className={styles.summaryIcon}>
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <h3>Tasks</h3>
                    <p>What needs attention now</p>
                  </div>
                </div>
                <div className={styles.summaryMetrics}>
                  <Link href="/dashboard/tasks" className={styles.metricCard}>
                    <span className={styles.metricValue}>{totalTasks}</span>
                    <span className={styles.metricLabel}>Total tracked</span>
                  </Link>
                  <Link href="/dashboard/tasks?tab=open" className={styles.metricCard}>
                    <span className={`${styles.metricValue} ${styles.metricOpen}`}>
                      {openTasks}
                    </span>
                    <span className={styles.metricLabel}>Open now</span>
                  </Link>
                  <Link
                    href="/dashboard/tasks?tab=unassigned"
                    className={`${styles.metricCard} ${
                      unassignedTasks > 0 ? styles.metricAlert : ""
                    }`}
                  >
                    <span className={`${styles.metricValue} ${styles.metricWarn}`}>
                      {unassignedTasks}
                    </span>
                    <span className={styles.metricLabel}>Unassigned</span>
                  </Link>
                  <Link
                    href="/dashboard/tasks?tab=completed"
                    className={styles.metricCard}
                  >
                    <span className={`${styles.metricValue} ${styles.metricDone}`}>
                      {completedTasks}
                    </span>
                    <span className={styles.metricLabel}>Completed</span>
                  </Link>
                </div>
              </section>

              <section className={styles.summaryPanel}>
                <div className={styles.summaryPanelHeader}>
                  <div className={styles.summaryIcon}>
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <h3>Finances</h3>
                    <p>Pending costs across families</p>
                  </div>
                </div>
                <div className={styles.summaryStack}>
                  <div className={styles.summaryRow}>
                    <span>Pending bills</span>
                    <strong>{pendingBills}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Total due</span>
                    <strong>${totalDue.toFixed(0)}</strong>
                  </div>
                  <Link href="/dashboard/finances" className={styles.summaryLink}>
                    Open finances
                  </Link>
                </div>
              </section>

              <section className={styles.summaryPanel}>
                <div className={styles.summaryPanelHeader}>
                  <div className={styles.summaryIcon}>
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <h3>Calendar</h3>
                    <p>Appointments, visits, and milestones</p>
                  </div>
                </div>
                <div className={styles.summaryStack}>
                  <div className={styles.summaryRow}>
                    <span>Upcoming events</span>
                    <strong>{upcomingEvents}</strong>
                  </div>
                  <Link href="/dashboard/calendar" className={styles.summaryLink}>
                    View calendar
                  </Link>
                  <Link href="/dashboard/calendar" className={styles.summaryButton}>
                    Add event
                  </Link>
                </div>
              </section>
            </div>
          )}

          {families.length > 0 && (
            <section className={styles.quickLinks}>
              <div className={styles.sectionHeading}>
                <div>
                  <h2>Quick actions</h2>
                  <p>Jump straight into the areas people use most.</p>
                </div>
              </div>

              <div className={styles.linksGrid}>
                <Link href="/dashboard/tasks" className={styles.quickLink}>
                  <div className={styles.linkIcon}>
                    <CheckSquare size={20} />
                  </div>
                  <div className={styles.quickLinkBody}>
                    <span>Manage tasks</span>
                    <small>Assignments, follow-ups, deadlines</small>
                  </div>
                </Link>

                <Link href="/dashboard/calendar" className={styles.quickLink}>
                  <div className={styles.linkIcon}>
                    <CalendarIcon size={20} />
                  </div>
                  <div className={styles.quickLinkBody}>
                    <span>View calendar</span>
                    <small>Visits, appointments, reminders</small>
                  </div>
                </Link>

                <Link href="/dashboard/finances" className={styles.quickLink}>
                  <div className={styles.linkIcon}>
                    <Wallet size={20} />
                  </div>
                  <div className={styles.quickLinkBody}>
                    <span>Track finances</span>
                    <small>Bills, contributions, totals</small>
                  </div>
                </Link>

                <Link href="/dashboard/care-plan" className={styles.quickLink}>
                  <div className={styles.linkIcon}>
                    <Heart size={20} />
                  </div>
                  <div className={styles.quickLinkBody}>
                    <span>Care plan</span>
                    <small>Goals, routines, scenarios</small>
                  </div>
                </Link>

                <Link href="/dashboard/gifts" className={styles.quickLink}>
                  <div className={styles.linkIcon}>
                    <Gift size={20} />
                  </div>
                  <div className={styles.quickLinkBody}>
                    <span>Send a gift</span>
                    <small>Support from a distance</small>
                  </div>
                </Link>

                <Link href="/dashboard/food" className={styles.quickLink}>
                  <div className={styles.linkIcon}>
                    <UtensilsCrossed size={20} />
                  </div>
                  <div className={styles.quickLinkBody}>
                    <span>Order food</span>
                    <small>Meals and delivery support</small>
                  </div>
                </Link>
              </div>
            </section>
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
              <section className={styles.widgetSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <h2>Live workspace</h2>
                    <p>Operational panels for notes, tasks, finances, calendar, and coordination.</p>
                  </div>
                </div>

                <div className={styles.widgetGrid}>
                  <div className={styles.widgetLarge}>
                    <CareRecipientWidget
                      elderName={primaryFamily?.elderName}
                      elderAge={
                        primaryFamily?.elderBirthday
                          ? new Date().getFullYear() -
                            new Date(primaryFamily.elderBirthday).getFullYear()
                          : undefined
                      }
                      familyId={primaryFamily?.id}
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
              </section>

              <section className={styles.dashboard}>
                <div className={styles.sectionHeading}>
                  <div>
                    <h2>Family snapshots</h2>
                    <p>Recent events and pending costs for each family you support.</p>
                  </div>
                </div>

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
                        View details
                      </Link>
                    </div>

                    <div className={styles.cards}>
                      <div className={styles.card}>
                        <h3>Upcoming events</h3>
                        {family.events.length === 0 ? (
                          <p className={styles.emptyText}>No upcoming events</p>
                        ) : (
                          <ul className={styles.list}>
                            {family.events.map((event) => (
                              <li key={event.id}>
                                <div className={styles.eventIconWrapper}>
                                  {event.type === "BIRTHDAY" && <Cake size={16} />}
                                  {event.type === "APPOINTMENT" && <Stethoscope size={16} />}
                                  {event.type === "FOOD_DELIVERY" && (
                                    <UtensilsCrossed size={16} />
                                  )}
                                  {event.type === "VISIT" && <UserCheck size={16} />}
                                  {event.type === "OTHER" && <Clock size={16} />}
                                </div>
                                <div>
                                  <strong>{event.title}</strong>
                                  <br />
                                  <small>
                                    {new Date(event.eventDate).toLocaleDateString()}
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
                        <h3>Pending costs</h3>
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
              </section>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
