import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFamilyMembership } from "@/lib/auth-utils"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params
    try {
      await requireFamilyMembership(familyId)
    } catch {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      )
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { familyId },
      include: {
        messages: {
          where: { role: "ASSISTANT" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 30,
    })

    return NextResponse.json(
      conversations.map((conversation) => ({
        id: conversation.id,
        familyId: conversation.familyId,
        title: conversation.title,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        preview: conversation.messages[0]?.content ?? null,
      }))
    )
  } catch (error) {
    console.error("Failed to fetch CareAI conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
