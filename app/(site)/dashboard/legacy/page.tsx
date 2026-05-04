'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import Footer from '@/app/components/Footer'
import { Plus, Book, Heart, Briefcase, Lightbulb, Calendar, BookOpen, PenTool, Image, Video, Mic, FileText } from 'lucide-react'
import styles from './page.module.css'

type Family = {
  id: string
  name: string
  elderName?: string
}

type StoryCategory = 'CHILDHOOD' | 'FAMILY' | 'CAREER' | 'LIFE_WISDOM' | 'MILESTONE' | 'STORY' | 'JOURNAL'
type ContentType = 'TEXT' | 'PHOTO' | 'AUDIO' | 'VIDEO' | 'DOCUMENT'

type LifeStory = {
  id: string
  title: string
  content: string
  category: StoryCategory
  contentType: ContentType
  year: number | null
  tags: string | null
  visibility: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

type MediaTab = 'All Memories' | 'Text' | 'Photos' | 'Audio' | 'Video' | 'Documents' | 'Collections'

const categoryIcons = {
  CHILDHOOD: Book,
  FAMILY: Heart,
  CAREER: Briefcase,
  LIFE_WISDOM: Lightbulb,
  MILESTONE: Calendar,
  STORY: BookOpen,
  JOURNAL: PenTool
}

const categoryLabels = {
  CHILDHOOD: 'Childhood',
  FAMILY: 'Family',
  CAREER: 'Career',
  LIFE_WISDOM: 'Life Wisdom',
  MILESTONE: 'Milestone',
  STORY: 'Story',
  JOURNAL: 'Journal'
}

const contentTypeIcons = {
  TEXT: FileText,
  PHOTO: Image,
  AUDIO: Mic,
  VIDEO: Video,
  DOCUMENT: FileText
}

export default function LiveForeverPage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const [stories, setStories] = useState<LifeStory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<MediaTab>('All Memories')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'STORY' as StoryCategory,
    contentType: 'TEXT' as ContentType,
    year: '',
    tags: '',
    visibility: 'family'
  })

  const tabs: MediaTab[] = ['All Memories', 'Text', 'Photos', 'Audio', 'Video', 'Documents', 'Collections']

  // Fetch families
  useEffect(() => {
    async function fetchFamilies() {
      try {
        const res = await fetch('/api/families')
        if (!res.ok) throw new Error('Failed to fetch families')
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

  // Fetch life stories when family changes
  useEffect(() => {
    if (!selectedFamily) return

    async function fetchStories() {
      try {
        const res = await fetch(`/api/families/${selectedFamily}/life-stories`)
        if (!res.ok) throw new Error('Failed to fetch stories')
        const data = await res.json()
        setStories(data)
      } catch (error) {
        console.error('Error fetching stories:', error)
      }
    }

    fetchStories()
  }, [selectedFamily])

  const selectedFamilyData = families.find(f => f.id === selectedFamily)
  const archiveName = selectedFamilyData?.elderName || selectedFamilyData?.name || 'Family'

  const filteredStories = stories.filter(story => {
    if (activeTab === 'All Memories') return true
    if (activeTab === 'Text') return story.contentType === 'TEXT'
    if (activeTab === 'Photos') return story.contentType === 'PHOTO'
    if (activeTab === 'Audio') return story.contentType === 'AUDIO'
    if (activeTab === 'Video') return story.contentType === 'VIDEO'
    if (activeTab === 'Documents') return story.contentType === 'DOCUMENT'
    if (activeTab === 'Collections') return false // For future implementation
    return true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFamily || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/families/${selectedFamily}/life-stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to create life story')

      const newStory = await res.json()
      setStories(prev => [newStory, ...prev])
      setShowAddModal(false)
      setFormData({
        title: '',
        content: '',
        category: 'STORY',
        contentType: 'TEXT',
        year: '',
        tags: '',
        visibility: 'family'
      })
    } catch (error) {
      console.error('Error creating life story:', error)
      alert('Failed to create life story. Please try again.')
    } finally {
      setSubmitting(false)
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
              <h1 className={styles.title}>Live Forever</h1>
              <p className={styles.subtitle}>Preserve meaningful moments and life stories for generations to come</p>
            </div>
            <div className={styles.headerActions}>
              <select 
                value={selectedFamily} 
                onChange={(e) => setSelectedFamily(e.target.value)}
                className={styles.familySelect}
                disabled={loading}
              >
                {loading ? (
                  <option>Loading...</option>
                ) : families.length === 0 ? (
                  <option>No families found</option>
                ) : (
                  families.map(family => (
                    <option key={family.id} value={family.id}>
                      {family.elderName || family.name}
                    </option>
                  ))
                )}
              </select>
              <button className={styles.createBtn} onClick={() => setShowAddModal(true)}>
                <Plus size={20} />
                Add Life Story
              </button>
              <button className={styles.collectionBtn}>
                <Book size={20} />
                Create Collection
              </button>
            </div>
          </div>

          {/* Archive Header */}
          <div className={styles.archiveHeader}>
            <h2>{archiveName}'s Life Story Archive</h2>
            <p>This digital archive preserves {archiveName}'s memories, wisdom, and life experiences for future generations. Family members can contribute stories, photos, and recordings to build a lasting legacy.</p>
          </div>

          {/* Category Pills */}
          <div className={styles.categoryPills}>
            {(Object.keys(categoryLabels) as StoryCategory[]).map((category) => {
              const Icon = categoryIcons[category]
              return (
                <button key={category} className={styles.categoryPill}>
                  <Icon size={16} />
                  {categoryLabels[category]}
                </button>
              )
            })}
          </div>

          {/* Media Tabs */}
          <div className={styles.mediaTabs}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.mediaTab} ${activeTab === tab ? styles.activeMediaTab : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Stories Grid */}
          {loading ? (
            <div className={styles.loadingState}>Loading stories...</div>
          ) : filteredStories.length === 0 ? (
            <div className={styles.emptyState}>
              <Book size={64} strokeWidth={1} />
              <h3>No stories yet</h3>
              <p>Start building {archiveName}'s legacy by adding the first life story.</p>
              <button className={styles.addFirstBtn} onClick={() => setShowAddModal(true)}>
                <Plus size={20} />
                Add First Story
              </button>
            </div>
          ) : (
            <div className={styles.storiesGrid}>
              {filteredStories.map((story) => {
                const CategoryIcon = categoryIcons[story.category]
                const ContentIcon = contentTypeIcons[story.contentType]
                return (
                  <div key={story.id} className={styles.storyCard}>
                    <div className={styles.storyHeader}>
                      <div className={styles.categoryBadge}>
                        <CategoryIcon size={14} />
                        {categoryLabels[story.category]}
                      </div>
                      <div className={styles.contentTypeBadge}>
                        <ContentIcon size={14} />
                      </div>
                    </div>

                    <h3>{story.title}</h3>
                    {story.year && <p className={styles.year}>{story.year}</p>}
                    
                    <p className={styles.storyContent}>
                      {story.content.length > 200 
                        ? `${story.content.substring(0, 200)}...` 
                        : story.content}
                    </p>

                    {story.tags && (
                      <div className={styles.tags}>
                        {story.tags.split(',').map((tag, idx) => (
                          <span key={idx} className={styles.tag}>{tag.trim()}</span>
                        ))}
                      </div>
                    )}

                    <div className={styles.storyFooter}>
                      <span className={styles.author}>
                        {story.user.name || story.user.email}
                      </span>
                      <span className={styles.date}>
                        Added on {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button className={styles.readMoreBtn}>Read more</button>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add Story Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Add Life Story</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., My First Day of School"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as StoryCategory})}
                    required
                  >
                    {(Object.keys(categoryLabels) as StoryCategory[]).map((cat) => (
                      <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="1970"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Story Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Share your story, memory, or wisdom..."
                  rows={6}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="teaching, education, memories"
                />
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Story'}
                </button>
              </div>
            </form>
        </div>
      </div>
      )}
      <Footer />
    </div>
  )
}
