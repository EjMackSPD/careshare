"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSession } from "@/app/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Edit3,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import styles from "./page.module.css";

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TaskView = "open" | "unassigned" | "completed";
type SortBy = "date" | "alpha";

type TaskAssignment = {
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  assignments: TaskAssignment[];
  attachmentUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type FamilyMember = {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Family = {
  id: string;
  name: string;
  elderName: string | null;
  members: FamilyMember[];
};

type TaskFormState = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
};

const EMPTY_FORM: TaskFormState = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "TODO",
  dueDate: "",
};

const OPEN_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS"];
const ITEMS_PER_PAGE = 10;

function isCompleted(task: Task) {
  return task.status === "COMPLETED";
}

function isOpen(task: Task) {
  return OPEN_STATUSES.includes(task.status);
}

function isUnassigned(task: Task) {
  return task.assignments.length === 0;
}

function isOverdue(task: Task) {
  if (!task.dueDate || isCompleted(task)) return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

function getFamilyDisplayName(family?: Family) {
  if (!family) return "Family";
  return family.elderName || family.name;
}

function getAssigneeNames(task: Task) {
  if (!task.assignments.length) return "Unassigned";
  return task.assignments
    .map((assignment) => assignment.user.name || assignment.user.email)
    .join(", ");
}

function getRelativeDueLabel(dateString: string | null) {
  if (!dateString) {
    return {
      shortLabel: "No due date",
      fullLabel: "No due date",
      tone: "neutral" as const,
    };
  }

  const dueDate = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const startOfDueDay = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  const fullLabel = dueDate.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  if (startOfDueDay.getTime() < startOfToday.getTime()) {
    return {
      shortLabel: "Overdue",
      fullLabel,
      tone: "overdue" as const,
    };
  }

  if (startOfDueDay.getTime() === startOfToday.getTime()) {
    return {
      shortLabel: "Today",
      fullLabel,
      tone: "today" as const,
    };
  }

  if (startOfDueDay.getTime() === startOfTomorrow.getTime()) {
    return {
      shortLabel: "Tomorrow",
      fullLabel,
      tone: "upcoming" as const,
    };
  }

  return {
    shortLabel: dueDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }),
    fullLabel,
    tone: "neutral" as const,
  };
}

