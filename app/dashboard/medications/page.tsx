'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import Footer from '@/app/components/Footer'
import { Plus, Pill, Clock, Calendar, Trash2, Edit, X } from 'lucide-react'
import styles from './page.module.css'

type Medication = {
  id: string
  name: string
  dosage: string
  frequency: string
  timeOfDay: string | null
  instructions: string | null
  prescribedBy: string | null
  startDate: string
  endDate: string | null
  refillDate: string | null
  pharmacy: string | null
  notes: string | null
  active: boolean
}

type Family = {
  id: string
  name: string
  elderName: string | null
}

const frequencyLabels: { [key: string]: string } = {
  ONCE_DAILY: 'Once Daily',
  TWICE_DAILY: 'Twice Daily',
  THREE_TIMES_DAILY: '3 Times Daily',
  FOUR_TIMES_DAILY: '4 Times Daily',
  AS_NEEDED: 'As Needed',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  OTHER: 'Other'
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'ONCE_DAILY',
    timeOfDay: '',
    instructions: '',
    prescribedBy: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    refillDate: '',
    pharmacy: '',
    notes: '',
    active: true
  })

  // Fetch families
  useEffect(() => {
    async function fetchFamilies() {
      try {
        const res = await fetch('/api/families')
        if (!res.ok) return
        const data = await res.json()
        setFamilies(data)
        if (data.length > 0) {
          setSelectedFamily(data[0].id)
        }
      } catch (error) {
        console.error('Error fetching families:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFamilies()
  }, [])

  // Fetch medications when family changes
  useEffect(() => {
    if (!selectedFamily) return
    fetchMedications()
  }, [selectedFamily])

  async function fetchMedications() {
    try {
      const res = await fetch(`/api/families/${selectedFamily}/medications`)
      if (res.ok) {
        const data = await res.json()
        setMedications(data)
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingMed 
        ? `/api/medications/${editingMed.id}`
        : `/api/families/${selectedFamily}/medications`
      
      const method = editingMed ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        await fetchMedications()
        resetForm()
      } else {
        alert('Failed to save medication')
      }
    } catch (error) {
      console.error('Error saving medication:', error)
      alert('Failed to save medication')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return

    try {
      const res = await fetch(`/api/medications/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMedications(medications.filter(m => m.id !== id))
      } else {
        alert('Failed to delete medication')
      }
    } catch (error) {
      console.error('Error deleting medication:', error)
      alert('Failed to delete medication')
    }
  }

  const handleEdit = (med: Medication) => {
    setEditingMed(med)
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      timeOfDay: med.timeOfDay || '',
      instructions: med.instructions || '',
      prescribedBy: med.prescribedBy || '',
      startDate: med.startDate.split('T')[0],
      endDate: med.endDate ? med.endDate.split('T')[0] : '',
      refillDate: med.refillDate ? med.refillDate.split('T')[0] : '',
      pharmacy: med.pharmacy || '',
      notes: med.notes || '',
      active: med.active
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setShowAddModal(false)
    setEditingMed(null)
    setFormData({
      name: '',
      dosage: '',
      frequency: 'ONCE_DAILY',
      timeOfDay: '',
      instructions: '',
      prescribedBy: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      refillDate: '',
      pharmacy: '',
      notes: '',
      active: true
    })
  }

  const selectedFamilyData = families.find(f => f.id === selectedFamily)
  const elderName = selectedFamilyData?.elderName || selectedFamilyData?.name || 'Family Member'

  const filteredMedications = medications.filter(m => 
    showActiveOnly ? m.active : true
  )

  const activeMeds = medications.filter(m => m.active)
  const inactiveMeds = medications.filter(m => !m.active)

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />
      
      <div className={styles.layout}>
        <LeftNavigation />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Medication Management</h1>
              <p className={styles.subtitle}>Track medications, dosages, and schedules for {elderName}</p>
            </div>
            <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              Add Medication
            </button>
          </div>

          {/* Family Selector & Filters */}
          <div className={styles.controls}>
            <select 
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className={styles.familySelect}
              disabled={loading}
            >
              {families.map(family => (
                <option key={family.id} value={family.id}>
                  {family.elderName || family.name}
                </option>
              ))}
            </select>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
              Active medications only
            </label>
          </div>

          {/* Medications List */}
          {loading ? (
            <div className={styles.loading}>Loading medications...</div>
          ) : filteredMedications.length === 0 ? (
            <div className={styles.emptyState}>
              <Pill size={64} strokeWidth={1} />
              <h3>No medications found</h3>
              <p>Add the first medication to start tracking {elderName}'s prescriptions.</p>
              <button className={styles.emptyAddBtn} onClick={() => setShowAddModal(true)}>
                <Plus size={20} />
                Add First Medication
              </button>
            </div>
          ) : (
            <div className={styles.medicationsGrid}>
              {filteredMedications.map((med) => (
                <div key={med.id} className={`${styles.medCard} ${!med.active ? styles.inactive : ''}`}>
                  <div className={styles.medHeader}>
                    <div>
                      <h3>{med.name}</h3>
                      <p className={styles.dosage}>{med.dosage}</p>
                    </div>
                    <div className={styles.medActions}>
                      <button onClick={() => handleEdit(med)} className={styles.editBtn} title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(med.id)} className={styles.deleteBtn} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.medDetails}>
                    <div className={styles.detailRow}>
                      <Clock size={16} />
                      <span>
                        <strong>{frequencyLabels[med.frequency]}</strong>
                        {med.timeOfDay && ` at ${med.timeOfDay}`}
                      </span>
                    </div>

                    {med.prescribedBy && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Prescribed by:</span>
                        <span>{med.prescribedBy}</span>
                      </div>
                    )}

                    {med.pharmacy && (
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Pharmacy:</span>
                        <span>{med.pharmacy}</span>
                      </div>
                    )}

                    {med.refillDate && (
                      <div className={styles.detailRow}>
                        <Calendar size={16} />
                        <span>
                          <strong>Next Refill:</strong> {new Date(med.refillDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {med.instructions && (
                      <div className={styles.instructions}>
                        <strong>Instructions:</strong> {med.instructions}
                      </div>
                    )}

                    {med.notes && (
                      <div className={styles.notes}>
                        <strong>Notes:</strong> {med.notes}
                      </div>
                    )}
                  </div>

                  {!med.active && (
                    <div className={styles.inactiveBadge}>Inactive</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className={styles.modal} onClick={resetForm}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>{editingMed ? 'Edit Medication' : 'Add Medication'}</h2>
                  <button className={styles.closeBtn} onClick={resetForm}>
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Medication Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Lisinopril"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Dosage *</label>
                      <input
                        type="text"
                        value={formData.dosage}
                        onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                        placeholder="e.g., 10mg"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Frequency *</label>
                      <select
                        value={formData.frequency}
                        onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                        required
                      >
                        {Object.entries(frequencyLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Time of Day</label>
                      <input
                        type="text"
                        value={formData.timeOfDay}
                        onChange={(e) => setFormData({...formData, timeOfDay: e.target.value})}
                        placeholder="e.g., 8:00 AM, 8:00 PM"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Instructions</label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      placeholder="e.g., Take with food, Avoid grapefruit"
                      rows={2}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Prescribed By</label>
                      <input
                        type="text"
                        value={formData.prescribedBy}
                        onChange={(e) => setFormData({...formData, prescribedBy: e.target.value})}
                        placeholder="Doctor name"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Pharmacy</label>
                      <input
                        type="text"
                        value={formData.pharmacy}
                        onChange={(e) => setFormData({...formData, pharmacy: e.target.value})}
                        placeholder="e.g., CVS Pharmacy"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Start Date *</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Next Refill Date</label>
                    <input
                      type="date"
                      value={formData.refillDate}
                      onChange={(e) => setFormData({...formData, refillDate: e.target.value})}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes or observations"
                      rows={2}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      />
                      Active medication
                    </label>
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" onClick={resetForm} className={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      {editingMed ? 'Update' : 'Add'} Medication
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}

