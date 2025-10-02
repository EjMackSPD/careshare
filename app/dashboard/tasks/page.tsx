'use client'

import { useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Search, Trash2 } from 'lucide-react'
import styles from './page.module.css'

type Task = {
  id: string
  title: string
  description: string
  category: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  assignedTo: string
  dueDate: string
  completed: boolean
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
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Medication',
    priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
    assignedTo: '',
    dueDate: '',
  })

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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      assignedTo: newTask.assignedTo,
      dueDate: newTask.dueDate,
      completed: false,
    }
    setTasks([task, ...tasks])
    setShowAddTask(false)
    setNewTask({
      title: '',
      description: '',
      category: 'Medication',
      priority: 'MEDIUM',
      assignedTo: '',
      dueDate: '',
    })
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

          {/* Add Task Modal */}
          {showAddTask && (
            <div className={styles.modal} onClick={() => setShowAddTask(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Add New Task</h2>
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

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Assigned To</label>
                      <input
                        type="text"
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        placeholder="Family member name"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Due Date</label>
                      <input
                        type="datetime-local"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" onClick={() => setShowAddTask(false)} className={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      Add Task
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
                      {task.assignedTo && (
                        <span className={styles.assignedBadge}>Assigned to: {task.assignedTo}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className={styles.deleteBtn}
                    title="Delete task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

