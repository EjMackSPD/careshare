import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logFamilyAuditEvent, requireFamilyCapability, requireFamilyMembership } from "@/lib/auth-utils";
import { normalizeFamilyRole } from "@/lib/family-permissions";

// GET - Fetch all members for a family
export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;
    let membership
    try {
      const result = await requireFamilyMembership(familyId);
      membership = result.membership;
    } catch (error) {
      return NextResponse.json(
        { error: "Not authorized to view members for this family" },
        { status: 403 }
      );
    }

    // Fetch all family members
    const members = await prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      members,
      currentUserRole: membership?.role ?? null,
    });
  } catch (error) {
    console.error("Error fetching family members:", error);
    return NextResponse.json(
      { error: "Failed to fetch family members" },
      { status: 500 }
    );
  }
}

// POST - Add a member to a family
export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;
    let user
    try {
      const result = await requireFamilyCapability(familyId, "members.manage");
      user = result.user;
    } catch (error) {
      return NextResponse.json(
        { error: "You do not have permission to manage family members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    // Check if user already is a member of this family
    const existingMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this family" },
        { status: 400 }
      );
    }

    // Add member to family
    const newMember = await prisma.familyMember.create({
      data: {
        familyId,
        userId,
        role: normalizeFamilyRole(role),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await logFamilyAuditEvent({
      familyId,
      userId: user.id,
      action: "member.added",
      entityType: "family_member",
      entityId: newMember.id,
      metadata: {
        addedUserId: userId,
        role: newMember.role,
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error adding family member:", error);
    return NextResponse.json(
      { error: "Failed to add family member" },
      { status: 500 }
    );
  }
}
