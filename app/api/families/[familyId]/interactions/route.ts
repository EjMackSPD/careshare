import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFamilyCapability } from "@/lib/auth-utils";

// GET - Quick engagement summary per family member: last login, join date,
// and lightweight activity counts drawn from real records (notes, messages,
// task assignments, and the most recent audit-logged action). Manager-gated
// (members.manage) since this surfaces who is/isn't engaging.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;

    try {
      await requireFamilyCapability(familyId, "members.manage");
    } catch {
      return NextResponse.json(
        { error: "You do not have permission to view member interactions" },
        { status: 403 }
      );
    }

    const members = await prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: "asc" },
    });

    const userIds = members.map((member) => member.userId);

    if (userIds.length === 0) {
      return NextResponse.json({ members: [] });
    }

    const [lastLogins, noteCounts, messageCounts, taskAssignmentCounts, lastActions] =
      await Promise.all([
        prisma.$queryRaw<Array<{ _parent_id: string; last_login: Date }>>`
          SELECT "_parent_id", MAX("created_at") AS last_login
          FROM payload.users_sessions
          WHERE "_parent_id" = ANY(${userIds})
          GROUP BY "_parent_id"
        `,
        prisma.note.groupBy({
          by: ["userId"],
          where: { familyId, userId: { in: userIds } },
          _count: { _all: true },
        }),
        prisma.message.groupBy({
          by: ["userId"],
          where: { familyId, userId: { in: userIds } },
          _count: { _all: true },
        }),
        prisma.taskAssignment.groupBy({
          by: ["userId"],
          where: { userId: { in: userIds }, task: { familyId } },
          _count: { _all: true },
        }),
        prisma.auditLog.findMany({
          where: { familyId, userId: { in: userIds } },
          orderBy: { createdAt: "desc" },
          take: 200,
          select: { userId: true, action: true, createdAt: true },
        }),
      ]);

    const lastLoginByUser = new Map(
      lastLogins.map((row) => [row._parent_id, row.last_login])
    );
    const noteCountByUser = new Map(
      noteCounts.map((row) => [row.userId, row._count._all])
    );
    const messageCountByUser = new Map(
      messageCounts.map((row) => [row.userId, row._count._all])
    );
    const taskCountByUser = new Map(
      taskAssignmentCounts.map((row) => [row.userId, row._count._all])
    );
    const lastActionByUser = new Map<string, { action: string; createdAt: Date }>();
    for (const log of lastActions) {
      if (!log.userId || lastActionByUser.has(log.userId)) continue;
      lastActionByUser.set(log.userId, { action: log.action, createdAt: log.createdAt });
    }

    const result = members.map((member) => ({
      userId: member.userId,
      name: member.user.name || member.user.email,
      email: member.user.email,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      lastLoginAt: lastLoginByUser.get(member.userId)?.toISOString() ?? null,
      noteCount: noteCountByUser.get(member.userId) ?? 0,
      messageCount: messageCountByUser.get(member.userId) ?? 0,
      assignedTaskCount: taskCountByUser.get(member.userId) ?? 0,
      lastAction: lastActionByUser.get(member.userId)
        ? {
            action: lastActionByUser.get(member.userId)!.action,
            createdAt: lastActionByUser.get(member.userId)!.createdAt.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({ members: result });
  } catch (error) {
    console.error("Error fetching family interactions:", error);
    return NextResponse.json(
      { error: "Failed to load family interactions" },
      { status: 500 }
    );
  }
}
