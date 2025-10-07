"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import {
  Search,
  Trash2,
  UserPlus,
  X,
  Edit,
  Upload,
  FileText,
  Image as ImageIcon,
  Lightbulb,
} from "lucide-react";
import styles from "./page.module.css";

// ============================================
// TYPE DEFINITIONS
// ============================================

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  assignedTo: string;
  assignedToName?: string;
  dueDate: string;
  completed: boolean;
  attachmentUrl?: string;
  fileName?: string;
  fileType?: string;
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

// ============================================
// MAIN COMPONENT
// ============================================

function TasksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // State: Tasks and Filters
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<
    "open" | "unassigned" | "completed"
  >("open");
  const [sortBy, setSortBy] = useState<"alpha" | "date">("date");

  // State: Families and Members
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // State: UI Controls
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showProviderTip, setShowProviderTip] = useState<string | null>(null);
  const [showCheckboxHint, setShowCheckboxHint] = useState(false);

  // State: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State: File Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // State: Toast Notifications
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // State: Task Form Data
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Medication",
    priority: "MEDIUM" as "HIGH" | "MEDIUM" | "LOW",
    assignedTo: "",
    dueDate: "",
  });

  // ============================================
  // EFFECTS
  // ============================================

  // Check URL params for initial tab selection
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "unassigned" ||
      tabParam === "completed" ||
      tabParam === "open"
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Show checkbox hint on first visit (only if tasks exist)
  useEffect(() => {
    const hasSeenCheckboxHint = localStorage.getItem(
      "hasSeenTasksCheckboxHint"
    );
    if (!hasSeenCheckboxHint && tasks.length > 0) {
      // Delay showing the hint slightly so it doesn't appear immediately
      const timer = setTimeout(() => {
        setShowCheckboxHint(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tasks]);

  const dismissCheckboxHint = () => {
    setShowCheckboxHint(false);
    localStorage.setItem("hasSeenTasksCheckboxHint", "true");
  };

  // Fetch families with members on mount
  useEffect(() => {
    async function fetchFamilies() {
      try {
        const res = await fetch("/api/families");
        if (!res.ok) throw new Error("Failed to fetch families");
        const data = await res.json();

        // Fetch members for each family
        const familiesWithMembers = await Promise.all(
          data.map(async (family: any) => {
            const membersRes = await fetch(
              `/api/families/${family.id}/members`
            );
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
      } finally {
        setLoading(false);
      }
    }
    fetchFamilies();
  }, []);

  // Fetch tasks when family changes
  useEffect(() => {
    if (!selectedFamily) return;
    fetchTasks();
  }, [selectedFamily]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, activeTab]);

  // ============================================
  // DATA FETCHING
  // ============================================

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`/api/families/${selectedFamily}/tasks`);
      if (res.ok) {
        const data = await res.json();

        // Convert database format to display format
        const formattedTasks = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || "",
          category: "General",
          priority: t.priority,
          assignedTo: t.assignments?.map((a: any) => a.userId).join(",") || "",
          assignedToName:
            t.assignments
              ?.map((a: any) => a.user.name || a.user.email)
              .join(", ") || "",
          dueDate: t.dueDate ? new Date(t.dueDate).toLocaleString() : "",
          completed: t.status === "COMPLETED",
          attachmentUrl: t.attachmentUrl,
          fileName: t.fileName,
          fileType: t.fileType,
        }));

        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // TASK FILTERING AND SORTING
  // ============================================

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || task.category === filterCategory;

      let matchesTab = false;
      if (activeTab === "completed") {
        matchesTab = task.completed;
      } else if (activeTab === "unassigned") {
        matchesTab =
          !task.completed &&
          (!task.assignedTo || task.assignedTo.trim() === "");
      } else {
        matchesTab = !task.completed; // "open" tab
      }

      return matchesSearch && matchesCategory && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === "alpha") {
        return a.title.localeCompare(b.title);
      } else {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // ============================================
  // TASK ACTIONS
  // ============================================

  const toggleTask = async (id: string, currentUserId?: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = task.completed ? "TODO" : "COMPLETED";
    const completedAt = !task.completed ? new Date().toISOString() : null;

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          completedAt,
          autoAssignUserId: currentUserId, // Pass current user ID for auto-assignment
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      const updatedTask = await res.json();

      // Update local state with the returned task data (which may have new assignments)
      setTasks(
        tasks.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              completed: !t.completed,
              assignedTo:
                updatedTask.assignments?.map((a: any) => a.userId).join(",") ||
                t.assignedTo,
              assignedToName:
                updatedTask.assignments
                  ?.map((a: any) => a.user.name || a.user.email)
                  .join(", ") || t.assignedToName,
            };
          }
          return t;
        })
      );

      // Show success toast
      if (!task.completed) {
        const wasUnassigned = !task.assignedTo || task.assignedTo === "";
        if (wasUnassigned && currentUserId) {
          showToast(
            `✓ Task "${task.title}" marked as complete and assigned to you!`,
            "success"
          );
        } else {
          showToast(`✓ Task "${task.title}" marked as complete!`, "success");
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast("Failed to update task", "error");
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");

      setTasks(tasks.filter((task) => task.id !== id));
      showToast("Task deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Failed to delete task", "error");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFamily) {
      alert("Please select a family first");
      return;
    }

    try {
      let fileData = null;

      // Upload file if one was selected
      if (uploadedFile) {
        setUploading(true);
        fileData = await uploadFile(uploadedFile);
        setUploading(false);

        if (!fileData) return; // Upload failed
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignedMembers: selectedMembers,
        dueDate: newTask.dueDate || null,
        status: editingTask ? undefined : "TODO",
        ...(fileData && {
          attachmentUrl: fileData.url,
          fileName: fileData.fileName,
          fileType: fileData.fileType,
        }),
      };

      const url = editingTask
        ? `/api/tasks/${editingTask.id}`
        : `/api/families/${selectedFamily}/tasks`;
      const method = editingTask ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save task");
      }

      // Refresh tasks list
      await fetchTasks();

      showToast(
        editingTask ? "Task updated successfully" : "Task created successfully",
        "success"
      );

      // Reset form
      setShowAddTask(false);
      setEditingTask(null);
      setSelectedMembers([]);
      setUploadedFile(null);
      setNewTask({
        title: "",
        description: "",
        category: "Medication",
        priority: "MEDIUM",
        assignedTo: "",
        dueDate: "",
      });
    } catch (error) {
      console.error("Error saving task:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to save task",
        "error"
      );
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);

    // Parse assigned members from assignedTo field (comma-separated IDs)
    const assignedIds = task.assignedTo
      ? task.assignedTo.split(",").filter((id) => id.trim())
      : [];
    setSelectedMembers(assignedIds);

    setNewTask({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 16)
        : "",
    });

    setShowAddTask(true);
  };

  // ============================================
  // FILE UPLOAD
  // ============================================

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
  };

  const uploadFile = async (
    file: File
  ): Promise<{ url: string; fileName: string; fileType: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");

      const data = await res.json();
      return {
        url: data.url,
        fileName: file.name,
        fileType: file.type,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      showToast("Failed to upload file", "error");
      return null;
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return styles.highPriority;
      case "MEDIUM":
        return styles.mediumPriority;
      case "LOW":
        return styles.lowPriority;
      default:
        return "";
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getSelectedMemberNames = () => {
    return selectedMembers
      .map((userId) => {
        const member = familyMembers.find((m) => m.userId === userId);
        return member?.user.name || member?.user.email || "Unknown";
      })
      .join(", ");
  };

  // Check if task category might need 3rd party services
  const getProviderSuggestions = (category: string) => {
    const suggestions: {
      [key: string]: { title: string; providers: string[] };
    } = {
      Medical: {
        title: "Medical Care Providers",
        providers: [
          "Home Health Aides",
          "Visiting Nurses",
          "Physical Therapists",
          "Medical Equipment Suppliers",
        ],
      },
      Transportation: {
        title: "Transportation Services",
        providers: [
          "GoGoGrandparent",
          "Senior Ride Services",
          "Medical Transport",
          "Uber/Lyft",
          "Local Taxi Services",
        ],
      },
      "Home Care": {
        title: "Home Care Services",
        providers: [
          "Visiting Angels",
          "Home Instead",
          "Comfort Keepers",
          "Right at Home",
          "Local Home Care Agencies",
        ],
      },
      "Meal Prep": {
        title: "Meal Services",
        providers: [
          "Meals on Wheels",
          "Home Chef",
          "HelloFresh",
          "Magic Kitchen",
          "Mom's Meals (Senior-focused)",
        ],
      },
      Cleaning: {
        title: "Cleaning Services",
        providers: [
          "Handy",
          "TaskRabbit",
          "The Maids",
          "Molly Maid",
          "Local Cleaning Services",
        ],
      },
      "Yard Work": {
        title: "Yard & Outdoor Services",
        providers: [
          "LawnStarter",
          "TaskRabbit",
          "Local Landscaping Services",
          "Handy",
        ],
      },
      "Personal Care": {
        title: "Personal Care Services",
        providers: [
          "In-home Salon Services",
          "Mobile Barber/Stylist",
          "Senior Personal Care Aides",
        ],
      },
    };
    return suggestions[category];
  };

  const needsThirdParty = (category: string) => {
    return [
      "Medical",
      "Transportation",
      "Home Care",
      "Meal Prep",
      "Cleaning",
      "Yard Work",
      "Personal Care",
    ].includes(category);
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const currentFamily = families.find((f) => f.id === selectedFamily);
  const familyMembers = currentFamily?.members || [];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          {/* Page Header with Background Image */}
          <div className={styles.heroHeader}>
            <div className={styles.heroOverlay}>
              <div className={styles.heroContent}>
                <div className={styles.heroText}>
                  <h1>Tasks & Responsibilities</h1>
                  <p className={styles.subtitle}>
                    Manage and track tasks for your loved ones
                  </p>
                </div>
                <div className={styles.heroActions}>
                  {/* Family Selector (if multiple families) */}
                  {families.length > 1 && (
                    <div className={styles.familySelector}>
                      <label htmlFor="familySelect">Family:</label>
                      <select
                        id="familySelect"
                        value={selectedFamily}
                        onChange={(e) => setSelectedFamily(e.target.value)}
                        className={styles.familySelect}
                      >
                        {families.map((family) => (
                          <option key={family.id} value={family.id}>
                            {family.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    className={styles.addTaskBtn}
                    onClick={() => setShowAddTask(!showAddTask)}
                    disabled={!selectedFamily}
                  >
                    + Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Open, Unassigned, Completed */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${
                  activeTab === "open" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("open")}
              >
                Open Tasks
                <span className={styles.tabCount}>
                  {tasks.filter((t) => !t.completed).length}
                </span>
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "unassigned" ? styles.activeTab : ""
                } ${styles.unassignedTab}`}
                onClick={() => setActiveTab("unassigned")}
              >
                Unassigned
                <span className={`${styles.tabCount} ${styles.warningCount}`}>
                  {
                    tasks.filter(
                      (t) =>
                        !t.completed &&
                        (!t.assignedTo || t.assignedTo.trim() === "")
                    ).length
                  }
                </span>
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "completed" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("completed")}
              >
                Completed
                <span className={styles.tabCount}>
                  {tasks.filter((t) => t.completed).length}
                </span>
              </button>
            </div>

            {/* Sort Control */}
            <div className={styles.sortControl}>
              <label htmlFor="sortBy">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "alpha" | "date")}
                className={styles.sortSelect}
              >
                <option value="date">Due Date</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Search and Category Filter */}
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.filters}>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                <option value="Medication">Medication</option>
                <option value="Medical">Medical</option>
                <option value="Transportation">Transportation</option>
                <option value="Home Care">Home Care</option>
                <option value="Meal Prep">Meal Prep</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Yard Work">Yard Work</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Add/Edit Task Modal */}
          {showAddTask && (
            <div className={styles.modal} onClick={() => setShowAddTask(false)}>
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div>
                    <h2>{editingTask ? "Edit Task" : "Add New Task"}</h2>
                    {currentFamily && (
                      <p className={styles.modalFamilyName}>
                        For: {currentFamily.name}
                      </p>
                    )}
                  </div>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowAddTask(false)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddTask} className={styles.taskForm}>
                  {/* Task Title */}
                  <div className={styles.formGroup}>
                    <label>Task Title *</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder="e.g., Pick up prescriptions"
                      required
                    />
                  </div>

                  {/* Task Description */}
                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      placeholder="Additional details about the task..."
                      rows={3}
                    />
                  </div>

                  {/* Priority */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Priority *</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            priority: e.target.value as
                              | "HIGH"
                              | "MEDIUM"
                              | "LOW",
                          })
                        }
                        required
                      >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="HIGH">High Priority</option>
                      </select>
                    </div>
                  </div>

                  {/* Assign To Family Members */}
                  <div className={styles.formGroup}>
                    <div className={styles.labelWithLink}>
                      <label>Assign To Family Members</label>
                      <button
                        type="button"
                        className={styles.addMemberLink}
                        onClick={() => {
                          setShowAddTask(false);
                          router.push(`/family/${selectedFamily}/members`);
                        }}
                      >
                        <UserPlus size={14} />
                        Add Member
                      </button>
                    </div>

                    {loading ? (
                      <div className={styles.loadingText}>
                        Loading family members...
                      </div>
                    ) : familyMembers.length === 0 ? (
                      <div className={styles.noMembers}>
                        <p>
                          No family members found. Add members to assign tasks.
                        </p>
                      </div>
                    ) : (
                      <div className={styles.memberSelector}>
                        {familyMembers.map((member) => {
                          const isSelected = selectedMembers.includes(
                            member.userId
                          );
                          const displayName =
                            member.user.name || member.user.email;

                          return (
                            <div
                              key={member.userId}
                              className={`${styles.memberOption} ${
                                isSelected ? styles.selected : ""
                              }`}
                              onClick={() =>
                                toggleMemberSelection(member.userId)
                              }
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className={styles.memberCheckbox}
                              />
                              <span>{displayName}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Selected Members Display */}
                    {selectedMembers.length > 0 && (
                      <div className={styles.selectedMembers}>
                        {selectedMembers.map((userId) => {
                          const member = familyMembers.find(
                            (m) => m.userId === userId
                          );
                          const displayName =
                            member?.user.name ||
                            member?.user.email ||
                            "Unknown";

                          return (
                            <span key={userId} className={styles.memberTag}>
                              {displayName}
                              <button
                                type="button"
                                onClick={() => toggleMemberSelection(userId)}
                                className={styles.removeMemberBtn}
                              >
                                <X size={14} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className={styles.formGroup}>
                    <label>Due Date</label>
                    <input
                      type="datetime-local"
                      value={newTask.dueDate}
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value })
                      }
                    />
                  </div>

                  {/* File Attachment */}
                  <div className={styles.formGroup}>
                    <label>
                      <Upload
                        size={16}
                        style={{
                          marginRight: "0.5rem",
                          verticalAlign: "middle",
                        }}
                      />
                      Attachment (optional)
                    </label>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.doc,.docx"
                      className={styles.fileInput}
                    />
                    {uploadedFile && (
                      <div className={styles.filePreview}>
                        {uploadedFile.type.startsWith("image/") ? (
                          <ImageIcon size={16} />
                        ) : (
                          <FileText size={16} />
                        )}
                        <span>{uploadedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className={styles.removeFileBtn}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={uploading}
                    >
                      {uploading
                        ? "Uploading..."
                        : editingTask
                        ? "Save Task"
                        : "Add Task"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tasks Section */}
          <div className={styles.tasksSection}>
            <div className={styles.tasksSectionHeader}>
              <div>
                <h2>Tasks</h2>
              </div>
              <p className={styles.taskCount}>
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>
            </div>

            {loading ? (
              // Skeleton Loading State
              <div className={styles.skeletonContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonCheckbox}></div>
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonTitle}></div>
                      <div className={styles.skeletonText}></div>
                      <div className={styles.skeletonBadges}>
                        <div className={styles.skeletonBadge}></div>
                        <div className={styles.skeletonBadge}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Tasks List */}
                <div className={styles.tasksList}>
                  {/* Checkbox Hint - Shows on first visit */}
                  {showCheckboxHint && paginatedTasks.length > 0 && (
                    <div className={styles.checkboxHint}>
                      <div className={styles.hintContent}>
                        <div className={styles.hintText}>
                          <strong>💡 Quick Tip:</strong> Click the checkbox to
                          mark tasks as complete!
                        </div>
                        <button
                          className={styles.hintClose}
                          onClick={dismissCheckboxHint}
                        >
                          Got it
                        </button>
                      </div>
                      <div className={styles.hintArrow}></div>
                    </div>
                  )}

                  {paginatedTasks.map((task, index) => {
                    const isUnassigned =
                      !task.assignedTo || task.assignedTo.trim() === "";

                    return (
                      <div
                        key={task.id}
                        className={`${styles.taskCard} ${
                          task.completed ? styles.completed : ""
                        } ${
                          isUnassigned && !task.completed
                            ? styles.unassigned
                            : ""
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id, currentUserId)}
                          className={styles.taskCheckbox}
                          title={
                            task.completed
                              ? "Unmark as complete"
                              : "Mark as complete"
                          }
                        />

                        {/* Task Content */}
                        <div className={styles.taskContent}>
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>

                          {/* Attachment Display */}
                          {task.attachmentUrl && (
                            <div className={styles.taskAttachment}>
                              {task.fileType?.startsWith("image/") ? (
                                <a
                                  href={task.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.attachmentLink}
                                >
                                  <img
                                    src={task.attachmentUrl}
                                    alt={task.fileName || "Attachment"}
                                    className={styles.attachmentImage}
                                  />
                                </a>
                              ) : (
                                <a
                                  href={task.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.attachmentLink}
                                >
                                  <FileText size={16} />
                                  <span>{task.fileName || "Attachment"}</span>
                                </a>
                              )}
                            </div>
                          )}

                          {/* Due Date */}
                          <div className={styles.taskMeta}>
                            <span className={styles.dueDate}>
                              Due: {task.dueDate}
                            </span>
                          </div>

                          {/* Tags and Badges */}
                          <div className={styles.taskTags}>
                            <span className={styles.categoryBadge}>
                              {task.category}
                            </span>
                            <span
                              className={`${
                                styles.priorityBadge
                              } ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority.charAt(0) +
                                task.priority.slice(1).toLowerCase()}{" "}
                              Priority
                            </span>

                            {/* Assignment Status */}
                            {task.assignedToName ? (
                              <span className={styles.assignedBadge}>
                                Assigned to: {task.assignedToName}
                              </span>
                            ) : (
                              <span
                                className={styles.unassignedBadge}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task);
                                }}
                              >
                                ⚠ Unassigned - Click to assign
                              </span>
                            )}

                            {/* Provider Suggestions */}
                            {needsThirdParty(task.category) && (
                              <button
                                className={styles.providerTipBtn}
                                onClick={() => setShowProviderTip(task.id)}
                                title="View service provider suggestions"
                              >
                                <Lightbulb size={16} />
                                <span>Need Help?</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Task Actions */}
                        <div className={styles.taskCardActions}>
                          <button
                            onClick={() => handleEditTask(task)}
                            className={styles.editTaskBtn}
                            title="Edit task"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className={styles.deleteBtn}
                            title="Delete task"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {filteredTasks.length > itemsPerPage && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationControls}>
                      <button
                        className={styles.pageBtn}
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <div className={styles.pageNumbers}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            return (
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page, index, array) => (
                            <div key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className={styles.ellipsis}>...</span>
                              )}
                              <button
                                className={`${styles.pageNumber} ${
                                  currentPage === page ? styles.active : ""
                                }`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            </div>
                          ))}
                      </div>
                      <button
                        className={styles.pageBtn}
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                    <div className={styles.paginationInfo}>
                      Page {currentPage} of {totalPages}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />

      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      {/* Provider Suggestions Modal */}
      {showProviderTip &&
        (() => {
          const task = tasks.find((t) => t.id === showProviderTip);
          const suggestions = task
            ? getProviderSuggestions(task.category)
            : null;

          return suggestions ? (
            <div
              className={styles.modalOverlay}
              onClick={() => setShowProviderTip(null)}
            >
              <div
                className={styles.providerModal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.providerModalHeader}>
                  <div className={styles.providerModalTitle}>
                    <Lightbulb size={24} className={styles.lightbulbIcon} />
                    <h3>{suggestions.title}</h3>
                  </div>
                  <button
                    onClick={() => setShowProviderTip(null)}
                    className={styles.closeModalBtn}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className={styles.providerModalBody}>
                  <p className={styles.providerIntro}>
                    Here are some trusted service providers that can help with
                    this task:
                  </p>
                  <ul className={styles.providerList}>
                    {suggestions.providers.map((provider, index) => (
                      <li key={index} className={styles.providerItem}>
                        <span className={styles.providerBullet}>•</span>
                        <span>{provider}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.providerFooter}>
                    <p className={styles.providerNote}>
                      💡 <strong>Tip:</strong> Always verify credentials and
                      read reviews before hiring any service provider.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })()}
    </div>
  );
}

// Wrap in Suspense for useSearchParams
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
                <div className={styles.spinner}></div>
                <p>Loading tasks...</p>
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
