import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getAssistantModel, getOpenAIClient } from "@/lib/openai"
import { getPublishedProviders } from "@/lib/cms"
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

type HighlightModelOutput = {
  recommendations?: Array<{
    title?: string
    detail?: string
    type?: string
  }>
  suggestedTask?: {
    title?: string
    reason?: string
    priority?: string
  } | null
}

export type HighlightSummary = {
  recommendations: AssistantRecommendation[]
  suggestedTask: AssistantSuggestedTask | null
}

// Structured Outputs schemas — guarantee valid JSON so the verbose schema prose
// can be dropped from the prompt (saving input tokens) and parsing never fails.
const RECOMMENDATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "detail", "type"],
  properties: {
    title: { type: "string" },
    detail: { type: "string" },
    type: { type: "string", enum: ["recommendation", "insight", "watchout"] },
  },
} as const

const CARE_REPLY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "answer",
    "citations",
    "recommendations",
    "suggestedTasks",
    "suggestedEvents",
    "followUps",
  ],
  properties: {
    answer: { type: "string" },
    citations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sourceId"],
        properties: { sourceId: { type: "string" } },
      },
    },
    recommendations: { type: "array", items: RECOMMENDATION_SCHEMA },
    suggestedTasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "reason", "priority"],
        properties: {
          title: { type: "string" },
          reason: { type: "string" },
          priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
          },
        },
      },
    },
    suggestedEvents: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "reason", "timeframe", "type"],
        properties: {
          title: { type: "string" },
          reason: { type: "string" },
          timeframe: { type: "string" },
          type: { type: "string", enum: ["APPOINTMENT", "VISIT", "OTHER"] },
        },
      },
    },
    followUps: { type: "array", items: { type: "string" } },
  },
} as const

const HIGHLIGHT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["recommendations", "suggestedTask"],
  properties: {
    recommendations: { type: "array", items: RECOMMENDATION_SCHEMA },
    suggestedTask: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["title", "reason", "priority"],
      properties: {
        title: { type: "string" },
        reason: { type: "string" },
        priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
      },
    },
  },
} as const

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

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch (error) {
    const match = value.match(/\{[\s\S]*\}/)
    if (!match) return null

    try {
      return JSON.parse(match[0]) as T
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

// Prefix of the answer returned when OpenAI is unreachable. Callers use this to
// avoid caching a degraded fallback response.
export const OFFLINE_ANSWER_PREFIX =
  "I couldn't reach OpenAI from this environment"

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
    `${OFFLINE_ANSWER_PREFIX}, so here's a grounded snapshot from ${input.context.summary.familyName} instead.`,
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
    "Try the same question again once network access to OpenAI is available and the Care Concierge can generate a more tailored recommendation.",
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

export async function buildAssistantContext(
  familyId: string,
  options: { scope?: "full" | "highlight" } = {}
) {
  // The dashboard highlight only reasons over tasks/care-plan/events, so it skips
  // providers, chat messages, and resources entirely to cut input tokens.
  const isHighlight = options.scope === "highlight"

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
        take: 5,
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
        take: 5,
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
        take: 5,
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
      family.medicalNotes
        ? `Medical notes: ${clip(family.medicalNotes, 300)}`
        : null,
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
          ? `Medical notes: ${clip(family.careRecipient.medicalNotes, 300)}`
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
          ? `Care notes: ${clip(family.carePlan.careNotes, 200)}`
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
        task.description ? `Description: ${clip(task.description, 200)}` : null,
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
        event.description ? `Description: ${clip(event.description, 160)}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    )
  })

  const notesForScope = isHighlight ? family.notes.slice(0, 3) : family.notes
  notesForScope.forEach((note) => {
    createSource(
      sources,
      "Note",
      note.title || `Note from ${note.user.name || note.user.email}`,
      clip(note.category || "Shared note"),
      [
        note.title ? `Title: ${note.title}` : null,
        note.category ? `Category: ${note.category}` : null,
        `Author: ${note.user.name || note.user.email}`,
        `Created: ${note.createdAt.toISOString().slice(0, 10)}`,
        `Content: ${clip(note.content, 300)}`,
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
          ? `Instructions: ${clip(medication.instructions, 120)}`
          : null,
        medication.prescribedBy
          ? `Prescribed by: ${medication.prescribedBy}`
          : null,
        `Start date: ${medication.startDate.toISOString().slice(0, 10)}`,
        medication.endDate
          ? `End date: ${medication.endDate.toISOString().slice(0, 10)}`
          : null,
        medication.refillDate
          ? `Refill date: ${medication.refillDate.toISOString().slice(0, 10)}`
          : null,
        medication.pharmacy ? `Pharmacy: ${medication.pharmacy}` : null,
        medication.notes ? `Notes: ${clip(medication.notes, 120)}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    )
  })

  if (!isHighlight) {
    family.resources.forEach((resource) => {
      createSource(
        sources,
        "Resource",
        resource.title,
        clip(resource.category),
        [
          `Title: ${resource.title}`,
          `Category: ${resource.category}`,
          resource.description
            ? `Description: ${clip(resource.description, 160)}`
            : null,
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
          `Created: ${message.createdAt.toISOString().slice(0, 10)}`,
          `Message: ${clip(message.message, 200)}`,
        ].join("\n")
      )
    })
  }

  const providers = isHighlight ? [] : await getPublishedProviders()

  providers.slice(0, 6).forEach((provider) => {
    createSource(
      sources,
      "Local provider",
      provider.name,
      provider.category.replace(/_/g, " ").toLowerCase(),
      [
        `Name: ${provider.name}`,
        `Category: ${provider.category}`,
        `Description: ${clip(provider.description, 160)}`,
        provider.serviceArea ? `Service area: ${provider.serviceArea}` : null,
        provider.phone ? `Phone: ${provider.phone}` : null,
        provider.email ? `Email: ${provider.email}` : null,
        provider.website ? `Website: ${provider.website}` : null,
        provider.vetted ? "Vetted by CareShare staff." : null,
      ]
        .filter(Boolean)
        .join("\n")
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
          providers.length ? `${providers.length} local providers` : null,
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
    flagged: boolean
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
    flagged: message.flagged,
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
      "You are the CareShare Care Concierge, a family care coordination assistant inside CareShare.",
      "Use family records as the source of truth whenever they are available.",
      "If the data needed is missing, say that clearly and do not invent details.",
      "General caregiving knowledge is allowed only for recommendations or inferences, and it must be framed as guidance rather than fact.",
      "Never claim medical, legal, or financial certainty.",
      "If the user asks you to create or edit records, do not pretend you did it. Offer a suggested task or suggested calendar event instead.",
      "Citations must use only the provided source IDs.",
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
      reasoning: { effort: "low" },
      max_output_tokens: 1500,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "care_reply",
          strict: true,
          schema: CARE_REPLY_SCHEMA,
        },
      },
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

    const parsed = safeJsonParse<ModelOutput>(response.output_text)

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
    console.error("Care Concierge falling back to local summary:", error)
    return buildOfflineFallback(input)
  }
}

