import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { hydrateStoredDraft } from "@/lib/onboarding";
import { resolveDashboardPersona } from "@/lib/dashboard-persona";
import { getCarePlanCompleteness } from "@/lib/care-plan-completeness";
import Link from "next/link";
import PendingInvitationsBanner from "../../components/PendingInvitationsBanner";
import CareRecipientWidget from "../../components/widgets/CareRecipientWidget";
import TasksWidget from "../../components/widgets/TasksWidget";
import FinancialWidget from "../../components/widgets/FinancialWidget";
import CalendarWidget from "../../components/widgets/CalendarWidget";
import CareConciergeHighlightWidget from "../../components/widgets/CareConciergeHighlightWidget";
import CarePlanStatusBar from "../../components/widgets/CarePlanStatusBar";
import styles from "./page.module.css";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [familyMembers, dbUser, adminFamilyCount, pendingInvitations] =
    await Promise.all([
      prisma.familyMember.findMany({
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
              careRecipient: true,
              medications: {
                where: { active: true },
                select: { id: true },
              },
              carePlan: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: (user as any).id },
        select: {
          onboardingData: true,
        },
      }),
      prisma.adminFamily.count({
        where: { adminId: (user as any).id },
      }),
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
    familyMemberRoles: familyMembers.map((familyMember) => familyMember.role),
    adminFamilyCount,
    audienceType: onboardingDraft.audienceType,
  });

  if (persona === "CARE_RECIPIENT") {
    redirect("/care");
  }

  if (persona === "PROVIDER_ADMIN") {
    redirect("/dashboard/provider");
  }

  const isCoordinator = persona === "COORDINATOR";

  const families = familyMembers.map((familyMember) => familyMember.family);
  const primaryFamily = families[0];

  const primaryCarePlan = primaryFamily
    ? (primaryFamily.carePlan ??
      (await prisma.carePlan.create({
        data: { familyId: primaryFamily.id, careLevel: "MODERATE" },
      })))
    : null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const paidThisMonth = primaryFamily
    ? await prisma.cost.aggregate({
        where: {
          familyId: primaryFamily.id,
          status: "PAID",
          paidDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      })
    : null;

  const monthlyBudget = primaryCarePlan?.estimatedCostMax ?? 2400;
  const spentThisMonth = paidThisMonth?._sum.amount ?? 0;
  const remainingBudget = Math.max(monthlyBudget - spentThisMonth, 0);

  const activeFamilyName = primaryFamily?.name || "Your care workspace";
  const careRecipientName = primaryFamily?.elderName || "Care recipient";
  const isIndividualAudience = onboardingDraft.audienceType === "INDIVIDUAL";

  const careRecipient = primaryFamily?.careRecipient;
  const careRecipientDisplayName =
    careRecipient?.preferredName || careRecipient?.name || primaryFamily?.elderName || null;
  const careRecipientAge = careRecipient?.birthDate
    ? new Date().getFullYear() - new Date(careRecipient.birthDate).getFullYear()
    : primaryFamily?.elderBirthday
      ? new Date().getFullYear() - new Date(primaryFamily.elderBirthday).getFullYear()
      : null;
  const activeMedicationCount = primaryFamily?.medications.length ?? 0;
  const nextAppointment = primaryFamily?.events[0] ?? null;

  const carePlanCompleteness = primaryFamily
    ? await getCarePlanCompleteness(primaryFamily.id)
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
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

          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <div className={styles.heroCopy}>
                <div className={styles.eyebrow}>
                  {isCoordinator ? "Care Coordinator Dashboard" : "Family Dashboard"}
                </div>

                <h1>Welcome back, {user.name || "there"}.</h1>
                <p className={styles.headerSubtitle}>
                  {isCoordinator
                    ? "Track care activity, upcoming obligations, and family coordination from one working view."
                    : `See what's happening in ${activeFamilyName}'s care, and find ways you can help today.`}
                </p>

                <div className={styles.heroMeta}>
                  <div className={styles.heroMetaItem}>
                    <span className={styles.heroMetaLabel}>Workspace</span>
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
            </div>
          </section>

          {carePlanCompleteness && (
            <CarePlanStatusBar completeness={carePlanCompleteness} />
          )}

          {families.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>{isIndividualAudience ? "Your personal plan is ready for the next step" : "No families yet"}</h2>
              <p>
                {isIndividualAudience
                  ? "Start your first care workspace or invite a trusted supporter when you are ready."
                  : "Create your first family group to start coordinating care."}
              </p>
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
            </div>
          ) : (
            <>
              {primaryFamily && (
                <CareConciergeHighlightWidget familyId={primaryFamily.id} />
              )}

              <section className={styles.widgetSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <h2>Care Space</h2>
                    <p>Notes, tasks, finances, and calendar in one working view.</p>
                  </div>
                </div>

                <div className={styles.widgetGrid}>
                  <div className={styles.widgetLarge}>
                    <CareRecipientWidget
                      careRecipientName={careRecipientDisplayName}
                      careRecipientAge={careRecipientAge}
                      careRecipientPhotoUrl={careRecipient?.photoUrl ?? null}
                      careRecipientRelationship={careRecipient?.relationshipToCaregiver ?? null}
                      activeMedicationCount={activeMedicationCount}
                      nextAppointmentTitle={nextAppointment?.title ?? null}
                      nextAppointmentDate={nextAppointment?.eventDate.toISOString() ?? null}
                      familyId={primaryFamily?.id}
                    />
                  </div>
                  <div className={styles.widgetMedium}>
                    <TasksWidget />
                  </div>
                  <div className={styles.widgetMedium}>
                    <FinancialWidget
                      monthlyBudget={monthlyBudget}
                      spent={spentThisMonth}
                      remaining={remainingBudget}
                      upcomingBills={(primaryFamily?.costs ?? []).map((cost) => ({
                        id: cost.id,
                        description: cost.description,
                        amount: cost.amount,
                        dueDate: cost.dueDate ? cost.dueDate.toISOString() : null,
                      }))}
                    />
                  </div>
                  <div className={styles.widgetMedium}>
                    <CalendarWidget />
                  </div>
                </div>
              </section>

            </>
          )}
        </main>
      </div>
    </div>
  );
}
