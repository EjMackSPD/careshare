"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import {
  ArrowUp,
  BrainCircuit,
  ChevronDown,
  Flag,
  Lightbulb,
  LifeBuoy,
  MessageSquareText,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import type {
  AssistantConversation,
  AssistantMessage,
  AssistantResponse,
  AssistantSuggestedEvent,
  AssistantSuggestedTask,
} from "@/types/assistant"
import styles from "./page.module.css"

type Family = {
  id: string
  name: string
  elderName: string | null
  careRecipient?: {
    name: string
    preferredName?: string | null
  } | null
}

const starterPrompts = [
  "What should our family focus on this week?",
  "What risks or gaps do you see in the current care plan?",
  "Summarize medications, upcoming events, and open tasks for me.",
  "Based on our notes and chat, what questions should we ask at the next appointment?",
]

function truncatePreview(value: string | null, max = 72) {
  if (!value) return "No assistant reply yet."
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

let optimisticMessageCounter = 0

export default function CareConciergePage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("")
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [conversations, setConversations] = useState<AssistantConversation[]>(
    []
  )
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loadingFamilies, setLoadingFamilies] = useState(true)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [articulationStep, setArticulationStep] = useState(0)
  const [flaggingMessageId, setFlaggingMessageId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!pending) {
      setArticulationStep(0)
      return
    }

    const interval = window.setInterval(() => {
      setArticulationStep((current) => (current + 1) % 3)
    }, 1100)

    return () => window.clearInterval(interval)
  }, [pending])

  useEffect(() => {
    async function fetchFamilies() {
      try {
        setLoadingFamilies(true)
        const response = await fetch("/api/families")
        if (!response.ok) {
          throw new Error("Failed to load families")
        }

        const data = (await response.json()) as Family[]
        setFamilies(data)
        if (data[0]) {
          setSelectedFamilyId(data[0].id)
        }
      } catch (err) {
        console.error(err)
        setError("Couldn't load your family workspaces.")
      } finally {
        setLoadingFamilies(false)
      }
    }

    fetchFamilies()
  }, [])

  useEffect(() => {
    if (!selectedFamilyId) return

    async function fetchConversations() {
      try {
        setError(null)
        setMessages([])
        setSelectedConversationId(null)
        const response = await fetch(
          `/api/families/${selectedFamilyId}/assistant/conversations`
        )
        if (!response.ok) {
          throw new Error("Failed to load conversations")
        }

        const data = (await response.json()) as AssistantConversation[]
        setConversations(data)
        if (data[0]) {
          setSelectedConversationId(data[0].id)
        } else {
          setSelectedConversationId(null)
          setMessages([])
        }
      } catch (err) {
        console.error(err)
        setError("Couldn't load previous Care Concierge conversations.")
      }
    }

    fetchConversations()
  }, [selectedFamilyId])

  useEffect(() => {
    if (!selectedFamilyId || !selectedConversationId) {
      return
    }

    async function fetchConversation() {
      try {
        setLoadingConversation(true)
        const response = await fetch(
          `/api/families/${selectedFamilyId}/assistant/conversations/${selectedConversationId}`
        )
        if (!response.ok) {
          throw new Error("Failed to load conversation")
        }

        const data = await response.json()
        setMessages(data.messages as AssistantMessage[])
      } catch (err) {
        console.error(err)
        setError("Couldn't load that Care Concierge thread.")
      } finally {
        setLoadingConversation(false)
      }
    }

    fetchConversation()
  }, [selectedConversationId, selectedFamilyId])

  const selectedFamily = useMemo(
    () => families.find((family) => family.id === selectedFamilyId) || null,
    [families, selectedFamilyId]
  )

  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "ASSISTANT")

  const contextSummary = latestAssistantMessage?.citedContext?.contextSummary
  const followUps = latestAssistantMessage?.citedContext?.followUps || []
  const recommendations =
    latestAssistantMessage?.citedContext?.recommendations || []
  const suggestedTasks =
    latestAssistantMessage?.citedContext?.suggestedTasks || []
  const suggestedEvents =
    latestAssistantMessage?.citedContext?.suggestedEvents || []
  const citations = latestAssistantMessage?.citedContext?.citations || []
  const articulationLabels = [
    "Reading your family context",
    "Connecting the important details",
    "Articulating a concise response",
  ]

  async function sendMessage(prompt: string) {
    if (!selectedFamilyId || !prompt.trim()) return

    const optimisticUserMessage: AssistantMessage = {
      id: `temp-user-${++optimisticMessageCounter}`,
      role: "USER",
      content: prompt.trim(),
      citedContext: null,
      flagged: false,
      createdAt: new Date().toISOString(),
    }

    setDraft("")
    setError(null)
    setMessages((current) => [...current, optimisticUserMessage])

    startTransition(async () => {
      try {
        const response = await fetch(`/api/families/${selectedFamilyId}/assistant`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: selectedConversationId,
            message: prompt.trim(),
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Care Concierge request failed")
        }

        const payload = data as AssistantResponse
        setSelectedConversationId(payload.conversationId)
        setMessages((current) => {
          const withoutOptimistic = current.filter(
            (message) => message.id !== optimisticUserMessage.id
          )
          return [
            ...withoutOptimistic,
            payload.userMessage,
            payload.assistantMessage,
          ]
        })

        const conversationsResponse = await fetch(
          `/api/families/${selectedFamilyId}/assistant/conversations`
        )

        if (conversationsResponse.ok) {
          const conversationData =
            (await conversationsResponse.json()) as AssistantConversation[]
          setConversations(conversationData)
        }
      } catch (err) {
        console.error(err)
        setMessages((current) =>
          current.filter((message) => message.id !== optimisticUserMessage.id)
        )
        setError(
          err instanceof Error
            ? err.message
            : "Care Concierge couldn't answer right now."
        )
      }
    })
  }

  async function flagMessage(messageId: string) {
    if (!selectedFamilyId || flaggingMessageId) return

    setFlaggingMessageId(messageId)

    try {
      const response = await fetch(
        `/api/families/${selectedFamilyId}/assistant/messages/${messageId}/flag`,
        { method: "POST" }
      )

      if (!response.ok) {
        throw new Error("Failed to flag this answer")
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === messageId ? { ...message, flagged: true } : message
        )
      )
    } catch (err) {
      console.error(err)
      setError("Couldn't flag that answer. Please try again.")
    } finally {
      setFlaggingMessageId(null)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(draft)
  }

  function startNewConversation() {
    setSelectedConversationId(null)
    setMessages([])
    setError(null)
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <section className={styles.topbar}>
            <div className={styles.topbarTitle}>
              <div className={styles.eyebrow}>
                <Sparkles size={16} />
                <span>Care Concierge</span>
              </div>
              <h1>Ask one clear question. Get one grounded answer.</h1>
              <p>
                Family-aware guidance across tasks, medications, events, notes,
                resources, local providers, and care plans.
              </p>
            </div>

            <div className={styles.topbarControls}>
              <label className={styles.familyLabel} htmlFor="family-select">
                Workspace
              </label>
              <div className={styles.familyPicker}>
                <select
                  id="family-select"
                  className={styles.familySelect}
                  value={selectedFamilyId}
                  onChange={(event) => setSelectedFamilyId(event.target.value)}
                  disabled={loadingFamilies || pending}
                >
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.familyPickerIcon} />
              </div>
              <div className={styles.familyMeta}>
                <span>{selectedFamily?.elderName || "Care workspace"}</span>
                <span>{conversations.length} saved threads</span>
              </div>
            </div>
          </section>

          <section className={styles.workspace}>
            <aside className={styles.sidebar}>
              <button className={styles.newThreadButton} onClick={startNewConversation}>
                <Plus size={16} />
                <span>New thread</span>
              </button>

              <div className={styles.sidebarBlock}>
                <div className={styles.sidebarHeading}>
                  <MessageSquareText size={16} />
                  <span>Recent threads</span>
                </div>
                <div className={styles.threadList}>
                  {conversations.length === 0 && (
                    <p className={styles.emptyText}>
                      Your first Care Concierge conversation will show up here.
                    </p>
                  )}

                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      className={`${styles.threadCard} ${
                        selectedConversationId === conversation.id
                          ? styles.threadCardActive
                          : ""
                      }`}
                      onClick={() => setSelectedConversationId(conversation.id)}
                    >
                      <strong>{conversation.title}</strong>
                      <span>{truncatePreview(conversation.preview)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.sidebarBlock}>
                <div className={styles.sidebarHeading}>
                  <Lightbulb size={16} />
                  <span>Quick starts</span>
                </div>
                <div className={styles.promptList}>
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      className={styles.promptButton}
                      onClick={() => void sendMessage(prompt)}
                      disabled={!selectedFamilyId || pending}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className={styles.chatShell}>
              <div className={styles.chatSurface}>
                <div className={styles.chatHeader}>
                  <div className={styles.chatHeaderCopy}>
                    <h2>{selectedFamily?.name || "Care Concierge workspace"}</h2>
                    <p>
                      {selectedFamily?.elderName
                        ? `Focused on ${selectedFamily.elderName}`
                        : "Grounded answers for your current family workspace"}
                    </p>
                  </div>
                  <div className={styles.headerBadges}>
                    <div className={styles.guardrail}>
                      <ShieldAlert size={16} />
                      <span>Informational, not medical, legal, or financial advice</span>
                    </div>
                    <Link href="/contact" className={styles.escalationLink}>
                      <LifeBuoy size={14} />
                      <span>Need to talk to a person?</span>
                    </Link>
                  </div>
                </div>

                <div className={styles.messageStream}>
                  {messages.length === 0 && !loadingConversation && (
                    <div className={styles.emptyState}>
                      <BrainCircuit size={28} />
                      <h3>Ask the Care Concierge for a grounded family snapshot.</h3>
                      <p>
                        It can surface gaps, summarize what matters now, and turn
                        scattered family information into a direct next-step view.
                      </p>
                      <div className={styles.emptyPromptGrid}>
                        {starterPrompts.slice(0, 3).map((prompt) => (
                          <button
                            key={prompt}
                            className={styles.emptyPromptCard}
                            onClick={() => void sendMessage(prompt)}
                            disabled={!selectedFamilyId || pending}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {loadingConversation && (
                    <p className={styles.statusText}>Loading conversation…</p>
                  )}

                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={`${styles.messageCard} ${
                        message.role === "USER"
                          ? styles.userMessage
                          : styles.assistantMessage
                      }`}
                      >
                        <div className={styles.messageMeta}>
                          <span>{message.role === "USER" ? "You" : "Care Concierge"}</span>
                          <time>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <p>{message.content}</p>

                      {message.role === "ASSISTANT" &&
                        message.citedContext?.citations &&
                        message.citedContext.citations.length > 0 && (
                          <div className={styles.citationRow}>
                            {message.citedContext.citations.map((citation) => (
                              <span key={`${message.id}-${citation.sourceId}`} className={styles.citationChip}>
                                {citation.category}: {citation.label}
                              </span>
                            ))}
                          </div>
                        )}

                      {message.role === "ASSISTANT" && !message.id.startsWith("temp-") && (
                        <div className={styles.flagRow}>
                          <button
                            type="button"
                            className={styles.flagButton}
                            onClick={() => void flagMessage(message.id)}
                            disabled={message.flagged || flaggingMessageId === message.id}
                          >
                            {message.flagged ? (
                              <>
                                <ShieldCheck size={14} />
                                Flagged for review
                              </>
                            ) : (
                              <>
                                <Flag size={14} />
                                Flag this answer
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}

                  {pending && (
                    <div className={styles.articulationCard}>
                      <div className={styles.articulationMeta}>
                        <span>Care Concierge</span>
                        <span>{articulationLabels[articulationStep]}</span>
                      </div>
                      <div className={styles.articulationPulse}>
                        <span />
                        <span />
                        <span />
                      </div>
                      <div className={styles.articulationBars}>
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  )}
                </div>

                {(contextSummary ||
                  citations.length > 0 ||
                  recommendations.length > 0 ||
                  suggestedTasks.length > 0 ||
                  suggestedEvents.length > 0) && (
                  <section className={styles.detailsPanel}>
                    <div className={styles.detailCard}>
                      <h3>What I used</h3>
                      {contextSummary ? (
                        <>
                          <p>
                            Grounded in <strong>{contextSummary.familyName}</strong>
                            {contextSummary.careRecipientName
                              ? ` for ${contextSummary.careRecipientName}`
                              : ""}.
                          </p>
                          <div className={styles.tagRow}>
                            {contextSummary.sourceChips.map((chip) => (
                              <span key={chip} className={styles.infoTag}>
                                {chip}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p>The Care Concierge will show which records informed its answer.</p>
                      )}
                    </div>

                    <div className={styles.detailCard}>
                      <h3>Based on</h3>
                      {citations.length > 0 ? (
                        <div className={styles.referenceList}>
                          {citations.map((citation) => (
                            <article
                              key={citation.sourceId}
                              className={styles.referenceCard}
                            >
                              <strong>{citation.label}</strong>
                              <span>{citation.category}</span>
                              <p>{citation.note}</p>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p>No citations yet for this thread.</p>
                      )}
                    </div>

                    <div className={styles.detailCard}>
                      <h3>Recommendations</h3>
                      {recommendations.length > 0 ? (
                        <div className={styles.recommendationList}>
                          {recommendations.map((item) => (
                            <article
                              key={`${item.title}-${item.type}`}
                              className={styles.recommendationCard}
                            >
                              <span className={styles.recommendationType}>
                                {item.type}
                              </span>
                              <strong>{item.title}</strong>
                              <p>{item.detail}</p>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p>
                          The Care Concierge will separate direct family facts from
                          suggested next steps.
                        </p>
                      )}
                    </div>

                    <div className={styles.detailCard}>
                      <h3>Suggested todos</h3>
                      {suggestedTasks.length > 0 ? (
                        <div className={styles.recommendationList}>
                          {suggestedTasks.map((item: AssistantSuggestedTask) => (
                            <article
                              key={`${item.title}-${item.priority}`}
                              className={styles.recommendationCard}
                            >
                              <span className={styles.recommendationType}>
                                {item.priority.toLowerCase()} priority
                              </span>
                              <strong>{item.title}</strong>
                              <p>{item.reason}</p>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p>No todo suggestions for this answer.</p>
                      )}
                    </div>

                    <div className={styles.detailCard}>
                      <h3>Suggested events</h3>
                      {suggestedEvents.length > 0 ? (
                        <div className={styles.recommendationList}>
                          {suggestedEvents.map((item: AssistantSuggestedEvent) => (
                            <article
                              key={`${item.title}-${item.timeframe}`}
                              className={styles.recommendationCard}
                            >
                              <span className={styles.recommendationType}>
                                {item.type.toLowerCase()}
                              </span>
                              <strong>{item.title}</strong>
                              <p>{item.reason}</p>
                              <p className={styles.suggestionMeta}>
                                Suggested timing: {item.timeframe}
                              </p>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p>No event suggestions for this answer.</p>
                      )}
                    </div>
                  </section>
                )}

                <form className={styles.composer} onSubmit={handleSubmit}>
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Message the Care Concierge…"
                    rows={1}
                    disabled={!selectedFamilyId || pending}
                  />
                  <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!draft.trim() || !selectedFamilyId || pending}
                  >
                    <ArrowUp size={18} />
                  </button>
                </form>

                {error && <p className={styles.errorText}>{error}</p>}
              </div>
            </div>
          </section>

          {followUps.length > 0 && (
            <section className={styles.followUpStrip}>
              <div className={styles.followUpHeader}>
                <Lightbulb size={16} />
                <span>Suggested follow-ups</span>
              </div>
              <div className={styles.followUpRow}>
                {followUps.map((prompt) => (
                  <button
                    key={prompt}
                    className={styles.followUpButton}
                    onClick={() => void sendMessage(prompt)}
                    disabled={pending}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
