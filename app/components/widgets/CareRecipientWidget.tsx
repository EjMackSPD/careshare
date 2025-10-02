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
    if (!newNote.trim() || !familyId) return

    try {
      const res = await fetch(`/api/families/${familyId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, category: 'general' })
      })

      if (res.ok) {
        const createdNote = await res.json()
        setNotes([createdNote, ...notes.slice(0, 1)])
        setNewNote('')
        setShowAddNote(false)
      }
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <div className={styles.careRecipientInfo}>
          <div className={styles.avatar}>
            {elderName?.charAt(0) || 'M'}
          </div>
          <div>
            <h3>{elderName}</h3>
            <p>{elderAge} years old</p>
          </div>
        </div>
      </div>
      
      <div className={styles.widgetContent}>
        <div className={styles.statusBadges}>
          <span className={styles.badge}>Wellness: {wellness}</span>
          <span className={styles.badge}>{medications} Medications Today</span>
          <span className={styles.badge}>Doctor Appt: {nextAppointment}</span>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.noteHeader}>
              <strong>Recent Notes</strong>
              <button 
                className={styles.addNoteBtn}
                onClick={() => setShowAddNote(!showAddNote)}
                title="Add note"
              >
                <Plus size={16} />
              </button>
            </div>
            
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
      </div>
    </div>
  )
}

