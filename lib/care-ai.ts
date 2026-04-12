import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getAssistantModel, getOpenAIClient } from "@/lib/openai"
import type {
  AssistantCitation,
  AssistantContextSummary,
  AssistantRecommendation,
  AssistantSuggestedEvent,
  AssistantSuggestedTask,
} from "@/types/assistant"

type AssistantSource = AssistantCitation & {
  sourceText: string
}

type AssistantContextBundle = {
  promptContext: string
  sources: AssistantSource[]
  summary: AssistantContextSummary
}

type ModelOutput = {
  answer: string
  citations?: Array<{ sourceId?: string }>
  recommendations?: Array<{
    title?: string
    detail?: string
    type?: string
  }>
  suggestedTasks?: Array<{
    title?: string
    reason?: string
    priority?: string
  }>
  suggestedEvents?: Array<{
    title?: string
    reason?: string
    timeframe?: string
    type?: string
  }>
  followUps?: string[]
}

function clip(value: string | null | undefined, max = 220) {
  if (!value) return ""
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function createSource(
  sources: AssistantSource[],
  category: string,
  label: string,
  note: string,
  sourceText: string
) {
  const sourceId = `${category.toLowerCase()}-${sources.length + 1}`
  sources.push({
    sourceId,
    category,
    label,
    note,
    sourceText,
  })
}

function safeJsonParse(value: string): ModelOutput | null {
  try {
    return JSON.parse(value) as ModelOutput
  } catch (error) {
    const match = value.match(/\{[\s\S]*\}/)
    if (!match) return null

    try {
      return JSON.parse(match[0]) as ModelOutput
    } catch {
      return null
    }
  }
}

function findSourcesByCategory(
  context: AssistantContextBundle,
  category: string
) {
  return context.sources.filter((source) => source.category === category)
}

function buildOfflineFallback(input: {
  question: string
  context: AssistantContextBundle
}) {
  const taskSources = findSourcesByCategory(input.context, "Task")
  const medicationSources = findSourcesByCategory(input.context, "Medication")
  const eventSources = findSourcesByCategory(input.context, "Event")
  const noteSources = findSourcesByCategory(input.context, "Note")
  const carePlanSources = findSourcesByCategory(input.context, "Care plan")
  const profileSource = findSourcesByCategory(input.context, "Family profile")[0]

  const questionLower = input.question.toLowerCase()

  const relevant = [
    ...taskSources.slice(0, questionLower.includes("task") ? 4 : 2),
    ...medicationSources.slice(0, questionLower.includes("med") ? 4 : 2),
    ...eventSources.slice(0, questionLower.includes("event") ? 4 : 2),
    ...noteSources.slice(0, questionLower.includes("note") ? 3 : 1),
    ...carePlanSources.slice(0, 1),
  ]

  const citations = Array.from(
    new Map(relevant.map((source) => [source.sourceId, source])).values()
  )
    .slice(0, 6)
    .map((source) => ({
      sourceId: source.sourceId,
      category: source.category,
      label: source.label,
      note: source.note,
    }))

  const lines = [
    `I couldn't reach OpenAI from this environment, so here's a grounded snapshot from ${input.context.summary.familyName} instead.`,
    profileSource ? `Family context: ${profileSource.note}.` : null,
    taskSources.length
      ? `Tasks in view: ${taskSources.length} recent task records are available.`
      : "Tasks in view: no recent task records were available.",
    medicationSources.length
      ? `Medications in view: ${medicationSources.length} medication records are available.`
      : "Medications in view: no medication records were available.",
    eventSources.length
      ? `Upcoming context: ${eventSources.length} event records are available.`
      : "Upcoming context: no event records were available.",
    noteSources.length
      ? `Notes and observations: ${noteSources.length} recent notes are available.`
      : null,
    "Try the same question again once network access to OpenAI is available and CareAI can generate a more tailored recommendation.",
  ].filter(Boolean)

  const recommendations: AssistantRecommendation[] = [
    {
      title: "Review the most recent family records",
      detail:
        "Use the citations on the right to verify whether the latest tasks, medications, and events still reflect the current situation.",
      type: "insight",
    },
  ]

  if (taskSources.length > 0) {
    recommendations.push({
      title: "Start with open coordination items",
      detail:
        "Tasks are usually the fastest way to identify immediate care gaps, overdue follow-through, or unclear ownership.",
      type: "recommendation",
    })
  }

  if (carePlanSources.length > 0) {
    recommendations.push({
      title: "Compare today to the care plan",
      detail:
        "If recent notes, medications, or appointment activity feel out of sync with the current care plan, that is a good signal to review it together.",
      type: "watchout",
    })
  }

  return {
    answer: lines.join("\n\n"),
    citations,
    recommendations: recommendations.slice(0, 3),
    suggestedTasks: taskSources.length
      ? [
          {
            title: "Review and assign the most urgent open care task",
            reason:
              "Recent family task records suggest there are active coordination items that should have a clear owner.",
            priority: "HIGH" as const,
          },
        ]
      : [],
    suggestedEvents: eventSources.length === 0
      ? [
          {
            title: "Family care check-in",
            reason:
              "There are no upcoming event records in view, so a short coordination check-in could help align next steps.",
            timeframe: "Within the next 7 days",
            type: "OTHER" as const,
          },
        ]
      : [],
    followUps: [
      "Summarize the most urgent open tasks from this family data.",
      "What do the current medications and appointments suggest we should watch closely?",
      "What information is missing that would help make better care recommendations?",
    ],
  }
}

export async function buildAssistantContext(familyId: string) {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      careRecipient: true,
      carePlan: true,
      tasks: {
        include: {
          assignments: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 10,
      },
      events: {
        orderBy: {
          eventDate: "asc",
        },
        take: 8,
      },
      notes: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      },
      medications: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 8,
      },
      resources: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 8,
      },
      messages: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      },
    },
  })

  if (!family) {
    throw new Error("Family not found")
  }

  const sources: AssistantSource[] = []

  createSource(
    sources,
    "Family profile",
    family.name,
    family.elderName
      ? `Care recipient: ${family.elderName}`
      : "Core family details",
    [
      `Family name: ${family.name}`,
      family.description ? `Description: ${family.description}` : null,
      family.elderName ? `Elder name: ${family.elderName}` : null,
      family.elderPhone ? `Phone: ${family.elderPhone}` : null,
      family.elderAddress ? `Address: ${family.elderAddress}` : null,
      family.emergencyContact
        ? `Emergency contact: ${family.emergencyContact}`
        : null,
      family.medicalNotes ? `Medical notes: ${family.medicalNotes}` : null,
    ]
      .filter(Boolean)
      .join("\n")
  )

  if (family.careRecipient) {
    createSource(
      sources,
      "Care recipient",
      family.careRecipient.preferredName || family.careRecipient.name,
      clip(family.careRecipient.relationshipToCaregiver || "Recipient profile"),
      [
        `Name: ${family.careRecipient.name}`,
        family.careRecipient.preferredName
          ? `Preferred name: ${family.careRecipient.preferredName}`
          : null,
        family.careRecipient.relationshipToCaregiver
          ? `Relationship: ${family.careRecipient.relationshipToCaregiver}`
          : null,
        family.careRecipient.phone
          ? `Phone: ${family.careRecipient.phone}`
          : null,
        family.careRecipient.address
          ? `Address: ${family.careRecipient.address}`
          : null,
        family.careRecipient.medicalNotes
          ? `Medical notes: ${family.careRecipient.medicalNotes}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    )
  }

  if (family.carePlan) {
    createSource(
      sources,
      "Care plan",
      `Care level: ${family.carePlan.careLevel}`,
      clip(family.carePlan.careLevelDescription || "Active care plan"),
      [
        `Care level: ${family.carePlan.careLevel}`,
        family.carePlan.careLevelDescription
          ? `Description: ${family.carePlan.careLevelDescription}`
          : null,
        family.carePlan.estimatedCostMin !== null
          ? `Estimated cost min: $${family.carePlan.estimatedCostMin}`
          : null,
        family.carePlan.estimatedCostMax !== null
          ? `Estimated cost max: $${family.carePlan.estimatedCostMax}`
          : null,
        family.carePlan.careNotes
          ? `Care notes: ${family.carePlan.careNotes}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    )
  }

  family.tasks.forEach((task) => {
    const assignees = task.assignments
      .map((assignment) => assignment.user.name || assignment.user.email)
      .join(", ")

    createSource(
      sources,
      "Task",
      task.title,
      `${task.status}${task.dueDate ? ` • due ${task.dueDate.toISOString().slice(0, 10)}` : ""}`,
      [
        `Title: ${task.title}`,
        task.description ? `Description: ${task.description}` : null,
        `Priority: ${task.priority}`,
        `Status: ${task.status}`,
        task.dueDate ? `Due date: ${task.dueDate.toISOString()}` : null,
        assignees ? `Assigned to: ${assignees}` : "Assigned to: nobody",
      ]
        .filter(Boolean)
        .join("\n")
    )
  })

  family.events.forEach((event) => {
    createSource(
      sources,
      "Event",
      event.title,
      `${event.type} • ${event.eventDate.toISOString().slice(0, 10)}`,
      [
        `Title: ${event.title}`,
        `Type: ${event.type}`,
        `Date: ${event.eventDate.toISOString()}`,
        event.location ? `Location: ${event.location}` : null,
        event.description ? `Description: ${event.description}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    )
  })

  family.notes.forEach((note) => {
    createSource(
      sources,
      "Note",
      note.title || `Note from ${note.user.name || note.user.email}`,
      clip(note.category || "Shared note"),
      [
        note.title ? `Title: ${note.title}` : null,
        note.category ? `Category: ${note.category}` : null,
        `Author: ${note.user.name || note.user.email}`,
        `Created: ${note.createdAt.toISOString()}`,
        `Content: ${note.content}`,
      ]
        .filter(Boolean)
        .join("\n")
    )
  })

  family.medications.forEach((medication) => {
    createSource(
      sources,
      "Medication",
      medication.name,
      `${medication.frequency}${medication.active ? " • active" : " • inactive"}`,
      [
        `Name: ${medication.name}`,
        `Dosage: ${medication.dosage}`,
        `Frequency: ${medication.frequency}`,
        medication.timeOfDay ? `Time of day: ${medication.timeOfDay}` : null,
        medication.instructions
          ? `Instructions: ${medication.instructions}`
          : null,
        medication.prescribedBy
          ? `Prescribed by: ${medication.prescribedBy}`
          : null,
        `Start date: ${medication.startDate.toISOString()}`,
        medication.endDate ? `End date: ${medication.endDate.toISOString()}` : null,
        medication.refillDate
          ? `Refill date: ${medication.refillDate.toISOString()}`
          : null,
        medication.pharmacy ? `Pharmacy: ${medication.pharmacy}` : null,
        medication.notes ? `Notes: ${medication.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    )
  })

  family.resources.forEach((resource) => {
    createSource(
      sources,
      "Resource",
      resource.title,
      clip(resource.category),
      [
        `Title: ${resource.title}`,
        `Category: ${resource.category}`,
        resource.description ? `Description: ${resource.description}` : null,
        resource.url ? `URL: ${resource.url}` : null,
        resource.fileUrl ? `File: ${resource.fileUrl}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    )
  })

  family.messages.forEach((message) => {
    createSource(
      sources,
      "Family message",
      `Message from ${message.user.name || message.user.email}`,
      clip(message.message, 80),
      [
        `Author: ${message.user.name || message.user.email}`,
        `Created: ${message.createdAt.toISOString()}`,
        `Message: ${message.message}`,
      ].join("\n")
    )
  })

  createSource(
    sources,
    "General guidance",
    "General caregiving guidance",
    "Use only when family data is incomplete or for best-practice suggestions",
    "This source represents general caregiving knowledge and should be cited only when the answer includes an inference, recommendation, or general best practice that is not directly stated in the family records."
  )

  const promptContext = sources
    .map(
      (source) =>
        `[${source.sourceId}] ${source.category} | ${source.label}\n${source.sourceText}`
    )
    .join("\n\n")

  return {
    family,
    contextBundle: {
      promptContext,
      sources,
      summary: {
        familyName: family.name,
        careRecipientName:
          family.careRecipient?.preferredName ||
          family.careRecipient?.name ||
          family.elderName ||
          null,
        sourceChips: [
          "Family profile",
          family.careRecipient ? "Care recipient" : null,
          family.carePlan ? "Care plan" : null,
          family.tasks.length ? `${family.tasks.length} tasks` : null,
          family.events.length ? `${family.events.length} events` : null,
          family.notes.length ? `${family.notes.length} notes` : null,
          family.medications.length ? `${family.medications.length} medications` : null,
          family.resources.length ? `${family.resources.length} resources` : null,
          family.messages.length ? `${family.messages.length} chat messages` : null,
        ].filter(Boolean) as string[],
      },
    },
  }
}

export function createConversationTitle(message: string) {
  const trimmed = message.trim().replace(/\s+/g, " ")
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed
}

export function formatConversationMessage(
  message: {
    id: string
    role: "USER" | "ASSISTANT" | "SYSTEM"
    content: string
    citedContext: Prisma.JsonValue | null
    createdAt: Date
  }
) {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    citedContext: (message.citedContext as {
      citations?: AssistantCitation[]
      recommendations?: AssistantRecommendation[]
      followUps?: string[]
      contextSummary?: AssistantContextSummary
    } | null) ?? null,
    createdAt: message.createdAt.toISOString(),
  }
}

export async function generateAssistantReply(input: {
  question: string
  conversationHistory: Array<{ role: string; content: string }>
  context: AssistantContextBundle
}) {
  try {
    const client = getOpenAIClient()
    const model = getAssistantModel()

    const instructions = [
      "You are CareAI, a family care coordination assistant inside CareShare.",
      "Use family records as the source of truth whenever they are available.",
      "If the data needed is missing, say that clearly and do not invent details.",
      "General caregiving knowledge is allowed only for recommendations or inferences, and it must be framed as guidance rather than fact.",
      "Never claim medical, legal, or financial certainty.",
      "If the user asks you to create or edit records, do not pretend you did it. Offer a suggested task or suggested calendar event instead.",
      "Return valid JSON only.",
      'Schema: {"answer":"string","citations":[{"sourceId":"string"}],"recommendations":[{"title":"string","detail":"string","type":"recommendation|insight|watchout"}],"suggestedTasks":[{"title":"string","reason":"string","priority":"LOW|MEDIUM|HIGH|URGENT"}],"suggestedEvents":[{"title":"string","reason":"string","timeframe":"string","type":"APPOINTMENT|VISIT|OTHER"}],"followUps":["string"]}',
      "Citations must use only the listed source IDs.",
      "Use the General guidance source only when you are making a recommendation or inference beyond explicit family facts.",
      "Only include suggestedTasks or suggestedEvents when they would genuinely help. These are suggestions, not actions that have already been taken.",
    ].join("\n")

    const historyText = input.conversationHistory
      .slice(-8)
      .map((entry) => `${entry.role}: ${entry.content}`)
      .join("\n")

    const response = await client.responses.create({
      model,
      store: false,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: instructions }],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `Family context:\n${input.context.promptContext}`,
                historyText ? `Recent conversation:\n${historyText}` : null,
                `User question:\n${input.question}`,
              ]
                .filter(Boolean)
                .join("\n\n"),
            },
          ],
        },
      ],
    })

    const parsed = safeJsonParse(response.output_text)

    if (!parsed?.answer) {
      throw new Error("CareAI returned an invalid response")
    }

    const sourceMap = new Map(
      input.context.sources.map((source) => [source.sourceId, source])
    )

    const citationIds = Array.from(
      new Set(
        (parsed.citations || [])
          .map((citation) => citation.sourceId?.trim())
          .filter((value): value is string => typeof value === "string")
          .filter((value) => sourceMap.has(value))
      )
    )

    const citations = citationIds.map((sourceId) => {
      const source = sourceMap.get(sourceId)!
      return {
        sourceId: source.sourceId,
        category: source.category,
        label: source.label,
        note: source.note,
      }
    })

    const recommendations = (parsed.recommendations || [])
      .filter((item) => item.title && item.detail)
      .slice(0, 3)
      .map((item) => ({
        title: item.title!.trim(),
        detail: item.detail!.trim(),
        type:
          item.type === "insight" || item.type === "watchout"
          ? item.type
          : "recommendation",
      })) as AssistantRecommendation[]

    const suggestedTasks = (parsed.suggestedTasks || [])
      .filter((item) => item.title && item.reason)
      .slice(0, 3)
      .map((item) => ({
        title: item.title!.trim(),
        reason: item.reason!.trim(),
        priority:
          item.priority === "LOW" ||
          item.priority === "HIGH" ||
          item.priority === "URGENT"
            ? item.priority
            : "MEDIUM",
      })) as AssistantSuggestedTask[]

    const suggestedEvents = (parsed.suggestedEvents || [])
      .filter((item) => item.title && item.reason && item.timeframe)
      .slice(0, 3)
      .map((item) => ({
        title: item.title!.trim(),
        reason: item.reason!.trim(),
        timeframe: item.timeframe!.trim(),
        type:
          item.type === "APPOINTMENT" || item.type === "VISIT"
            ? item.type
            : "OTHER",
      })) as AssistantSuggestedEvent[]

    const followUps = (parsed.followUps || [])
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3)

    return {
      answer: parsed.answer.trim(),
      citations,
      recommendations,
      suggestedTasks,
      suggestedEvents,
      followUps,
    }
  } catch (error) {
    console.error("CareAI falling back to local summary:", error)
    return buildOfflineFallback(input)
  }
}
