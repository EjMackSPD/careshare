'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/app/components/Navigation'
import { Plus, Calendar, User } from 'lucide-react'
import styles from './page.module.css'

type Note = {
  id: string
  title: string | null
  content: string
  category: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

export default function NotesPage() {
  const params = useParams()
  const familyId = params.familyId as string
  
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddNote, setShowAddNote] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general'
  })

  const categories = ['all', 'health', 'care', 'observation', 'general']

  useEffect(() => {
    fetchNotes()
  }, [familyId])

  async function fetchNotes() {
    try {
      const res = await fetch(`/api/families/${familyId}/notes`)
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch(`/api/families/${familyId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      })

      if (res.ok) {
        const createdNote = await res.json()
        setNotes([createdNote, ...notes])
        setNewNote({ title: '', content: '', category: 'general' })
        setShowAddNote(false)
      }
    } catch (error) {
      console.error('Error creating note:', error)
      alert('Failed to create note')
    }
  }

  const filteredNotes = notes.filter(note => 
    filterCategory === 'all' || note.category === filterCategory
  )

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Care Notes</h1>
            <p className={styles.subtitle}>Track observations, health updates, and important information</p>
          </div>
          <button className={styles.addBtn} onClick={() => setShowAddNote(true)}>
            <Plus size={20} />
            Add Note
          </button>
        </div>

        {/* Category Filter */}
        <div className={styles.filters}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${filterCategory === cat ? styles.activeFilter : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Notes List */}
        {loading ? (
          <div className={styles.loading}>Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No notes found. Start adding care notes to track important information.</p>
            <button className={styles.emptyAddBtn} onClick={() => setShowAddNote(true)}>
              <Plus size={20} />
              Add First Note
            </button>
          </div>
        ) : (
          <div className={styles.notesList}>
            {filteredNotes.map(note => (
              <div key={note.id} className={styles.noteCard}>
                {note.title && <h3>{note.title}</h3>}
                <p className={styles.noteContent}>{note.content}</p>
                <div className={styles.noteMeta}>
                  {note.category && (
                    <span className={styles.categoryBadge}>
                      {note.category}
                    </span>
                  )}
                  <div className={styles.authorInfo}>
                    <User size={14} />
                    <span>{note.user.name || note.user.email}</span>
                  </div>
                  <div className={styles.dateInfo}>
                    <Calendar size={14} />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Note Modal */}
        {showAddNote && (
          <div className={styles.modal} onClick={() => setShowAddNote(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2>Add Care Note</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Title (Optional)</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    placeholder="e.g., Doctor Visit Update"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                  >
                    <option value="general">General</option>
                    <option value="health">Health</option>
                    <option value="care">Care</option>
                    <option value="observation">Observation</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Note Content *</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    placeholder="Write your note here..."
                    rows={6}
                    required
                  />
                </div>

                <div className={styles.formActions}>
                  <button type="button" onClick={() => setShowAddNote(false)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

