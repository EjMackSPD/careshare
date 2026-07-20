"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import styles from "./TaskCheckItem.module.css";

export type DashTask = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  dueToday: boolean;
  assignees: string[];
  assigneeIds: string[];
};

function initial(name: string) {
  return (name.trim()[0] || "?").toUpperCase();
}

export default function TaskCheckItem({
  familyId,
  task,
  currentUserId,
  showDue = false,
}: {
  familyId: string;
  task: DashTask;
  currentUserId: string;
  showDue?: boolean;
}) {
  const [completed, setCompleted] = useState(task.status === "COMPLETED");
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (saving) return;
    const next = !completed;
    setSaving(true);
    setCompleted(next);
    try {
      // Send the full task payload — the PATCH endpoint rebuilds fields/assignments.
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: next ? "COMPLETED" : "TODO",
          assignedMembers: task.assigneeIds,
          autoAssignUserId: currentUserId,
        }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setCompleted(!next);
    } finally {
      setSaving(false);
    }
  }

  const due = task.dueDate ? new Date(task.dueDate) : null;

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={`${styles.check} ${completed ? styles.checked : ""}`}
        onClick={toggle}
        disabled={saving}
        aria-pressed={completed}
        aria-label={completed ? "Mark task not done" : "Mark task done"}
      >
        {completed && <Check size={12} strokeWidth={3} />}
      </button>
      <span className={`${styles.title} ${completed ? styles.done : ""}`}>
        {task.title}
      </span>
      {showDue && task.dueToday && !completed && (
        <span className={styles.dueChip}>Today</span>
      )}
      {!showDue && due && !completed && (
        <span className={styles.dueMuted}>
          {due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      )}
      {task.assignees.length > 0 && (
        <span className={styles.avatars}>
          {task.assignees.slice(0, 3).map((a, i) => (
            <span key={i} className={styles.avatar} title={a}>
              {initial(a)}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
