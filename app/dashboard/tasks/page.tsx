'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Search, Trash2, UserPlus, X, Edit } from 'lucide-react'
import styles from './page.module.css'

type Task = {
  id: string
  title: string
  description: string
  category: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  assignedTo: string
  assignedToName?: string
  dueDate: string
  completed: boolean
}

type FamilyMember = {
  id: string
  userId: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

type Family = {
  id: string
  name: string
  elderName: string | null
  members: FamilyMember[]
}

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Pick up prescriptions',
    description: 'Get monthly medications from Walgreens',
    category: 'Medication',
    priority: 'HIGH',
    assignedTo: 'Sarah Miller',
    dueDate: '10/3/2025, 12:26:15 PM',
    completed: false,
  },
  {
    id: '2',
    title: 'Schedule doctor appointment',
    description: 'Annual checkup with Dr. Stevens',
    category: 'Healthcare',
    priority: 'MEDIUM',
    assignedTo: 'John Johnson',
    dueDate: '10/9/2025, 12:26:15 PM',
    completed: false,
  },
  {
    id: '3',
    title: 'Grocery shopping',
    description: 'Get weekly groceries including fresh fruits',
    category: 'Shopping',
    priority: 'MEDIUM',
    assignedTo: 'Robert James',
    dueDate: '10/4/2025, 12:26:15 PM',
    completed: false,
  },
  {
    id: '4',
    title: 'Fix leaking faucet',
    description: 'Call plumber or fix bathroom sink',
    category: 'Home Maintenance',
    priority: 'LOW',
    assignedTo: '',
    dueDate: '10/5/2025, 12:26:15 PM',
    completed: false,
  },
]

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [families, setFamilies] = useState<Family[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Medication',
    priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
    assignedTo: '',
    dueDate: '',
  })

  // Fetch families with members
  useEffect(() => {
    async function fetchFamilies() {
      try {
        const res = await fetch('/api/families')
        if (!res.ok) throw new Error('Failed to fetch families')
        const data = await res.json()
        
        // Fetch members for each family
        const familiesWithMembers = await Promise.all(
          data.map(async (family: any) => {
            const membersRes = await fetch(`/api/families/${family.id}/members`)
            const members = membersRes.ok ? await membersRes.json() : []
            return { ...family, members }
          })
        )
        
        setFamilies(familiesWithMembers)
        if (familiesWithMembers.length > 0) {
          setSelectedFamily(familiesWithMembers[0].id)
        }
      } catch (error) {
        console.error('Error fetching families:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFamilies()
  }, [])

  // Fetch tasks when family changes
  useEffect(() => {
    if (!selectedFamily) return
    fetchTasks()
  }, [selectedFamily])

  async function fetchTasks() {
    setLoading(true)
    try {
      const res = await fetch(`/api/families/${selectedFamily}/tasks`)
      if (res.ok) {
        const data = await res.json()
        // Convert database format to display format
        const formattedTasks = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          category: 'General',
          priority: t.priority,
          assignedTo: t.assignedTo || '', // Store comma-separated user IDs for editing
          assignedToName: getAssignedMemberNames(t.assignedTo), // For display
          dueDate: t.dueDate ? new Date(t.dueDate).toLocaleString() : '',
          completed: t.status === 'COMPLETED'
        }))
        setTasks(formattedTasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAssignedMemberNames = (assignedTo: string | null): string => {
    if (!assignedTo) return ''
    const userIds = assignedTo.split(',').filter(id => id.trim())
    const names = userIds.map(userId => {
      const member = familyMembers.find(m => m.userId === userId)
      return member?.user.name || member?.user.email || ''
    }).filter(name => name)
    return names.join(', ')
  }

  const categories = ['all', 'Medication', 'Healthcare', 'Shopping', 'Home Maintenance']

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory
    const matchesCompleted = showCompleted || !task.completed
    return matchesSearch && matchesCategory && matchesCompleted
  })

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete task')
      }

      // Remove task from local state
      setTasks(tasks.filter(task => task.id !== id))
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task. Please try again.')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return styles.highPriority
      case 'MEDIUM': return styles.mediumPriority
      case 'LOW': return styles.lowPriority
      default: return ''
    }
  }

  const currentFamily = families.find(f => f.id === selectedFamily)
  const familyMembers = currentFamily?.members || []

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const getSelectedMemberNames = () => {
    return selectedMembers
      .map(userId => {
        const member = familyMembers.find(m => m.userId === userId)
        return member?.user.name || member?.user.email || 'Unknown'
      })
      .join(', ')
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFamily) {
      alert('Please select a family first')
      return
    }

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignedTo: selectedMembers.length > 0 ? selectedMembers[0] : null, // Database stores single user ID
        dueDate: newTask.dueDate || null,
        status: editingTask ? undefined : 'TODO' // Don't override status when editing
      }

      const url = editingTask
        ? `/api/tasks/${editingTask.id}`
        : `/api/families/${selectedFamily}/tasks`
      
      const method = editingTask ? 'PATCH' : 'POST'

      console.log('Saving task:', { url, method, taskData, selectedMembers })

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })

      console.log('Task save response:', { status: res.status, ok: res.ok })

      if (!res.ok) {
        const error = await res.json()
        console.error('Task save error:', error)
        throw new Error(error.error || 'Failed to save task')
      }

      // Refresh tasks list
      await fetchTasks()
      
      setShowAddTask(false)
      setEditingTask(null)
      setSelectedMembers([])
      setNewTask({
        title: '',
        description: '',
        category: 'Medication',
        priority: 'MEDIUM',
        assignedTo: '',
        dueDate: '',
      })
    } catch (error) {
      console.error('Error saving task:', error)
      alert(error instanceof Error ? error.message : 'Failed to save task')
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    
    // Parse assigned members from assignedTo field (comma-separated IDs)
    const assignedIds = task.assignedTo ? task.assignedTo.split(',').filter(id => id.trim()) : []
    setSelectedMembers(assignedIds)
    
    setNewTask({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    })
    setShowAddTask(true)
  }

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Tasks & Responsibilities</h1>
              <p className={styles.subtitle}>Manage and track tasks for your loved ones</p>
            </div>
            <button className={styles.addTaskBtn} onClick={() => setShowAddTask(!showAddTask)}>
              + Add Task
            </button>
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
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Filter by category' : cat}
                  </option>
                ))}
              </select>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                />
                Show completed
              </label>
            </div>
          </div>

            {/* Add/Edit Task Modal */}
          {showAddTask && (
            <div className={styles.modal} onClick={() => setShowAddTask(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
                  <button className={styles.closeBtn} onClick={() => setShowAddTask(false)}>✕</button>
                </div>
                
                <form onSubmit={handleAddTask} className={styles.taskForm}>
                  <div className={styles.formGroup}>
                    <label>Task Title *</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="e.g., Pick up prescriptions"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Additional details about the task..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Category *</label>
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        required
                      >
                        <option value="Medication">Medication</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Home Maintenance">Home Maintenance</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Priority *</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' })}
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
                          setShowAddTask(false)
                          router.push(`/family/${selectedFamily}/members`)
                        }}
                      >
                        <UserPlus size={14} />
                        Add Member
                      </button>
                    </div>
                    
                    {loading ? (
                      <div className={styles.loadingText}>Loading family members...</div>
                    ) : familyMembers.length === 0 ? (
                      <div className={styles.noMembers}>
                        <p>No family members found. Add members to assign tasks.</p>
                      </div>
                    ) : (
                      <div className={styles.memberSelector}>
                        {familyMembers.map((member) => {
                          const isSelected = selectedMembers.includes(member.userId)
                          const displayName = member.user.name || member.user.email
                          
                          return (
                            <div
                              key={member.userId}
                              className={`${styles.memberOption} ${isSelected ? styles.selected : ''}`}
                              onClick={() => toggleMemberSelection(member.userId)}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className={styles.memberCheckbox}
                              />
                              <span>{displayName}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    {selectedMembers.length > 0 && (
                      <div className={styles.selectedMembers}>
                        <span className={styles.selectedLabel}>Selected:</span>
                        {selectedMembers.map(userId => {
                          const member = familyMembers.find(m => m.userId === userId)
                          const displayName = member?.user.name || member?.user.email || 'Unknown'
                          
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
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Due Date</label>
                    <input
                      type="datetime-local"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" onClick={() => setShowAddTask(false)} className={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      {editingTask ? 'Save Task' : 'Add Task'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className={styles.tasksSection}>
            <div className={styles.tasksSectionHeader}>
              <h2>Tasks</h2>
              <p className={styles.taskCount}>Showing {filteredTasks.length} of {tasks.length} tasks</p>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading tasks...</p>
              </div>
            ) : (
              <div className={styles.tasksList}>
                {filteredTasks.map((task) => (
                <div key={task.id} className={`${styles.taskCard} ${task.completed ? styles.completed : ''}`}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className={styles.taskCheckbox}
                  />
                  
                  <div className={styles.taskContent}>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <div className={styles.taskMeta}>
                      <span className={styles.dueDate}>Due: {task.dueDate}</span>
                    </div>
                    <div className={styles.taskTags}>
                      <span className={styles.categoryBadge}>{task.category}</span>
                      <span className={`${styles.priorityBadge} ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()} Priority
                      </span>
                      {task.assignedToName && (
                        <span className={styles.assignedBadge}>Assigned to: {task.assignedToName}</span>
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
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

