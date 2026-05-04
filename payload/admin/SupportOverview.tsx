import type { ServerProps } from "payload";
import Link from "next/link";
import { prisma } from "../../lib/prisma.ts";

const cardStyle = {
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: 8,
  padding: 20,
  background: "var(--theme-elevation-0)",
};

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
      <main style={{ padding: 32 }}>
        <h1>Support Overview</h1>
        <p>This view is available to support admins and super admins.</p>
      </main>
    );
  }

  const [familyCount, userCount, membershipCount, recentFamilies] = await Promise.all([
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
  ]);

  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "var(--theme-elevation-500)", margin: "0 0 8px" }}>
          Operations
        </p>
        <h1 style={{ margin: 0 }}>Support Overview</h1>
      </div>

      <section
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: 28,
        }}
      >
        <div style={cardStyle}>
          <p style={{ color: "var(--theme-elevation-500)", margin: "0 0 8px" }}>Families</p>
          <strong style={{ fontSize: 28 }}>{familyCount}</strong>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "var(--theme-elevation-500)", margin: "0 0 8px" }}>Users</p>
          <strong style={{ fontSize: 28 }}>{userCount}</strong>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "var(--theme-elevation-500)", margin: "0 0 8px" }}>
            Memberships
          </p>
          <strong style={{ fontSize: 28 }}>{membershipCount}</strong>
        </div>
      </section>

      <section style={cardStyle}>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>Recently Updated Families</h2>
          <Link href="/admin/collections/users">Manage users</Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: 720, width: "100%" }}>
            <thead>
              <tr>
                <th style={{ padding: "12px 8px", textAlign: "left" }}>Family</th>
                <th style={{ padding: "12px 8px", textAlign: "left" }}>Creator</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Members</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Tasks</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Events</th>
                <th style={{ padding: "12px 8px", textAlign: "left" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentFamilies.map((family) => (
                <tr key={family.id} style={{ borderTop: "1px solid var(--theme-elevation-100)" }}>
                  <td style={{ padding: "12px 8px" }}>
                    <strong>{family.name}</strong>
                    {family.elderName ? (
                      <div style={{ color: "var(--theme-elevation-500)" }}>{family.elderName}</div>
                    ) : null}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    {family.creator.name || family.creator.email}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right" }}>
                    {family._count.members}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right" }}>
                    {family._count.tasks}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right" }}>
                    {family._count.events}
                  </td>
                  <td style={{ padding: "12px 8px" }}>{formatDate(family.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
