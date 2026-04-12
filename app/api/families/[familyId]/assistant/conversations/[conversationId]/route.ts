import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFamilyMembership } from "@/lib/auth-utils"
import { formatConversationMessage } from "@/lib/care-ai"

export async function GET(
  request: Request,
  {
    params,
  }: { params: Promise<{ familyId: string; conversationId: string }> }
) {
  try {
    const { familyId, conversationId } = await params
    try {
      await requireFamilyMembership(familyId)
    } catch {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      )
    }

    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        familyId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: conversation.id,
      familyId: conversation.familyId,
      title: conversation.title,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messages: conversation.messages.map((message) =>
        formatConversationMessage({
          ...message,
          role: message.role,
        })
      ),
    })
  } catch (error) {
    console.error("Failed to fetch CareAI conversation:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    )
  }
}
