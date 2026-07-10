import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logFamilyAuditEvent, requireFamilyCapability } from "@/lib/auth-utils";
import { sendFamilyMemberAddedEmail } from "@/lib/email";

// POST - Approve a pending invitation on the invitee's behalf: if a registered
// user exists for the invitation email, add them to the family directly and mark
// the invitation ACCEPTED. Manager-gated (members.manage).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ familyId: string; invitationId: string }> }
) {
  try {
    const { familyId, invitationId } = await params;

    let actingUser;
    try {
      const result = await requireFamilyCapability(familyId, "members.manage");
      actingUser = result.user;
    } catch (error) {
      return NextResponse.json(
        { error: "You do not have permission to manage family members" },
        { status: 403 }
      );
    }

    const invitation = await prisma.familyInvitation.findUnique({
      where: { id: invitationId },
      include: { family: { select: { name: true } } },
    });

    if (!invitation || invitation.familyId !== familyId) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "This invitation has already been responded to" },
        { status: 400 }
      );
    }

    const registeredUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true, name: true, email: true },
    });

    if (!registeredUser) {
      return NextResponse.json(
        { error: "No registered user has signed up with this email yet" },
        { status: 400 }
      );
    }

    // Add as a member (idempotent) and mark the invitation accepted together.
    await prisma.$transaction([
      prisma.familyMember.upsert({
        where: {
          familyId_userId: { familyId, userId: registeredUser.id },
        },
        update: {},
        create: {
          familyId,
          userId: registeredUser.id,
          role: invitation.role,
        },
      }),
      prisma.familyInvitation.update({
        where: { id: invitationId },
        data: { status: "ACCEPTED" },
      }),
    ]);

    await sendFamilyMemberAddedEmail({
      to: registeredUser.email,
      familyName: invitation.family.name,
      inviterName: actingUser.name ?? null,
      role: invitation.role,
    });

    await logFamilyAuditEvent({
      familyId,
      userId: actingUser.id,
      action: "invitation.approved",
      entityType: "family_invitation",
      entityId: invitation.id,
      metadata: {
        email: invitation.email,
        role: invitation.role,
        addedUserId: registeredUser.id,
      },
    });

    return NextResponse.json({ success: true, userId: registeredUser.id });
  } catch (error) {
    console.error("Error approving invitation:", error);
    return NextResponse.json(
      { error: "Failed to approve invitation" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a pending invitation. Manager-gated (members.manage).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ familyId: string; invitationId: string }> }
) {
  try {
    const { familyId, invitationId } = await params;

    let actingUser;
    try {
      const result = await requireFamilyCapability(familyId, "members.manage");
      actingUser = result.user;
    } catch (error) {
      return NextResponse.json(
        { error: "You do not have permission to manage family members" },
        { status: 403 }
      );
    }

    const invitation = await prisma.familyInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.familyId !== familyId) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    await prisma.familyInvitation.delete({ where: { id: invitationId } });

    await logFamilyAuditEvent({
      familyId,
      userId: actingUser.id,
      action: "invitation.cancelled",
      entityType: "family_invitation",
      entityId: invitation.id,
      metadata: { email: invitation.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 }
    );
  }
}
