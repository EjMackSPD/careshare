"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type {
  AssistantRecommendation,
  AssistantSuggestedTask,
} from "@/types/assistant";
import CareConciergeMark from "@/app/components/icons/CareConciergeMark";
import styles from "./CareConciergeWidget.module.css";

const INSIGHTS_PROMPT =
  "Summarize what needs attention across our current tasks right now, and suggest a few concrete recommendations and quick tasks that would help us stay on top of care coordination.";

type InsightsState = {
  answer: string;
  recommendations: AssistantRecommendation[];
  suggestedTasks: AssistantSuggestedTask[];
};

function recommendationIcon(type: AssistantRecommendation["type"]) {
  if (type === "watchout") return AlertTriangle;
  if (type === "insight") return Sparkles;
  return Lightbulb;
}

function renderAnswer(answer: string) {
  const blocks = answer.split(/\n\s*\n/).filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const isList = lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line));

    if (isList) {
      return (
        <ul key={blockIndex} className={styles.answerList}>
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{line.replace(/^[-*]\s+/, "")}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={blockIndex} className={styles.summary}>
        {block.trim()}
      </p>
    );
  });
}

export default function CareConciergeWidget({
  familyId,
  onAddSuggestedTask,
}: {
  familyId: string;
  onAddSuggestedTask: (task: AssistantSuggestedTask) => void;
}) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedTitles, setAddedTitles] = useState<string[]>([]);

  async function fetchInsights() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/families/${familyId}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: INSIGHTS_PROMPT,
          conversationId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Care Concierge couldn't respond");
      }

      const data = await res.json();
      setConversationId(data.conversationId);
      setInsights({
        answer: data.assistantMessage?.content || "",
        recommendations: data.recommendations || [],
        suggestedTasks: data.suggestedTasks || [],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Care Concierge couldn't respond"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetch is deferred a tick so the initial setLoading() call doesn't run
    // synchronously inside the effect itself.
    const timeoutId = setTimeout(fetchInsights, 0);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  function handleAdd(task: AssistantSuggestedTask) {
    onAddSuggestedTask(task);
    setAddedTitles((current) => [...current, task.title]);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <CareConciergeMark size={18} />
          <span>Care Concierge</span>
        </div>
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={fetchInsights}
          disabled={loading}
          aria-label="Refresh insights"
        >
          <RefreshCw size={14} className={loading ? styles.spinning : ""} />
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Loader2 size={22} className={styles.spinner} />
          <p className={styles.stateText}>Reviewing your family&apos;s tasks…</p>
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <AlertTriangle size={18} />
          <p className={styles.stateText}>{error}</p>
          <button type="button" className={styles.retryBtn} onClick={fetchInsights}>
            Try again
          </button>
        </div>
      ) : insights ? (
        <div className={styles.content}>
          {insights.answer && (
            <div className={styles.answer}>{renderAnswer(insights.answer)}</div>
          )}

          {insights.recommendations.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Recommendations</span>
              <ul className={styles.recommendationList}>
                {insights.recommendations.map((rec) => {
                  const Icon = recommendationIcon(rec.type);
                  return (
                    <li key={rec.title} className={styles.recommendationItem}>
                      <Icon size={15} className={styles.recommendationIcon} />
                      <div>
                        <strong>{rec.title}</strong>
                        <p className={styles.recommendationDetail}>{rec.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {insights.suggestedTasks.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Quick tasks</span>
              <ul className={styles.suggestedTaskList}>
                {insights.suggestedTasks.map((task) => {
                  const added = addedTitles.includes(task.title);
                  return (
                    <li key={task.title} className={styles.suggestedTaskItem}>
                      <div className={styles.suggestedTaskText}>
                        <strong>{task.title}</strong>
                        <p className={styles.suggestedTaskReason}>{task.reason}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.addTaskBtn}
                        onClick={() => handleAdd(task)}
                        disabled={added}
                      >
                        <Plus size={14} />
                        {added ? "Added" : "Add"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
