import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, logFamilyAuditEvent } from "@/lib/auth-utils"

// POST - Accept a family invitation addressed to the current user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const user = await requireAuth()
    const { invitationId } = await params

    const invitation = await prisma.familyInvitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      )
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invitation is not addressed to you" },
        { status: 403 }
      )
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "This invitation has already been responded to" },
        { status: 400 }
      )
    }

    const existingMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: invitation.familyId,
          userId: user.id,
        },
      },
    })

    if (!existingMember) {
      await prisma.familyMember.create({
        data: {
          familyId: invitation.familyId,
          userId: user.id,
          role: invitation.role,
        },
      })
    }

    const updatedInvitation = await prisma.familyInvitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    })

    await logFamilyAuditEvent({
      familyId: invitation.familyId,
      userId: user.id,
      action: "invitation.accepted",
      entityType: "family_invitation",
      entityId: invitation.id,
      metadata: {
        email: invitation.email,
        role: invitation.role,
      },
    })

    return NextResponse.json(updatedInvitation)
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    )
  }
}
