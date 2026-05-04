'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import LeftNavigation from '@/app/components/LeftNavigation'
import Footer from '@/app/components/Footer'
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Filter,
  Globe,
  Library,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react'
import styles from './page.module.css'

type Resource = {
  id: string
  title: string
  description: string | null
  category: string
  url: string | null
  fileUrl: string | null
}

type Family = {
  id: string
  name: string
  elderName: string | null
}

function normalizeCategory(value: string) {
  return value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [family, setFamily] = useState<Family | null>(null)

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true)

        const familiesRes = await fetch('/api/families')
        if (!familiesRes.ok) {
          throw new Error('Failed to fetch families')
        }

        const familiesData = (await familiesRes.json()) as Family[]
        const firstFamily = Array.isArray(familiesData) ? familiesData[0] : null

        if (!firstFamily) {
          setResources([])
          return
        }

        setFamily(firstFamily)

        const resourcesRes = await fetch(
          `/api/families/${firstFamily.id}/resources`
        )

        if (!resourcesRes.ok) {
          throw new Error('Failed to fetch resources')
        }

        const resourcesData = (await resourcesRes.json()) as Resource[]
        setResources(resourcesData)
      } catch (error) {
        console.error('ResourcesPage error:', error)
        setResources([])
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(resources.map((resource) => normalizeCategory(resource.category)))
    ).sort((a, b) => a.localeCompare(b))

    return ['All', ...uniqueCategories]
  }, [resources])

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const normalizedCategory = normalizeCategory(resource.category)
      const matchesSearch =
        searchQuery.trim() === '' ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        normalizedCategory.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        activeCategory === 'All' || normalizedCategory === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [activeCategory, resources, searchQuery])

  const categoryCounts = useMemo(() => {
    return resources.reduce<Record<string, number>>((acc, resource) => {
      const category = normalizeCategory(resource.category)
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})
  }, [resources])

  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryCounts)
    if (entries.length === 0) return null

    return entries.sort((a, b) => b[1] - a[1])[0]
  }, [categoryCounts])

  const linkedResources = resources.filter((resource) => resource.url).length
  const documentResources = resources.filter((resource) => resource.fileUrl).length
  const descriptiveResources = resources.filter(
    (resource) => resource.description && resource.description.trim().length > 0
  ).length

  const highlightedResources = filteredResources.slice(0, 3)

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />

        <main className={styles.main}>
          <section className={styles.header}>
            <div className={styles.headerCopy}>
              <div className={styles.eyebrow}>
                <Library size={15} />
                <span>Resources</span>
              </div>
              <h1>Resource library</h1>
              <p>
                Keep trusted services, documents, and useful links in one working
                view for {family?.elderName || family?.name || 'your family'}.
              </p>
            </div>

            <div className={styles.headerMeta}>
              <div className={styles.metaLabel}>Current workspace</div>
              <div className={styles.metaValue}>{family?.name || 'Loading...'}</div>
              <div className={styles.metaSubtle}>
                {family?.elderName || 'Shared care support'}
              </div>
            </div>
          </section>

          <section className={styles.signalRow}>
            <article className={styles.signalCard}>
              <span className={styles.signalLabel}>Tracked resources</span>
              <strong>{resources.length}</strong>
              <p>Total services, links, and files in this workspace.</p>
            </article>

            <article className={styles.signalCard}>
              <span className={styles.signalLabel}>Most represented</span>
              <strong>{topCategory ? topCategory[0] : 'No category yet'}</strong>
              <p>
                {topCategory
                  ? `${topCategory[1]} item${topCategory[1] === 1 ? '' : 's'} currently grouped here.`
                  : 'Add a few resources to start building the library.'}
              </p>
            </article>

            <article className={styles.signalCard}>
              <span className={styles.signalLabel}>Reference coverage</span>
              <strong>{descriptiveResources}</strong>
              <p>Resources with enough context for someone else to use quickly.</p>
            </article>
          </section>

          <section className={styles.workspace}>
            <aside className={styles.filtersPanel}>
              <div className={styles.searchPanel}>
                <label className={styles.panelLabel} htmlFor="resource-search">
                  Search
                </label>
                <div className={styles.searchBox}>
                  <Search size={18} />
                  <input
                    id="resource-search"
                    type="text"
                    placeholder="Search titles, notes, or categories"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.filterSection}>
                <div className={styles.sectionHeader}>
                  <Filter size={16} />
                  <span>Categories</span>
                </div>

                <div className={styles.categoryList}>
                  {categories.map((category) => {
                    const count =
                      category === 'All'
                        ? resources.length
                        : categoryCounts[category] || 0

                    return (
                      <button
                        key={category}
                        className={`${styles.categoryButton} ${
                          activeCategory === category ? styles.categoryButtonActive : ''
                        }`}
                        onClick={() => setActiveCategory(category)}
                      >
                        <span>{category}</span>
                        <strong>{count}</strong>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={styles.insightPanel}>
                <div className={styles.sectionHeader}>
                  <Sparkles size={16} />
                  <span>Quick insight</span>
                </div>
                <p>
                  Strong libraries usually mix live service links with internal
                  documents. Right now you have <strong>{linkedResources}</strong>{' '}
                  link-based resource{linkedResources === 1 ? '' : 's'} and{' '}
                  <strong>{documentResources}</strong> file-based reference
                  {documentResources === 1 ? '' : 's'}.
                </p>
              </div>
            </aside>

            <section className={styles.resultsPanel}>
              <div className={styles.resultsHeader}>
                <div>
                  <h2>Library view</h2>
                  <p>
                    {filteredResources.length} result
                    {filteredResources.length === 1 ? '' : 's'}
                    {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className={styles.loadingState}>
                  <Loader2 size={24} className={styles.spinner} />
                  <p>Loading resources…</p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className={styles.emptyState}>
                  <BookOpen size={28} />
                  <h3>No resources match this view</h3>
                  <p>Try a broader search or switch to another category.</p>
                </div>
              ) : (
                <>
                  {highlightedResources.length > 0 && (
                    <div className={styles.highlightStrip}>
                      {highlightedResources.map((resource) => (
                        <Link
                          key={`highlight-${resource.id}`}
                          href={`/dashboard/resources/${resource.id}`}
                          className={styles.highlightCard}
                        >
                          <div className={styles.highlightMeta}>
                            <span>{normalizeCategory(resource.category)}</span>
                            <ArrowUpRight size={16} />
                          </div>
                          <h3>{resource.title}</h3>
                          <p>
                            {resource.description?.trim()
                              ? resource.description
                              : 'Open this resource to review links, files, and usage details.'}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className={styles.resourceGrid}>
                    {filteredResources.map((resource) => {
                      const hasLink = Boolean(resource.url)
                      const hasFile = Boolean(resource.fileUrl)

                      return (
                        <Link
                          key={resource.id}
                          href={`/dashboard/resources/${resource.id}`}
                          className={styles.resourceCard}
                        >
                          <div className={styles.resourceTop}>
                            <span className={styles.categoryBadge}>
                              {normalizeCategory(resource.category)}
                            </span>
                            <div className={styles.assetFlags}>
                              {hasLink && (
                                <span className={styles.assetPill}>
                                  <Globe size={13} />
                                  Link
                                </span>
                              )}
                              {hasFile && (
                                <span className={styles.assetPill}>
                                  <FileText size={13} />
                                  File
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={styles.resourceBody}>
                            <h3>{resource.title}</h3>
                            <p>
                              {resource.description?.trim()
                                ? resource.description
                                : 'No description yet. Open this resource to add context and make it easier for the family to use.'}
                            </p>
                          </div>

                          <div className={styles.resourceFooter}>
                            <span>Open resource</span>
                            <ArrowUpRight size={16} />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
            </section>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  )
}
