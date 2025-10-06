"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import { Search, Trash2, UserPlus, X, Edit, Upload, FileText, Image as ImageIcon, Lightbulb } from "lucide-react";
import styles from "./page.module.css";

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

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"open" | "unassigned" | "completed">("open");
  const [sortBy, setSortBy] = useState<"alpha" | "date">("date");
  const [showAddTask, setShowAddTask] = useState(false);

  // Check URL params for initial tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'unassigned' || tabParam === 'completed' || tabParam === 'open') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Medication",
    priority: "MEDIUM" as "HIGH" | "MEDIUM" | "LOW",
    assignedTo: "",
    dueDate: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showProviderTip, setShowProviderTip] = useState<string | null>(null);

  // Fetch families with members
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
          assignedTo: t.assignments?.map((a: any) => a.userId).join(",") || "", // Store user IDs for editing
          assignedToName:
            t.assignments
              ?.map((a: any) => a.user.name || a.user.email)
              .join(", ") || "", // For display
          dueDate: t.dueDate ? new Date(t.dueDate).toLocaleString() : "",
          completed: t.status === "COMPLETED",
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    "all",
    "Medication",
    "Healthcare",
    "Shopping",
    "Home Maintenance",
  ];

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
        matchesTab = !task.completed && (!task.assignedTo || task.assignedTo.trim() === "");
      } else {
        // "open" tab - all non-completed tasks
        matchesTab = !task.completed;
      }
      
      return matchesSearch && matchesCategory && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === "alpha") {
        return a.title.localeCompare(b.title);
      } else {
        // Sort by date (most recent first)
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, activeTab]);

  const toggleTask = async (id: string) => {
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
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      // Update local state
      setTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );

      // Show success toast
      if (!task.completed) {
        showToast(`✓ Task "${task.title}" marked as complete!`, 'success');
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast("Failed to update task", 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      // Remove task from local state
      setTasks(tasks.filter((task) => task.id !== id));
      showToast("Task deleted successfully", 'success');
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Failed to delete task", 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
  };

  const uploadFile = async (file: File): Promise<{ url: string; fileName: string; fileType: string } | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload file');

      const data = await res.json();
      return {
        url: data.url,
        fileName: file.name,
        fileType: file.type,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Failed to upload file', 'error');
      return null;
    }
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

  // Check if task category might need 3rd party services
  const getProviderSuggestions = (category: string) => {
    const suggestions: { [key: string]: { title: string; providers: string[] } } = {
      'Medical': {
        title: 'Medical Care Providers',
        providers: ['Home Health Aides', 'Visiting Nurses', 'Physical Therapists', 'Medical Equipment Suppliers']
      },
      'Transportation': {
        title: 'Transportation Services',
        providers: ['GoGoGrandparent', 'Senior Ride Services', 'Medical Transport', 'Uber/Lyft', 'Local Taxi Services']
      },
      'Home Care': {
        title: 'Home Care Services',
        providers: ['Visiting Angels', 'Home Instead', 'Comfort Keepers', 'Right at Home', 'Local Home Care Agencies']
      },
      'Meal Prep': {
        title: 'Meal Services',
        providers: ['Meals on Wheels', 'Home Chef', 'HelloFresh', 'Magic Kitchen', 'Mom\'s Meals (Senior-focused)']
      },
      'Cleaning': {
        title: 'Cleaning Services',
        providers: ['Handy', 'TaskRabbit', 'The Maids', 'Molly Maid', 'Local Cleaning Services']
      },
      'Yard Work': {
        title: 'Yard & Outdoor Services',
        providers: ['LawnStarter', 'TaskRabbit', 'Local Landscaping Services', 'Handy']
      },
      'Personal Care': {
        title: 'Personal Care Services',
        providers: ['In-home Salon Services', 'Mobile Barber/Stylist', 'Senior Personal Care Aides']
      }
    };
    return suggestions[category];
  };

  const needsThirdParty = (category: string) => {
    return ['Medical', 'Transportation', 'Home Care', 'Meal Prep', 'Cleaning', 'Yard Work', 'Personal Care'].includes(category);
  };

  const currentFamily = families.find((f) => f.id === selectedFamily);
  const familyMembers = currentFamily?.members || [];

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
        
        if (!fileData) {
          return; // Upload failed, don't continue
        }
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignedMembers: selectedMembers, // Send array of all selected member IDs
        dueDate: newTask.dueDate || null,
        status: editingTask ? undefined : "TODO", // Don't override status when editing
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

      console.log("Saving task:", { url, method, taskData, selectedMembers });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      console.log("Task save response:", { status: res.status, ok: res.ok });

      if (!res.ok) {
        const error = await res.json();
        console.error("Task save error:", error);
        throw new Error(error.error || "Failed to save task");
      }

      // Refresh tasks list
      await fetchTasks();

      showToast(editingTask ? "Task updated successfully" : "Task created successfully", 'success');

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
      showToast(error instanceof Error ? error.message : "Failed to save task", 'error');
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

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Tasks & Responsibilities</h1>
              <p className={styles.subtitle}>
                Manage and track tasks for your loved ones
              </p>
            </div>
            <div className={styles.headerActions}>
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

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "open" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("open")}
              >
                Open Tasks
                <span className={styles.tabCount}>
                  {tasks.filter(t => !t.completed).length}
                </span>
              </button>
              <button
                className={`${styles.tab} ${activeTab === "unassigned" ? styles.activeTab : ""} ${styles.unassignedTab}`}
                onClick={() => setActiveTab("unassigned")}
              >
                Unassigned
                <span className={`${styles.tabCount} ${styles.warningCount}`}>
                  {tasks.filter(t => !t.completed && (!t.assignedTo || t.assignedTo.trim() === "")).length}
                </span>
              </button>
              <button
                className={`${styles.tab} ${activeTab === "completed" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("completed")}
              >
                Completed
                <span className={styles.tabCount}>
                  {tasks.filter(t => t.completed).length}
                </span>
              </button>
            </div>
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

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Category *</label>
                      <select
                        value={newTask.category}
                        onChange={(e) =>
                          setNewTask({ ...newTask, category: e.target.value })
                        }
                        required
                      >
                        <option value="Medication">Medication</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Home Maintenance">
                          Home Maintenance
                        </option>
                      </select>
                    </div>

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

                    {selectedMembers.length > 0 && (
                      <div className={styles.selectedMembers}>
                        <span className={styles.selectedLabel}>Selected:</span>
                        {selectedMembers.map((userId) => {
                          const member = familyMembers.find(
                            (m) => m.userId === userId
                          );
                          const displayName =
                            member?.user.name ||
                            member?.user.email ||
                            "Unknown";

                          return (
                            <span key={userId} className={styles.selectedTag}>
                              {displayName}
                              <button
                                type="button"
                                onClick={() => toggleMemberSelection(userId)}
                                className={styles.removeTag}
                              >
                                <X size={14} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

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

                  <div className={styles.formGroup}>
                    <label>
                      <Upload size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
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
                        {uploadedFile.type.startsWith('image/') ? (
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

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      {editingTask ? "Save Task" : "Add Task"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className={styles.tasksSection}>
            <div className={styles.tasksSectionHeader}>
              <div>
                <h2>Tasks</h2>
                {currentFamily && (
                  <p className={styles.familyLabel}>
                    {currentFamily.name}
                  </p>
                )}
              </div>
              <p className={styles.taskCount}>
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>
            </div>

            {loading ? (
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
                <div className={styles.tasksList}>
                  {paginatedTasks.map((task, index) => {
                    const isUnassigned = !task.assignedTo || task.assignedTo.trim() === "";
                    return (
                    <div
                      key={task.id}
                      className={`${styles.taskCard} ${
                        task.completed ? styles.completed : ""
                      } ${isUnassigned && !task.completed ? styles.unassigned : ""}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className={styles.taskCheckbox}
                        title={task.completed ? "Unmark as complete" : "Mark as complete"}
                      />

                      <div className={styles.taskContent}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        {task.attachmentUrl && (
                          <div className={styles.taskAttachment}>
                            {task.fileType?.startsWith('image/') ? (
                              <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                                <img 
                                  src={task.attachmentUrl} 
                                  alt={task.fileName || 'Attachment'} 
                                  className={styles.attachmentImage}
                                />
                              </a>
                            ) : (
                              <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                                <FileText size={16} />
                                <span>{task.fileName || 'Attachment'}</span>
                              </a>
                            )}
                          </div>
                        )}
                        <div className={styles.taskMeta}>
                          <span className={styles.dueDate}>
                            Due: {task.dueDate}
                          </span>
                        </div>
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
                    <div className={styles.paginationInfo}>
                      Showing {startIndex + 1}-
                      {Math.min(endIndex, filteredTasks.length)} of{" "}
                      {filteredTasks.length} tasks
                    </div>
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
                            // Show first page, last page, current page, and pages around current
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
      {showProviderTip && (() => {
        const task = tasks.find(t => t.id === showProviderTip);
        const suggestions = task ? getProviderSuggestions(task.category) : null;
        
        return suggestions ? (
          <div className={styles.modalOverlay} onClick={() => setShowProviderTip(null)}>
            <div className={styles.providerModal} onClick={(e) => e.stopPropagation()}>
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
                  Here are some trusted service providers that can help with this task:
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
                    💡 <strong>Tip:</strong> Always verify credentials and read reviews before hiring any service provider.
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
