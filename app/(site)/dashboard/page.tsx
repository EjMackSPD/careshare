import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  DollarSign,
  Users,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { hydrateStoredDraft } from "@/lib/onboarding";
import { resolveDashboardPersona } from "@/lib/dashboard-persona";
import {
  getMedsTodaySummary,
  getMyBalance,
  getTasksSummary,
} from "@/lib/dashboard-data";
import PendingInvitationsBanner from "../../components/PendingInvitationsBanner";
import CareConciergeHighlightWidget from "../../components/widgets/CareConciergeHighlightWidget";
import MedsTodayChecklist from "./MedsTodayChecklist";
import TaskCheckItem from "./TaskCheckItem";
import styles from "./page.module.css";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function careLevelLabel(level: string) {
  const l = level.toLowerCase();
  return `${l.charAt(0).toUpperCase()}${l.slice(1)} care`;
}

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const userId = (user as { id: string }).id;

  const [familyMembers, dbUser, adminFamilyCount, pendingInvitations] =
    await Promise.all([
      prisma.familyMember.findMany({
        where: { userId },
        include: {
          family: {
            include: {
              events: {
                where: { eventDate: { gte: new Date() } },
                take: 1,
                orderBy: { eventDate: "asc" },
              },
              careRecipient: true,
              carePlan: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { onboardingData: true },
      }),
      prisma.adminFamily.count({ where: { adminId: userId } }),
      user.email
        ? prisma.familyInvitation.findMany({
            where: {
              email: { equals: user.email, mode: "insensitive" },
              status: "PENDING",
            },
            include: {
              family: { select: { name: true, elderName: true } },
              inviter: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

  const onboardingDraft = hydrateStoredDraft(dbUser?.onboardingData ?? null);
  const persona = resolveDashboardPersona({
    familyMemberRoles: familyMembers.map((fm) => fm.role),
    adminFamilyCount,
    audienceType: onboardingDraft.audienceType,
  });
  if (persona === "CARE_RECIPIENT") redirect("/care");
  if (persona === "PROVIDER_ADMIN") redirect("/dashboard/provider");

  const isIndividualAudience = onboardingDraft.audienceType === "INDIVIDUAL";
  const families = familyMembers.map((fm) => fm.family);
  const primaryFamily = families[0];

  const invitationsBanner = (
    <PendingInvitationsBanner
      invitations={pendingInvitations.map((invitation) => ({
        id: invitation.id,
        role: invitation.role,
        message: invitation.message,
        familyName: invitation.family.name,
        elderName: invitation.family.elderName,
        inviterName: invitation.inviter.name,
      }))}
    />
  );

  if (!primaryFamily) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          {invitationsBanner}
          <div className={styles.emptyState}>
            <h2>
              {isIndividualAudience
                ? "Your personal plan is ready for the next step"
                : "No families yet"}
            </h2>
            <p>
              {isIndividualAudience
                ? "Start your first care workspace or invite a trusted supporter when you are ready."
                : "Create your first family group to start coordinating care."}
            </p>
            <div className={styles.emptyActions}>
              <Link href="/family/create" className={styles.primaryBtn}>
                {isIndividualAudience
                  ? "Create Personal Workspace"
                  : "Create Family Group"}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const primaryCarePlan =
    primaryFamily.carePlan ??
    (await prisma.carePlan.create({
      data: { familyId: primaryFamily.id, careLevel: "MODERATE" },
    }));

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [paidThisMonth, pendingBillsCount, medsSummary, myBalance, tasksSummary] =
    await Promise.all([
      prisma.cost.aggregate({
        where: {
          familyId: primaryFamily.id,
          status: "PAID",
          paidDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.cost.count({
        where: { familyId: primaryFamily.id, status: "PENDING" },
      }),
      getMedsTodaySummary(primaryFamily.id),
      getMyBalance(primaryFamily.id, userId),
      getTasksSummary(primaryFamily.id),
    ]);

  const monthlyBudget = primaryCarePlan.estimatedCostMax ?? 2400;
  const spentThisMonth = paidThisMonth._sum.amount ?? 0;
  const spentPct = Math.min(
    100,
    Math.round((spentThisMonth / Math.max(monthlyBudget, 1)) * 100)
  );

  const careRecipient = primaryFamily.careRecipient;
  const recipientName =
    careRecipient?.preferredName ||
    careRecipient?.name ||
    primaryFamily.elderName ||
    "your loved one";
  const recipientAge = careRecipient?.birthDate
    ? now.getFullYear() - new Date(careRecipient.birthDate).getFullYear()
    : primaryFamily.elderBirthday
      ? now.getFullYear() - new Date(primaryFamily.elderBirthday).getFullYear()
      : null;

  const nextAppointment = primaryFamily.events[0] ?? null;
  const dueToday = tasksSummary.tasks.filter((t) => t.dueToday);
  const firstName = user.name?.trim().split(" ")[0] || "there";
  const todayLabel = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const balanceText =
    myBalance.net > 0
      ? `You're owed $${myBalance.net.toFixed(2)}`
      : myBalance.net < 0
        ? `You owe $${Math.abs(myBalance.net).toFixed(2)}`
        : "All settled up";

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.banner}>{invitationsBanner}</div>

        {/* Header row (desktop): context + quick-add toolbar */}
        <div className={styles.hdr}>
          {/* Who you're caring for */}
          <section className={styles.context}>
            <span className={styles.ctxAvatar}>
              {recipientName.charAt(0).toUpperCase()}
            </span>
            <div className={styles.ctxInfo}>
              <p className={styles.greet}>
                {greeting()}, {firstName}
              </p>
              <p className={styles.caringFor}>
                Caring for {recipientName}
                {recipientAge ? `, ${recipientAge}` : ""}
              </p>
            </div>
            <span className={styles.pillCare}>
              {careLevelLabel(primaryCarePlan.careLevel)}
            </span>
          </section>

          {/* Quick add */}
          <div className={styles.quick}>
            <Link href="/dashboard/tasks" className={`${styles.qbtn} ${styles.qbtnPrimary}`}>
              <span className={styles.qIcon}>
                <Plus size={18} />
              </span>
              Task
            </Link>
            <Link href="/dashboard/finances" className={styles.qbtn}>
              <span className={styles.qIcon}>
                <DollarSign size={18} />
              </span>
              Cost
            </Link>
            <Link href="/family" className={styles.qbtn}>
              <span className={styles.qIcon}>
                <Users size={18} />
              </span>
              Family
            </Link>
          </div>
        </div>

        {/* Main column: Today + Tasks */}
        <div className={styles.colMain}>
        {/* Today */}
        <section className={styles.hero}>
          <div className={styles.heroHead}>
            <span className={styles.heroEyebrow}>Today · {todayLabel}</span>
          </div>

          {nextAppointment ? (
            <div className={styles.apptRow}>
              <span className={styles.apptIcon}>
                <CalendarDays size={20} />
              </span>
              <div className={styles.apptMain}>
                <p className={styles.apptTitle}>{nextAppointment.title}</p>
                <p className={styles.apptMeta}>
                  {nextAppointment.type.replace(/_/g, " ").toLowerCase()}
                  {nextAppointment.location ? ` · ${nextAppointment.location}` : ""}
                </p>
              </div>
              <span className={styles.apptWhen}>
                {new Date(nextAppointment.eventDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          ) : (
            <p className={styles.emptyToday}>
              <CalendarDays size={16} /> No upcoming appointments
            </p>
          )}

          <div className={styles.dueList}>
            {dueToday.length > 0 ? (
              dueToday.map((t) => (
                <TaskCheckItem
                  key={t.id}
                  familyId={primaryFamily.id}
                  task={t}
                  currentUserId={userId}
                  showDue
                />
              ))
            ) : (
              <p className={styles.caughtUp}>
                <CheckCircle2 size={16} /> Nothing due today
              </p>
            )}
          </div>

          <MedsTodayChecklist familyId={primaryFamily.id} meds={medsSummary.meds} />
        </section>

        {/* Tasks */}
        <section className={`${styles.card} ${styles.tasksCard}`}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Open tasks · {tasksSummary.openCount}</span>
            <Link href="/dashboard/tasks" className={styles.see}>
              See all <ChevronRight size={14} />
            </Link>
          </div>
          {tasksSummary.tasks.length > 0 ? (
            <div className={styles.taskList}>
              {tasksSummary.tasks.map((t) => (
                <TaskCheckItem
                  key={t.id}
                  familyId={primaryFamily.id}
                  task={t}
                  currentUserId={userId}
                />
              ))}
            </div>
          ) : (
            <p className={styles.cardEmpty}>No open tasks — nicely done.</p>
          )}
        </section>
        </div>

        {/* Rail: Care Concierge + Shared costs */}
        <div className={styles.colRail}>
        <div className={styles.railItem}>
          <CareConciergeHighlightWidget familyId={primaryFamily.id} />
        </div>

        {/* Shared costs */}
        <section className={`${styles.card} ${styles.costsCard}`}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Shared costs · this month</span>
            <Link href="/dashboard/finances" className={styles.see}>
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <p className={styles.budgetVal}>
            ${spentThisMonth.toFixed(0)}{" "}
            <span className={styles.budgetOf}>of ${monthlyBudget.toFixed(0)}</span>
          </p>
          <div className={styles.bar}>
            <span className={styles.barFill} style={{ width: `${spentPct}%` }} />
          </div>
          <div className={styles.balanceRow}>
            <span
              className={`${styles.balanceIcon} ${myBalance.net < 0 ? styles.balanceOwe : styles.balanceGood}`}
            >
              <DollarSign size={16} />
            </span>
            <div className={styles.balanceMain}>
              <p className={styles.balanceLabel}>{balanceText}</p>
              <p className={styles.balanceSub}>
                {pendingBillsCount} pending {pendingBillsCount === 1 ? "bill" : "bills"}
              </p>
            </div>
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}