function buildOfflineHighlightSummary(
  context: AssistantContextBundle
): HighlightSummary {
  const taskSources = findSourcesByCategory(context, "Task")
  const carePlanSources = findSourcesByCategory(context, "Care plan")

  const recommendations: AssistantRecommendation[] = [
    {
      title: "Review the most recent family records",
      detail:
        "OpenAI wasn't reachable, so this is a grounded snapshot rather than a generated recommendation. Check the latest tasks and care plan for anything that needs attention.",
      type: "insight",
    },
  ]

  if (carePlanSources.length > 0) {
    recommendations.push({
      title: "Compare today to the care plan",
      detail:
        "If recent activity feels out of sync with the current care plan, that's a good signal to review it together.",
      type: "watchout",
    })
  }

  const suggestedTask: AssistantSuggestedTask | null = taskSources.length
    ? {
        title: "Review and assign the most urgent open care task",
        reason:
          "Recent family task records suggest there are active coordination items that should have a clear owner.",
        priority: "HIGH",
      }
    : null

  return {
    recommendations: recommendations.slice(0, 2),
    suggestedTask,
  }
}

export async function generateHighlightSummary(
  context: AssistantContextBundle
): Promise<HighlightSummary> {
  try {
    const client = getOpenAIClient()
    const model = getAssistantModel()

    const instructions = [
      "You are the CareShare Care Concierge, generating a short proactive highlight for a family's dashboard.",
      "Use family records as the source of truth. If the data is sparse, keep recommendations general and grounded rather than inventing specifics.",
      "Never claim medical, legal, or financial certainty.",
      "Return at most 2 recommendations and at most 1 suggested task.",
      "Only include a suggestedTask when a concrete, genuinely useful next action stands out from the family's open tasks or upcoming needs; otherwise set it to null.",
    ].join("\n")

    const response = await client.responses.create({
      model,
      store: false,
      reasoning: { effort: "minimal" },
      max_output_tokens: 700,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "care_highlight",
          strict: true,
          schema: HIGHLIGHT_SCHEMA,
        },
      },
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
              text: `Family context:\n${context.promptContext}\n\nGenerate the dashboard highlight now.`,
            },
          ],
        },
      ],
    })

    const parsed = safeJsonParse<HighlightModelOutput>(response.output_text)

    if (!parsed) {
      throw new Error("CareAI returned an invalid highlight response")
    }

    const recommendations = (parsed.recommendations || [])
      .filter((item) => item.title && item.detail)
      .slice(0, 2)
      .map((item) => ({
        title: item.title!.trim(),
        detail: item.detail!.trim(),
        type:
          item.type === "insight" || item.type === "watchout"
            ? item.type
            : "recommendation",
      })) as AssistantRecommendation[]

    const suggestedTask: AssistantSuggestedTask | null =
      parsed.suggestedTask?.title && parsed.suggestedTask?.reason
        ? {
            title: parsed.suggestedTask.title.trim(),
            reason: parsed.suggestedTask.reason.trim(),
            priority:
              parsed.suggestedTask.priority === "LOW" ||
              parsed.suggestedTask.priority === "HIGH" ||
              parsed.suggestedTask.priority === "URGENT"
                ? parsed.suggestedTask.priority
                : "MEDIUM",
          }
        : null

    return { recommendations, suggestedTask }
  } catch (error) {
    console.error("Care Concierge highlight falling back to local summary:", error)
    return buildOfflineHighlightSummary(context)
  }
}
