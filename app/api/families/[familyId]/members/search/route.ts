import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFamilyCapability } from "@/lib/auth-utils";

// GET - Search registered users who could be added to this family.
// Manager-gated (members.manage). Matches name/email substring, excludes users
// who are already members of this family. Returns minimal fields only.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;

    try {
      await requireFamilyCapability(familyId, "members.manage");
    } catch (error) {
      return NextResponse.json(
        { error: "You do not have permission to manage family members" },
        { status: 403 }
      );
    }

    const q = (request.nextUrl.searchParams.get("q") || "").trim();

    if (q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Ids already in this family — excluded from candidates.
    const existing = await prisma.familyMember.findMany({
      where: { familyId },
      select: { userId: true },
    });
    const existingIds = existing.map((member) => member.userId);

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: existingIds.length ? existingIds : undefined },
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
      take: 8,
    });

    // Pending invitations for this family, keyed by email, so the UI can show
    // "already invited" context alongside search results.
    const pendingInvites = await prisma.familyInvitation.findMany({
      where: { familyId, status: "PENDING" },
      select: { email: true },
    });
    const invitedEmails = new Set(
      pendingInvites.map((invite) => invite.email.toLowerCase())
    );

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        alreadyInvited: invitedEmails.has(user.email.toLowerCase()),
      })),
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
