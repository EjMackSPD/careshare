import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logFamilyAuditEvent, requireFamilyCapability } from "@/lib/auth-utils";
import { normalizeFamilyRole } from "@/lib/family-permissions";

type RouteContext = {
  params: Promise<{
    familyId: string;
    memberId: string;
  }>;
};

// DELETE - Remove a member from a family
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { familyId, memberId } = await context.params;
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

    // Check if member exists
    const existingMember = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        familyId,
      },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Delete member
    await prisma.familyMember.delete({
      where: { id: memberId },
    });

    await logFamilyAuditEvent({
      familyId,
      userId: user.id,
      action: "member.removed",
      entityType: "family_member",
      entityId: memberId,
      metadata: {
        removedUserId: existingMember.userId,
        previousRole: existingMember.role,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing family member:", error);
    return NextResponse.json(
      { error: "Failed to remove family member" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { familyId, memberId } = await context.params;
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
    const role = normalizeFamilyRole(body.role);

    const existingMember = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        familyId,
      },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const updatedMember = await prisma.familyMember.update({
      where: { id: memberId },
      data: { role },
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
      action: "member.role_changed",
      entityType: "family_member",
      entityId: memberId,
      metadata: {
        previousRole: existingMember.role,
        nextRole: role,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating family member:", error);
    return NextResponse.json(
      { error: "Failed to update family member" },
      { status: 500 }
    );
  }
}
