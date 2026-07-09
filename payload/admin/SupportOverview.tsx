import type { ServerProps } from "payload";
import Link from "next/link";
import { prisma } from "../../lib/prisma.ts";

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

export async function SupportOverview({ user }: ServerProps) {
  const roles = getRoles(user);
  const canView = roles.includes("super-admin") || roles.includes("support-admin");

  if (!canView) {
    return (
      <main className="careshare-support-overview">
        <h1>Support Overview</h1>
        <p>This view is available to support admins and super admins.</p>
      </main>
    );
  }

  const [familyCount, userCount, membershipCount, recentFamilies, flaggedMessages] = await Promise.all([
    prisma.family.count(),
    prisma.user.count(),
    prisma.familyMember.count(),
    prisma.family.findMany({
      include: {
        _count: {
          select: {
            members: true,
            tasks: true,
            events: true,
          },
        },
        creator: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.aIMessage.findMany({
      where: { flagged: true },
      include: {
        conversation: {
          include: {
            family: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <main className="careshare-support-overview">
      <div className="careshare-support-overview__header">
        <p>Operations</p>
        <h1>Support Overview</h1>
      </div>

      <section className="careshare-support-overview__metrics">
        <div className="careshare-support-card">
          <p>Families</p>
          <strong>{familyCount}</strong>
        </div>
        <div className="careshare-support-card">
          <p>Users</p>
          <strong>{userCount}</strong>
        </div>
        <div className="careshare-support-card">
          <p>Memberships</p>
          <strong>{membershipCount}</strong>
        </div>
      </section>

      <section className="careshare-support-card">
        <div className="careshare-support-overview__section-header">
          <h2>Recently Updated Families</h2>
          <Link href="/admin/collections/users">Manage users</Link>
        </div>

        <div className="careshare-support-overview__table-wrap">
          <table className="careshare-support-table">
            <thead>
              <tr>
                <th>Family</th>
                <th>Creator</th>
                <th className="careshare-support-table__number">Members</th>
                <th className="careshare-support-table__number">Tasks</th>
                <th className="careshare-support-table__number">Events</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentFamilies.map((family) => (
                <tr key={family.id}>
                  <td>
                    <strong>{family.name}</strong>
                    {family.elderName ? (
                      <div className="careshare-support-table__muted">{family.elderName}</div>
                    ) : null}
                  </td>
                  <td>{family.creator.name || family.creator.email}</td>
                  <td className="careshare-support-table__number">{family._count.members}</td>
                  <td className="careshare-support-table__number">{family._count.tasks}</td>
                  <td className="careshare-support-table__number">{family._count.events}</td>
                  <td>{formatDate(family.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="careshare-support-card">
        <div className="careshare-support-overview__section-header">
          <h2>Recently Flagged Care Concierge Answers</h2>
        </div>

        <div className="careshare-support-overview__table-wrap">
          <table className="careshare-support-table">
            <thead>
              <tr>
                <th>Family</th>
                <th>Answer</th>
                <th>Flagged</th>
              </tr>
            </thead>
            <tbody>
              {flaggedMessages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="careshare-support-table__muted">
                    No flagged answers yet.
                  </td>
                </tr>
              ) : (
                flaggedMessages.map((message) => (
                  <tr key={message.id}>
                    <td>
                      <strong>{message.conversation.family.name}</strong>
                    </td>
                    <td>{message.content.slice(0, 140)}</td>
                    <td>{formatDate(message.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
