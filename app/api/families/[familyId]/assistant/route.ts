import { NextResponse } from "next/server"
import { createHash } from "crypto"
import { Prisma } from "@prisma/client"
import {
  buildAssistantContext,
  createConversationTitle,
  formatConversationMessage,
  generateAssistantReply,
  OFFLINE_ANSWER_PREFIX,
} from "@/lib/care-ai"
import { getFamilyDataVersion } from "@/lib/family-data-version"
import { prisma } from "@/lib/prisma"
import { requireFamilyMembership } from "@/lib/auth-utils"

// Cached chat replies are reused for an identical question in the same family +
// conversation state, until the family's data changes or this TTL elapses.
const CHAT_CACHE_TTL_MS = 60 * 60 * 1000

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex")

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

    const history = existingConversation?.messages || []
    const historyForModel = history.map((entry) => ({
      role: entry.role.toLowerCase(),
      content: entry.content,
    }))

    // Cache key: identical question + conversation state + family data → reuse.
    const dataVersion = await getFamilyDataVersion(familyId, {
      includeMessages: true,
    })
    const historySignature = sha256(JSON.stringify(historyForModel))
    const cacheKey = sha256(
      [familyId, dataVersion, message.trim().toLowerCase(), historySignature].join(
        "|"
      )
    )

    type ReplyPayload = Awaited<ReturnType<typeof generateAssistantReply>> & {
      contextSummary: Awaited<
        ReturnType<typeof buildAssistantContext>
      >["contextBundle"]["summary"]
    }

    const cachedRow = await prisma.aIResponseCache.findUnique({
      where: { cacheKey },
    })

    let payload: ReplyPayload
    if (
      cachedRow &&
      Date.now() - cachedRow.createdAt.getTime() < CHAT_CACHE_TTL_MS
    ) {
      payload = cachedRow.response as unknown as ReplyPayload
    } else {
      const { contextBundle } = await buildAssistantContext(familyId)
      const reply = await generateAssistantReply({
        question: message,
        conversationHistory: historyForModel,
        context: contextBundle,
      })
      payload = { ...reply, contextSummary: contextBundle.summary }

      // Don't cache degraded offline-fallback answers.
      if (!payload.answer.startsWith(OFFLINE_ANSWER_PREFIX)) {
        await prisma.aIResponseCache.upsert({
          where: { cacheKey },
          create: {
            familyId,
            cacheKey,
            response: payload as unknown as Prisma.InputJsonValue,
          },
          update: {
            response: payload as unknown as Prisma.InputJsonValue,
            createdAt: new Date(),
          },
        })
      }
    }

    const assistantContext = {
      citations: payload.citations,
      recommendations: payload.recommendations,
      suggestedTasks: payload.suggestedTasks,
      suggestedEvents: payload.suggestedEvents,
      followUps: payload.followUps,
      contextSummary: payload.contextSummary,
    } satisfies Prisma.JsonObject

    const assistantMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: payload.answer,
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
      citations: payload.citations,
      recommendations: payload.recommendations,
      suggestedTasks: payload.suggestedTasks,
      suggestedEvents: payload.suggestedEvents,
      followUps: payload.followUps,
      contextSummary: payload.contextSummary,
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
