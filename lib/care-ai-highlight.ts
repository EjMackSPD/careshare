import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { buildAssistantContext, generateHighlightSummary } from "@/lib/care-ai"
import type { AssistantRecommendation, AssistantSuggestedTask } from "@/types/assistant"

const STALE_MS = 30 * 60 * 1000

export type DashboardHighlight = {
  recommendations: AssistantRecommendation[]
  suggestedTask: AssistantSuggestedTask | null
}

export async function getOrRefreshHighlight(
  familyId: string
): Promise<DashboardHighlight> {
  const cached = await prisma.aIHighlight.findUnique({ where: { familyId } })

  if (cached && Date.now() - cached.generatedAt.getTime() < STALE_MS) {
    return {
      recommendations: cached.recommendations as unknown as AssistantRecommendation[],
      suggestedTask: (cached.suggestedTask as unknown as AssistantSuggestedTask) ?? null,
    }
  }

  const { contextBundle } = await buildAssistantContext(familyId)
  const result = await generateHighlightSummary(contextBundle)

  const suggestedTaskJson = result.suggestedTask
    ? (result.suggestedTask as unknown as Prisma.InputJsonValue)
    : Prisma.JsonNull

  await prisma.aIHighlight.upsert({
    where: { familyId },
    create: {
      familyId,
      recommendations: result.recommendations as unknown as Prisma.InputJsonValue,
      suggestedTask: suggestedTaskJson,
    },
    update: {
      recommendations: result.recommendations as unknown as Prisma.InputJsonValue,
      suggestedTask: suggestedTaskJson,
      generatedAt: new Date(),
    },
  })

  return result
}
