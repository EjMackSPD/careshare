import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { buildAssistantContext, generateHighlightSummary } from "@/lib/care-ai"
import { getFamilyDataVersion } from "@/lib/family-data-version"
import type { AssistantRecommendation, AssistantSuggestedTask } from "@/types/assistant"

// Regenerate at most once a day even if nothing changed (safety refresh), and
// immediately whenever the family's data version changes. Between those, reuse
// the cache and skip the OpenAI call entirely.
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export type DashboardHighlight = {
  recommendations: AssistantRecommendation[]
  suggestedTask: AssistantSuggestedTask | null
}

export async function getOrRefreshHighlight(
  familyId: string
): Promise<DashboardHighlight> {
  const [cached, dataVersion] = await Promise.all([
    prisma.aIHighlight.findUnique({ where: { familyId } }),
    getFamilyDataVersion(familyId),
  ])

  const isFresh =
    cached &&
    cached.dataVersion === dataVersion &&
    Date.now() - cached.generatedAt.getTime() < MAX_AGE_MS

  if (isFresh) {
    return {
      recommendations: cached.recommendations as unknown as AssistantRecommendation[],
      suggestedTask: (cached.suggestedTask as unknown as AssistantSuggestedTask) ?? null,
    }
  }

  const { contextBundle } = await buildAssistantContext(familyId, {
    scope: "highlight",
  })
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
      dataVersion,
    },
    update: {
      recommendations: result.recommendations as unknown as Prisma.InputJsonValue,
      suggestedTask: suggestedTaskJson,
      dataVersion,
      generatedAt: new Date(),
    },
  })

  return result
}
