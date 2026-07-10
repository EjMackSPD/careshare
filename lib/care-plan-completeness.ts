import { prisma } from "@/lib/prisma"

export type CarePlanChecklistItem = {
  key: string
  label: string
  done: boolean
  href: string
}

export type CarePlanCompleteness = {
  percent: number
  completedCount: number
  totalCount: number
  items: CarePlanChecklistItem[]
  nextStep: CarePlanChecklistItem | null
}

const EMERGENCY_SCENARIO_TYPES = ["MEDICAL_EMERGENCY", "HOSPITALIZATION"]

export async function getCarePlanCompleteness(
  familyId: string
): Promise<CarePlanCompleteness> {
  const [carePlan, careRecipient, documentCount, scenarios] = await Promise.all([
    prisma.carePlan.findUnique({ where: { familyId } }),
    prisma.careRecipient.findUnique({ where: { familyId } }),
    prisma.document.count({ where: { familyId } }),
    prisma.careScenario.findMany({
      where: { familyId },
      select: { type: true },
    }),
  ])

  const scenarioTypes = new Set(scenarios.map((scenario) => scenario.type))
  const hasEmergencyScenario = EMERGENCY_SCENARIO_TYPES.some((type) =>
    scenarioTypes.has(type as never)
  )

  const items: CarePlanChecklistItem[] = [
    {
      key: "care-recipient",
      label: "Add care recipient details",
      done: Boolean(
        careRecipient?.phone && careRecipient?.address && careRecipient?.medicalNotes
      ),
      href: `/family/${familyId}/settings`,
    },
    {
      key: "care-level",
      label: "Describe the current care level",
      done: Boolean(carePlan?.careLevelDescription?.trim()),
      href: "/dashboard/care-plan",
    },
    {
      key: "cost-estimate",
      label: "Estimate monthly care costs",
      done: carePlan?.estimatedCostMin != null && carePlan?.estimatedCostMax != null,
      href: "/dashboard/care-plan",
    },
    {
      key: "documents",
      label: "Upload a key document (medical, legal, or insurance)",
      done: documentCount > 0,
      href: "/dashboard/care-plan?tab=documents",
    },
    {
      key: "emergency-plan",
      label: "Set up an emergency care scenario",
      done: hasEmergencyScenario,
      href: "/dashboard/care-plan?tab=scenarios",
    },
    {
      key: "end-of-life",
      label: "Record end-of-life preferences",
      done: scenarioTypes.has("END_OF_LIFE" as never),
      href: "/dashboard/care-plan?tab=scenarios",
    },
  ]

  const completedCount = items.filter((item) => item.done).length
  const totalCount = items.length
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const nextStep = items.find((item) => !item.done) ?? null

  return { percent, completedCount, totalCount, items, nextStep }
}
