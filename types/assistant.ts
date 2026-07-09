export type AssistantCitation = {
  sourceId: string
  category: string
  label: string
  note: string
}

export type AssistantRecommendation = {
  title: string
  detail: string
  type: "recommendation" | "insight" | "watchout"
}

export type AssistantSuggestedTask = {
  title: string
  reason: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
}

export type AssistantSuggestedEvent = {
  title: string
  reason: string
  timeframe: string
  type: "APPOINTMENT" | "VISIT" | "OTHER"
}

export type AssistantContextSummary = {
  familyName: string
  careRecipientName: string | null
  sourceChips: string[]
}

export type AssistantMessage = {
  id: string
  role: "USER" | "ASSISTANT" | "SYSTEM"
  content: string
  citedContext: {
    citations?: AssistantCitation[]
    recommendations?: AssistantRecommendation[]
    suggestedTasks?: AssistantSuggestedTask[]
    suggestedEvents?: AssistantSuggestedEvent[]
    followUps?: string[]
    contextSummary?: AssistantContextSummary
  } | null
  flagged: boolean
  createdAt: string
}

export type AssistantConversation = {
  id: string
  familyId: string
  title: string
  createdAt: string
  updatedAt: string
  preview: string | null
}

export type AssistantResponse = {
  conversationId: string
  userMessage: AssistantMessage
  assistantMessage: AssistantMessage
  citations: AssistantCitation[]
  recommendations: AssistantRecommendation[]
  suggestedTasks: AssistantSuggestedTask[]
  suggestedEvents: AssistantSuggestedEvent[]
  followUps: string[]
  contextSummary: AssistantContextSummary
}
