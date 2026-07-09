import type { ServerProps } from "payload";
import { prisma } from "../../lib/prisma.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function getRoles(user: ServerProps["user"]) {
  const roles = (user as { roles?: string[] | string | null } | undefined)?.roles;
  return Array.isArray(roles) ? roles : roles ? [roles] : [];
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getNowMs() {
  return Date.now();
}

function median(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

type ActivitySpan = {
  familyId: string;
  firstActivityAt: Date | null;
  lastActivityAt: Date | null;
};

export async function ActivationOverview({ user }: ServerProps) {
  const roles = getRoles(user);
  const canView = roles.includes("super-admin") || roles.includes("support-admin");

  if (!canView) {
    return (
      <main className="careshare-support-overview">
        <h1>Activation Metrics</h1>
        <p>This view is available to support admins and super admins.</p>
      </main>
    );
  }

  const [families, invitationFirstSent, activitySpans] = await Promise.all([
    prisma.family.findMany({
      include: {
        creator: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.familyInvitation.groupBy({
      by: ["familyId"],
      _min: { createdAt: true },
    }),
    prisma.$queryRaw<ActivitySpan[]>`
      select "familyId",
             min("createdAt") as "firstActivityAt",
             max("createdAt") as "lastActivityAt"
      from (
        select "familyId", "createdAt" from "Task"
        union all select "familyId", "createdAt" from "Event"
        union all select "familyId", "createdAt" from "Cost"
        union all select "familyId", "createdAt" from "Message"
      ) activity
      group by "familyId"
    `,
  ]);

  const firstInviteByFamily = new Map(
    invitationFirstSent.map((row) => [row.familyId, row._min.createdAt])
  );
  const activityByFamily = new Map(activitySpans.map((row) => [row.familyId, row]));
  const now = getNowMs();

  const rows = families.map((family) => {
    const signupAt = family.creator.createdAt.getTime();
    const setupAt = family.createdAt.getTime();
    const minutesToSetup = Math.round((setupAt - signupAt) / 60000);

    const firstInviteAt = firstInviteByFamily.get(family.id);
    const invitedWithinDay = firstInviteAt ? firstInviteAt.getTime() - signupAt <= DAY_MS : false;

    const activity = activityByFamily.get(family.id);
    const firstActivityWithinDay = activity?.firstActivityAt
      ? new Date(activity.firstActivityAt).getTime() - signupAt <= DAY_MS
      : false;

    const activatedWithinDay = invitedWithinDay && firstActivityWithinDay;
    const weeklyActive = activity?.lastActivityAt
      ? now - new Date(activity.lastActivityAt).getTime() <= WEEK_MS
      : false;

    return {
      id: family.id,
      name: family.name,
      creatorLabel: family.creator.name || family.creator.email,
      minutesToSetup,
      invitedWithinDay,
      firstActivityWithinDay,
      activatedWithinDay,
      weeklyActive,
      createdAt: family.createdAt,
    };
  });

  const activatedCount = rows.filter((row) => row.activatedWithinDay).length;
  const weeklyActiveCount = rows.filter((row) => row.weeklyActive).length;
  const medianSetupMinutes = median(
    rows.map((row) => row.minutesToSetup).filter((minutes) => minutes >= 0)
  );

  return (
    <main className="careshare-support-overview">
      <div className="careshare-support-overview__header">
        <p>Operations</p>
        <h1>Activation Metrics</h1>
      </div>

      <section className="careshare-support-overview__metrics">
        <div className="careshare-support-card">
          <p>Families</p>
          <strong>{rows.length}</strong>
        </div>
        <div className="careshare-support-card">
          <p>Activated within a day</p>
          <strong>
            {rows.length ? `${Math.round((activatedCount / rows.length) * 100)}%` : "N/A"}
          </strong>
        </div>
        <div className="careshare-support-card">
          <p>Median minutes to setup</p>
          <strong>{medianSetupMinutes === null ? "N/A" : medianSetupMinutes}</strong>
        </div>
        <div className="careshare-support-card">
          <p>Weekly active circles</p>
          <strong>{weeklyActiveCount}</strong>
        </div>
      </section>

      <section className="careshare-support-card">
        <div className="careshare-support-overview__section-header">
          <h2>Recent Families</h2>
        </div>

        <div className="careshare-support-overview__table-wrap">
          <table className="careshare-support-table">
            <thead>
              <tr>
                <th>Family</th>
                <th>Creator</th>
                <th className="careshare-support-table__number">Signup&rarr;Setup (min)</th>
                <th>Invited &lt;24h</th>
                <th>First activity &lt;24h</th>
                <th>Activated &lt;24h</th>
                <th>Weekly active</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>{row.creatorLabel}</td>
                  <td className="careshare-support-table__number">{row.minutesToSetup}</td>
                  <td>{row.invitedWithinDay ? "Yes" : "No"}</td>
                  <td>{row.firstActivityWithinDay ? "Yes" : "No"}</td>
                  <td>{row.activatedWithinDay ? "Yes" : "No"}</td>
                  <td>{row.weeklyActive ? "Yes" : "No"}</td>
                  <td>{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