function getPriorityLabel(priority: TaskPriority) {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function getStatusLabel(status: TaskStatus) {
  switch (status) {
    case "IN_PROGRESS":
      return "In progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "To do";
  }
}

function TasksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<TaskView>("open");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormState>(EMPTY_FORM);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [clearExistingAttachment, setClearExistingAttachment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "open" ||
      tabParam === "unassigned" ||
      tabParam === "completed"
    ) {
      setActiveView(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchFamilies() {
      try {
        const res = await fetch("/api/families");
        if (!res.ok) throw new Error("Failed to fetch families");
        const familyData = await res.json();

        const familiesWithMembers = await Promise.all(
          familyData.map(async (family: { id: string }) => {
            const membersRes = await fetch(`/api/families/${family.id}/members`);
            const members = membersRes.ok ? await membersRes.json() : [];
            return { ...family, members };
          })
        );

        setFamilies(familiesWithMembers);
        if (familiesWithMembers.length > 0) {
          setSelectedFamily(familiesWithMembers[0].id);
        }
      } catch (error) {
        console.error("Error fetching families:", error);
        showToast("Failed to load families", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchFamilies();
  }, []);

  useEffect(() => {
    if (!selectedFamily) return;
    fetchTasks(selectedFamily);
  }, [selectedFamily]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeView, sortBy, selectedFamily]);

  const currentFamily = families.find((family) => family.id === selectedFamily);
  const familyMembers = currentFamily?.members || [];

  const summary = useMemo(() => {
    const openCount = tasks.filter(isOpen).length;
    const unassignedCount = tasks.filter(
      (task) => isOpen(task) && isUnassigned(task)
    ).length;
    const overdueCount = tasks.filter(isOverdue).length;
    const completedCount = tasks.filter(isCompleted).length;

    return { openCount, unassignedCount, overdueCount, completedCount };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...tasks]
      .filter((task) => {
        if (activeView === "completed") return isCompleted(task);
        if (activeView === "unassigned") return isOpen(task) && isUnassigned(task);
        return isOpen(task);
      })
      .filter((task) => {
        if (!query) return true;
        const haystack = [
          task.title,
          task.description,
          getAssigneeNames(task),
          task.fileName || "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .sort((a, b) => {
        if (sortBy === "alpha") {
          return a.title.localeCompare(b.title);
        }

        if (!a.dueDate && !b.dueDate) return a.title.localeCompare(b.title);
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [activeView, searchQuery, sortBy, tasks]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  async function fetchTasks(familyId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/families/${familyId}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();

      const mappedTasks: Task[] = data.map((task: Task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        completedAt: task.completedAt || null,
        assignments: task.assignments || [],
        attachmentUrl: task.attachmentUrl || null,
        fileName: task.fileName || null,
        fileType: task.fileType || null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showToast("Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  }

  function resetComposer() {
    setComposerOpen(false);
    setEditingTask(null);
    setFormData(EMPTY_FORM);
    setSelectedMembers([]);
    setUploadedFile(null);
    setClearExistingAttachment(false);
  }

  function openAddComposer() {
    setEditingTask(null);
    setFormData(EMPTY_FORM);
    setSelectedMembers([]);
    setUploadedFile(null);
    setClearExistingAttachment(false);
    setComposerOpen(true);
  }

  function openEditComposer(task: Task) {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
    });
    setSelectedMembers(task.assignments.map((assignment) => assignment.userId));
    setUploadedFile(null);
    setClearExistingAttachment(false);
    setComposerOpen(true);
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }

  function toggleMemberSelection(userId: string) {
    setSelectedMembers((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  async function uploadFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("familyId", selectedFamily);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await res.json();
    return {
      attachmentUrl: data.url as string,
      fileName: file.name,
      fileType: file.type,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFamily) {
      showToast("Select a family before saving a task", "error");
      return;
    }

    setSaving(true);

    try {
      let attachmentPayload:
        | { attachmentUrl?: string | null; fileName?: string | null; fileType?: string | null }
        | undefined;

      if (uploadedFile) {
        attachmentPayload = await uploadFile(uploadedFile);
      } else if (editingTask && clearExistingAttachment) {
        attachmentPayload = {
          attachmentUrl: null,
          fileName: null,
          fileType: null,
        };
      } else if (editingTask) {
        attachmentPayload = {
          attachmentUrl: editingTask.attachmentUrl || null,
          fileName: editingTask.fileName || null,
          fileType: editingTask.fileType || null,
        };
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: editingTask ? formData.status : "TODO",
        assignedMembers: selectedMembers,
        dueDate: formData.dueDate || null,
        ...attachmentPayload,
      };

      const res = await fetch(
        editingTask
          ? `/api/tasks/${editingTask.id}`
          : `/api/families/${selectedFamily}/tasks`,
        {
          method: editingTask ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "Failed to save task");
      }

      await fetchTasks(selectedFamily);
      showToast(
        editingTask ? "Task updated successfully" : "Task created successfully",
        "success"
      );
      resetComposer();
    } catch (error) {
      console.error("Error saving task:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to save task",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: Task) {
    try {
      const completing = task.status !== "COMPLETED";
      const assignedMembers = task.assignments.map((assignment) => assignment.userId);
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: completing ? "COMPLETED" : "TODO",
          assignedMembers,
          dueDate: task.dueDate,
          autoAssignUserId: currentUserId,
          attachmentUrl: task.attachmentUrl || null,
          fileName: task.fileName || null,
          fileType: task.fileType || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      await fetchTasks(selectedFamily);
      showToast(
        completing ? `Completed "${task.title}"` : `Moved "${task.title}" back to open`,
        "success"
      );
    } catch (error) {
      console.error("Error updating task:", error);
      showToast("Failed to update task", "error");
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks((current) => current.filter((task) => task.id !== taskId));
      if (editingTask?.id === taskId) {
        resetComposer();
      }
      showToast("Task deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Failed to delete task", "error");
    }
  }

  const selectedAttachment =
    uploadedFile ||
    (!clearExistingAttachment && editingTask?.fileName
      ? {
          name: editingTask.fileName,
          type: editingTask.fileType || "",
        }
      : null);

  const composerTitle = editingTask ? "Edit task" : "Add task";
  const composerDescription = editingTask
    ? "Update ownership, status, timing, or the attached file without leaving the queue."
    : "Capture a new task and assign it while the current queue stays visible.";

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />

        <main className={styles.main}>
          <section className={styles.workspace}>
            <header className={styles.header}>
              <div className={styles.headerCopy}>
                <p className={styles.eyebrow}>Task workspace</p>
                <h1>Tasks</h1>
                <p className={styles.subtitle}>
                  Keep work moving with clear ownership, due dates, and a single
                  place to triage what needs attention next.
                </p>
              </div>

              <div className={styles.headerActions}>
                {families.length > 0 && (
                  <div className={styles.familyPicker}>
                    <label htmlFor="familySelect">Family</label>
                    <select
                      id="familySelect"
                      value={selectedFamily}
                      onChange={(event) => setSelectedFamily(event.target.value)}
                    >
                      {families.map((family) => (
                        <option key={family.id} value={family.id}>
                          {getFamilyDisplayName(family)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={openAddComposer}
                  disabled={!selectedFamily}
                >
                  <Plus size={18} />
                  Add task
                </button>
              </div>
            </header>

            {families.length === 0 && !loading ? (
              <section className={styles.emptyWorkspace}>
                <div className={styles.emptyIcon}>
                  <Users size={28} />
                </div>
                <h2>No families yet</h2>
                <p>
                  Create or join a family before managing care tasks in this
                  workspace.
                </p>
              </section>
            ) : (
              <>
                <div className={styles.summaryRow}>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Family</span>
                    <strong>{getFamilyDisplayName(currentFamily)}</strong>
                  </div>
                  <button
                    type="button"
                    className={`${styles.summaryCard} ${
                      activeView === "open" ? styles.summaryActive : ""
                    }`}
                    onClick={() => setActiveView("open")}
                  >
                    <span className={styles.summaryLabel}>Open</span>
                    <strong>{summary.openCount}</strong>
                  </button>
                  <button
                    type="button"
                    className={`${styles.summaryCard} ${
                      activeView === "unassigned" ? styles.summaryActive : ""
                    }`}
                    onClick={() => setActiveView("unassigned")}
                  >
                    <span className={styles.summaryLabel}>Unassigned</span>
                    <strong>{summary.unassignedCount}</strong>
                  </button>
                  <div className={`${styles.summaryCard} ${styles.summaryAlert}`}>
                    <span className={styles.summaryLabel}>Overdue</span>
                    <strong>{summary.overdueCount}</strong>
                  </div>
                  <button
                    type="button"
                    className={`${styles.summaryCard} ${
                      activeView === "completed" ? styles.summaryActive : ""
                    }`}
                    onClick={() => setActiveView("completed")}
                  >
                    <span className={styles.summaryLabel}>Completed</span>
                    <strong>{summary.completedCount}</strong>
                  </button>
                </div>

                <div className={styles.workspaceGrid}>
                  <section className={styles.queuePanel}>
                    <div className={styles.filterBar}>
                      <div className={styles.searchField}>
                        <Search size={16} />
                        <input
                          type="search"
                          value={searchQuery}
                          placeholder="Search title, notes, assignee, or file"
                          onChange={(event) => setSearchQuery(event.target.value)}
                        />
                      </div>

                      <div className={styles.filterControls}>
                        <div className={styles.viewTabs}>
                          {(["open", "unassigned", "completed"] as TaskView[]).map(
                            (view) => (
                              <button
                                key={view}
                                type="button"
                                className={
                                  activeView === view ? styles.activeTab : styles.tab
                                }
                                onClick={() => setActiveView(view)}
                              >
                                {view === "open"
                                  ? "Open"
                                  : view === "unassigned"
                                  ? "Unassigned"
                                  : "Completed"}
                              </button>
                            )
                          )}
                        </div>

                        <select
                          value={sortBy}
                          onChange={(event) =>
                            setSortBy(event.target.value as SortBy)
                          }
                          className={styles.sortSelect}
                        >
                          <option value="date">Sort by due date</option>
                          <option value="alpha">Sort alphabetically</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.queueHeader}>
                      <div>
                        <h2>
                          {activeView === "open"
                            ? "Open queue"
                            : activeView === "unassigned"
                            ? "Unassigned queue"
                            : "Completed work"}
                        </h2>
                        <p>
                          {filteredTasks.length} result
                          {filteredTasks.length === 1 ? "" : "s"}
                          {tasks.length ? ` across ${tasks.length} total tasks` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={openAddComposer}
                        disabled={!selectedFamily}
                      >
                        <Plus size={16} />
                        New
                      </button>
                    </div>

                    {loading ? (
                      <div className={styles.loadingState}>
                        <Loader2 size={28} className={styles.spinner} />
                        <p>Loading task workspace...</p>
                      </div>
                    ) : tasks.length === 0 ? (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                          <FolderOpen size={28} />
                        </div>
                        <h3>No tasks yet</h3>
                        <p>
                          Start with the most important next step for{" "}
                          {getFamilyDisplayName(currentFamily)}.
                        </p>
                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={openAddComposer}
                        >
                          <Plus size={18} />
                          Add first task
                        </button>
                      </div>
                    ) : filteredTasks.length === 0 ? (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                          <Search size={28} />
                        </div>
                        <h3>No matching tasks</h3>
                        <p>
                          Try a different search or switch views to widen the
                          queue.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className={styles.taskTable}>
                          <div className={styles.tableHead}>
                            <span>Task</span>
                            <span>Owner</span>
                            <span>Due</span>
                            <span>Priority</span>
                            <span>Actions</span>
                          </div>

                          <div className={styles.tableBody}>
                            {paginatedTasks.map((task) => {
                              const dueMeta = getRelativeDueLabel(task.dueDate);
                              const selected = editingTask?.id === task.id && composerOpen;
                              const attachmentIsImage =
                                task.fileType?.startsWith("image/") || false;

                              return (
                                <article
                                  key={task.id}
                                  className={`${styles.taskRow} ${
                                    selected ? styles.taskRowSelected : ""
                                  } ${isCompleted(task) ? styles.taskRowComplete : ""}`}
                                >
                                  <div className={styles.taskCellPrimary}>
                                    <input
                                      type="checkbox"
                                      checked={isCompleted(task)}
                                      onChange={() => toggleTask(task)}
                                      className={styles.taskCheckbox}
                                      aria-label={`Toggle ${task.title}`}
                                    />

                                    <button
                                      type="button"
                                      className={styles.taskTitleBlock}
                                      onClick={() => openEditComposer(task)}
                                    >
                                      <div className={styles.taskTitleRow}>
                                        <h3>{task.title}</h3>
                                        {task.status !== "TODO" && (
                                          <span className={styles.statusBadge}>
                                            {getStatusLabel(task.status)}
                                          </span>
                                        )}
                                      </div>
                                      <p>
                                        {task.description || "No additional notes."}
                                      </p>
                                      <div className={styles.taskMetaInline}>
                                        {task.attachmentUrl && (
                                          <a
                                            href={task.attachmentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.attachmentChip}
                                            onClick={(event) => event.stopPropagation()}
                                          >
                                            {attachmentIsImage ? (
                                              <ImageIcon size={14} />
                                            ) : (
                                              <Paperclip size={14} />
                                            )}
                                            <span>{task.fileName || "Attachment"}</span>
                                          </a>
                                        )}
                                      </div>
                                    </button>
                                  </div>

                                  <div className={styles.ownerCell}>
                                    <span>{getAssigneeNames(task)}</span>
                                    {isUnassigned(task) && (
                                      <span className={styles.ownerHint}>
                                        Needs assignment
                                      </span>
                                    )}
                                  </div>

                                  <div className={styles.dueCell}>
                                    <span
                                      className={`${styles.dueBadge} ${
                                        dueMeta.tone === "overdue"
                                          ? styles.dueOverdue
                                          : dueMeta.tone === "today"
                                          ? styles.dueToday
                                          : dueMeta.tone === "upcoming"
                                          ? styles.dueUpcoming
                                          : styles.dueNeutral
                                      }`}
                                    >
                                      {dueMeta.shortLabel}
                                    </span>
                                    <span className={styles.dueDetail}>
                                      {dueMeta.fullLabel}
                                    </span>
                                  </div>

                                  <div className={styles.priorityCell}>
                                    <span
                                      className={`${styles.priorityBadge} ${
                                        styles[`priority${task.priority}`]
                                      }`}
                                    >
                                      {getPriorityLabel(task.priority)}
                                    </span>
                                  </div>

                                  <div className={styles.actionCell}>
                                    <button
                                      type="button"
                                      className={styles.iconButton}
                                      onClick={() => openEditComposer(task)}
                                      title="Edit task"
                                    >
                                      <Edit3 size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.iconButton}
                                      onClick={() => deleteTask(task.id)}
                                      title="Delete task"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        </div>

                        {filteredTasks.length > ITEMS_PER_PAGE && (
                          <div className={styles.pagination}>
                            <button
                              type="button"
                              className={styles.paginationButton}
                              disabled={currentPage === 1}
                              onClick={() =>
                                setCurrentPage((page) => Math.max(1, page - 1))
                              }
                            >
                              Previous
                            </button>

                            <span className={styles.paginationLabel}>
                              Page {currentPage} of {totalPages}
                            </span>

                            <button
                              type="button"
                              className={styles.paginationButton}
                              disabled={currentPage === totalPages}
                              onClick={() =>
                                setCurrentPage((page) =>
                                  Math.min(totalPages, page + 1)
                                )
                              }
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </section>

                  <aside
                    className={`${styles.composerPanel} ${
                      composerOpen ? styles.composerPanelOpen : ""
                    }`}
                  >
                    <div className={styles.composerHeader}>
                      <div>
                        <p className={styles.composerEyebrow}>Inspector</p>
                        <h2>{composerTitle}</h2>
                        <p>{composerDescription}</p>
                      </div>

                      <button
                        type="button"
                        className={styles.closeComposer}
                        onClick={resetComposer}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {!composerOpen ? (
                      <div className={styles.composerPlaceholder}>
                        <div className={styles.emptyIcon}>
                          <CheckCircle2 size={28} />
                        </div>
                        <h3>Ready for the next move</h3>
                        <p>
                          Open a task to edit it, or create a new one without
                          losing sight of the current queue.
                        </p>
                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={openAddComposer}
                          disabled={!selectedFamily}
                        >
                          <Plus size={18} />
                          Add task
                        </button>
                      </div>
                    ) : (
                      <form className={styles.composerForm} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                          <label htmlFor="taskTitle">Title</label>
                          <input
                            id="taskTitle"
                            type="text"
                            value={formData.title}
                            onChange={(event) =>
                              setFormData((current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            }
                            placeholder="Pick up prescriptions"
                            required
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="taskDescription">Description</label>
                          <textarea
                            id="taskDescription"
                            rows={4}
                            value={formData.description}
                            onChange={(event) =>
                              setFormData((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                            placeholder="Add the details someone needs to complete this well."
                          />
                        </div>

                        <div className={styles.formGrid}>
                          <div className={styles.formGroup}>
                            <label htmlFor="taskPriority">Priority</label>
                            <select
                              id="taskPriority"
                              value={formData.priority}
                              onChange={(event) =>
                                setFormData((current) => ({
                                  ...current,
                                  priority: event.target.value as TaskPriority,
                                }))
                              }
                            >
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                              <option value="URGENT">Urgent</option>
                            </select>
                          </div>

                          <div className={styles.formGroup}>
                            <label htmlFor="taskStatus">Status</label>
                            <select
                              id="taskStatus"
                              value={formData.status}
                              onChange={(event) =>
                                setFormData((current) => ({
                                  ...current,
                                  status: event.target.value as TaskStatus,
                                }))
                              }
                            >
                              <option value="TODO">To do</option>
                              <option value="IN_PROGRESS">In progress</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="taskDueDate">Due date</label>
                          <div className={styles.inputWithIcon}>
                            <CalendarClock size={16} />
                            <input
                              id="taskDueDate"
                              type="datetime-local"
                              value={formData.dueDate}
                              onChange={(event) =>
                                setFormData((current) => ({
                                  ...current,
                                  dueDate: event.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <div className={styles.labelRow}>
                            <label>Assignees</label>
                            <button
                              type="button"
                              className={styles.inlineLink}
                              onClick={() => router.push(`/family/${selectedFamily}/members`)}
                            >
                              Manage members
                            </button>
                          </div>

                          {familyMembers.length === 0 ? (
                            <div className={styles.helperBlock}>
                              <AlertCircle size={16} />
                              <span>Add family members before assigning work.</span>
                            </div>
                          ) : (
                            <div className={styles.memberGrid}>
                              {familyMembers.map((member) => {
                                const checked = selectedMembers.includes(member.userId);
                                const label =
                                  member.user.name || member.user.email;

                                return (
                                  <button
                                    key={member.userId}
                                    type="button"
                                    className={`${styles.memberChip} ${
                                      checked ? styles.memberChipActive : ""
                                    }`}
                                    onClick={() => toggleMemberSelection(member.userId)}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="taskAttachment">Attachment</label>
                          <label htmlFor="taskAttachment" className={styles.uploadField}>
                            <Upload size={16} />
                            <span>Upload image, PDF, or document</span>
                          </label>
                          <input
                            id="taskAttachment"
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            className={styles.hiddenInput}
                            onChange={(event) =>
                              setUploadedFile(event.target.files?.[0] || null)
                            }
                          />

                          {selectedAttachment && (
                            <div className={styles.attachmentPreview}>
                              {"type" in selectedAttachment &&
                              selectedAttachment.type.startsWith("image/") ? (
                                <ImageIcon size={16} />
                              ) : (
                                <FileText size={16} />
                              )}
                              <span>{selectedAttachment.name}</span>
                              <button
                                type="button"
                                className={styles.inlineRemove}
                                onClick={() => {
                                  if (uploadedFile) {
                                    setUploadedFile(null);
                                  } else {
                                    setClearExistingAttachment(true);
                                  }
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>

                        <div className={styles.formActions}>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={resetComposer}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <Loader2 size={16} className={styles.spinner} />
                                Saving
                              </>
                            ) : editingTask ? (
                              "Save task"
                            ) : (
                              "Create task"
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </aside>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      <Footer />

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <Navigation showAuthLinks={true} />
          <div className={styles.layout}>
            <LeftNavigation />
            <main className={styles.main}>
              <div className={styles.loadingState}>
                <Loader2 size={28} className={styles.spinner} />
                <p>Loading task workspace...</p>
              </div>
            </main>
          </div>
          <Footer />
        </div>
      }
    >
      <TasksPageContent />
    </Suspense>
  );
}
