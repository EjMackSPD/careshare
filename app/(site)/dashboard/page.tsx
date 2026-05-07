import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { hydrateStoredDraft } from "@/lib/onboarding";
import Link from "next/link";
import DemoInitButton from "../../components/DemoInitButton";
import Footer from "../../components/Footer";
import CareRecipientWidget from "../../components/widgets/CareRecipientWidget";
import TasksWidget from "../../components/widgets/TasksWidget";
import FinancialWidget from "../../components/widgets/FinancialWidget";
import CalendarWidget from "../../components/widgets/CalendarWidget";
import CollaborationWidget from "../../components/widgets/CollaborationWidget";
import ResourcesWidget from "../../components/widgets/ResourcesWidget";
import CarePlanWidget from "../../components/widgets/CarePlanWidget";
import {
  CheckSquare,
  Calendar as CalendarIcon,
  Wallet,
  Heart,
  Gift,
  UtensilsCrossed,
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

  const dbUser = await prisma.user.findUnique({
    where: { id: (user as any).id },
    select: {
      onboardingData: true,
    },
  });

  const families = familyMembers.map((familyMember) => familyMember.family);
  const onboardingDraft = hydrateStoredDraft(dbUser?.onboardingData ?? null);
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
  const isIndividualAudience = onboardingDraft.audienceType === "INDIVIDUAL";

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <div className={styles.heroCopy}>
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
                <div className={styles.careGraphic} aria-hidden="true">
                  <div className={styles.careGraphicHalo} />
                  <div className={styles.careGraphicCard}>
                    <div className={styles.careGraphicAvatar}>
                      {careRecipientName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.careGraphicLine} />
                    <div className={styles.careGraphicLineShort} />
                    <div className={styles.careGraphicStats}>
                      <span>{openTasks}</span>
                      <span>{upcomingEvents}</span>
                      <span>{pendingBills}</span>
                    </div>
                  </div>
                  <div className={styles.careGraphicNodePrimary} />
                  <div className={styles.careGraphicNodeSecondary} />
                </div>
              )}
            </div>
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
              <h2>{isIndividualAudience ? "Your personal plan is ready for the next step" : "No families yet"}</h2>
              <p>
                {isIndividualAudience
                  ? "Start your first care workspace or invite a trusted supporter when you are ready."
                  : "Create your first family group to start coordinating care."}
              </p>
              {user.email === "demo@careshare.app" ? (
                <DemoInitButton />
              ) : (
                <div className={styles.emptyActions}>
                  <Link href="/family/create" className={styles.primaryBtn}>
                    {isIndividualAudience ? "Create Personal Workspace" : "Create Family Group"}
                  </Link>
                  {isIndividualAudience && (
                    <Link href="/onboarding" className={styles.secondaryEmptyLink}>
                      Review onboarding details
                    </Link>
                  )}
                </div>
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

            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
