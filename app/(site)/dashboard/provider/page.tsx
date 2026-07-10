import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./page.module.css";

export default async function ProviderDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const adminFamilies = await prisma.adminFamily.findMany({
    where: { adminId: (user as any).id },
    include: {
      family: {
        include: {
          careRecipient: true,
          _count: {
            select: { members: true, events: true, costs: true, tasks: true },
          },
        },
      },
    },
    orderBy: { addedAt: "desc" },
  });

  const families = adminFamilies.map((adminFamily) => adminFamily.family);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Care Provider Dashboard</div>
        <h1>Families you manage</h1>
        <p className={styles.subtitle}>
          {families.length === 0
            ? "No families have been assigned to your care provider account yet."
            : `You have oversight of ${families.length} ${families.length === 1 ? "family" : "families"}.`}
        </p>
      </div>

      {families.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            Once your organization assigns families to your account, they will
            appear here for you to review and support.
          </p>
        </div>
      ) : (
        <div className={styles.familyGrid}>
          {families.map((family) => (
            <Link key={family.id} href={`/family/${family.id}`} className={styles.familyCard}>
              <div className={styles.familyCardHeader}>
                <h2>{family.name}</h2>
              </div>
              {(family.careRecipient?.preferredName || family.careRecipient?.name || family.elderName) && (
                <p className={styles.elderName}>
                  Care for {family.careRecipient?.preferredName || family.careRecipient?.name || family.elderName}
                </p>
              )}
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{family._count.members}</span>
                  <span className={styles.statLabel}>Members</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{family._count.tasks}</span>
                  <span className={styles.statLabel}>Tasks</span>
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
    </div>
  );
}
