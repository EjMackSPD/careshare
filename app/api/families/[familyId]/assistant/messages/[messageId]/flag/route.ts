import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFamilyMembership, logFamilyAuditEvent } from "@/lib/auth-utils"

// POST - Flag an assistant message as uncertain/unhelpful for human review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string; messageId: string }> }
) {
  try {
    const { familyId, messageId } = await params

    let user
    try {
      const result = await requireFamilyMembership(familyId)
      user = result.user
    } catch {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      )
    }

    const message = await prisma.aIMessage.findFirst({
      where: {
        id: messageId,
        conversation: { familyId },
      },
    })

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      )
    }

    const updated = await prisma.aIMessage.update({
      where: { id: messageId },
      data: { flagged: true },
    })

    await logFamilyAuditEvent({
      familyId,
      userId: user.id,
      action: "assistant.message_flagged",
      entityType: "ai_message",
      entityId: messageId,
    })

    return NextResponse.json({ id: updated.id, flagged: updated.flagged })
  } catch (error) {
    console.error("Error flagging Care Concierge message:", error)
    return NextResponse.json(
      { error: "Failed to flag message" },
      { status: 500 }
    )
  }
}
