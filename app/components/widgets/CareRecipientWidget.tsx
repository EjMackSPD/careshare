'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import styles from './Widget.module.css'

type CareRecipientWidgetProps = {
  elderName?: string | null
  elderAge?: number
  wellness?: string
  medications?: number
  nextAppointment?: string
  familyId?: string
}

type Note = {
  id: string
  content: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function CareRecipientWidget({ 
  elderName = 'Martha Johnson', 
  elderAge = 78,
  wellness = 'Good',
  medications = 3,
  nextAppointment = '2 days',
  familyId
}: CareRecipientWidgetProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    if (!familyId) return
    
    async function fetchNotes() {
      try {
        const res = await fetch(`/api/families/${familyId}/notes`)
        if (res.ok) {
          const data = await res.json()
          setNotes(data.slice(0, 2)) // Show only 2 most recent
        }
      } catch (error) {
        console.error('Error fetching notes:', error)
      }
    }

    fetchNotes()
  }, [familyId])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newNote.trim()) {
      alert('Please enter a note')
      return
    }
    
    if (!familyId) {
      alert('No family selected. Please create or join a family first.')
      return
    }

    try {
      console.log('Attempting to save note for familyId:', familyId)
      
      const res = await fetch(`/api/families/${familyId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, category: 'general' })
      })

      console.log('Note save response:', { status: res.status, ok: res.ok })

      if (!res.ok) {
        const error = await res.json()
        console.error('Note save error response:', error)
        throw new Error(error.error || 'Failed to save note')
      }

      const createdNote = await res.json()
      console.log('Note created successfully:', createdNote)
      setNotes([createdNote, ...notes.slice(0, 1)])
      setNewNote('')
      setShowAddNote(false)
    } catch (error) {
      console.error('Error adding note:', error)
      alert(error instanceof Error ? error.message : 'Failed to save note. Please try again.')
    }
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3>Care Notes</h3>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddNote(!showAddNote)}
          title="Add note"
        >
          <Plus size={16} />
          Add Note
        </button>
      </div>
      
      <div className={styles.widgetContent}>
        
        {showAddNote && (
          <form onSubmit={handleAddNote} className={styles.addNoteForm}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a quick note about care, health, or observations..."
              rows={3}
              className={styles.noteInput}
            />
            <div className={styles.noteActions}>
              <button type="button" onClick={() => setShowAddNote(false)} className={styles.noteCancelBtn}>
                Cancel
              </button>
              <button type="submit" className={styles.noteSaveBtn}>Save</button>
            </div>
          </form>
        )}
        
        {notes.length === 0 ? (
          <p className={styles.emptyText}>No recent notes.</p>
        ) : (
          <div className={styles.notesList}>
            {notes.map(note => (
              <div key={note.id} className={styles.noteItem}>
                <p className={styles.noteContent}>{note.content.substring(0, 80)}{note.content.length > 80 ? '...' : ''}</p>
                <span className={styles.noteAuthor}>
                  - {note.user.name || note.user.email}
                </span>
              </div>
            ))}
          </div>
        )}
        {familyId && (
          <Link href={`/family/${familyId}/notes`} className={styles.viewAllLink}>
            View all notes →
          </Link>
        )}
      </div>
    </div>
  )
}

