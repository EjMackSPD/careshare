import OpenAI from "openai"

let client: OpenAI | null = null

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  return client
}

export function getAssistantModel() {
  return process.env.OPENAI_ASSISTANT_MODEL || "gpt-5-mini"
}
