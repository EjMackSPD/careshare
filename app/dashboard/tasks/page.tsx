'use client'

import { useState } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import { Search } from 'lucide-react'
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return styles.highPriority
      case 'MEDIUM': return styles.mediumPriority
      case 'LOW': return styles.lowPriority
      default: return ''
    }
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
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

