import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import {
  buildAssistantContext,
  createConversationTitle,
  formatConversationMessage,
  generateAssistantReply,
} from "@/lib/care-ai"
import { prisma } from "@/lib/prisma"
import { requireFamilyMembership } from "@/lib/auth-utils"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params
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
    const body = await request.json()
    const message =
      typeof body.message === "string" ? body.message.trim() : ""
    const conversationId =
      typeof body.conversationId === "string" ? body.conversationId : null

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const existingConversation = conversationId
      ? await prisma.aIConversation.findFirst({
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
      : null

    if (conversationId && !existingConversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    const conversation =
      existingConversation ||
      (await prisma.aIConversation.create({
        data: {
          familyId,
          createdBy: user.id,
          title: createConversationTitle(message),
        },
      }))

    const userMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: message,
      },
    })

    const { contextBundle } = await buildAssistantContext(familyId)

    const history = existingConversation?.messages || []
    const reply = await generateAssistantReply({
      question: message,
      conversationHistory: history.map((entry) => ({
        role: entry.role.toLowerCase(),
        content: entry.content,
      })),
      context: contextBundle,
    })

    const assistantContext = {
      citations: reply.citations,
      recommendations: reply.recommendations,
      suggestedTasks: reply.suggestedTasks,
      suggestedEvents: reply.suggestedEvents,
      followUps: reply.followUps,
      contextSummary: contextBundle.summary,
    } satisfies Prisma.JsonObject

    const assistantMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: reply.answer,
        citedContext: assistantContext,
      },
    })

    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: {
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      conversationId: conversation.id,
      userMessage: formatConversationMessage({
        ...userMessage,
        role: "USER",
      }),
      assistantMessage: formatConversationMessage({
        ...assistantMessage,
        role: "ASSISTANT",
      }),
      citations: reply.citations,
      recommendations: reply.recommendations,
      suggestedTasks: reply.suggestedTasks,
      suggestedEvents: reply.suggestedEvents,
      followUps: reply.followUps,
      contextSummary: contextBundle.summary,
    })
  } catch (error) {
    console.error("CareAI request failed:", error)
    return NextResponse.json(
      {
        error:
          "CareAI couldn't answer right now. Please try again in a moment.",
      },
      { status: 500 }
    )
  }
}
