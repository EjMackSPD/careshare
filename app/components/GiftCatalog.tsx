'use client'

import { useMemo, useState } from 'react'
import { Search, Gift, Send, AlertCircle } from 'lucide-react'
import styles from './GiftCatalog.module.css'

type Product = {
  id: string
  name: string
  category: string
  imageUrl: string | null
  minValue: number
  maxValue: number
  currencyCode: string
}

type GiftHistoryItem = {
  id: string
  itemName: string
  price: number
  currencyCode: string
  status: string
  recipientName: string | null
  failureReason: string | null
  createdAt: string
}

export default function GiftCatalog({
  familyId,
  careRecipientName,
  configured,
  products,
  gifts,
}: {
  familyId: string | null
  careRecipientName: string | null
  configured: boolean
  products: Product[]
  gifts: GiftHistoryItem[]
}) {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [openProductId, setOpenProductId] = useState<string | null>(null)
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [history, setHistory] = useState<GiftHistoryItem[]>(gifts)

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  )

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  function openForm(product: Product) {
    setOpenProductId(product.id)
    setRecipientName(careRecipientName || '')
    setRecipientEmail('')
    setAmount(String(product.minValue || 25))
    setMessage('')
    setFeedback(null)
  }

  async function sendGift(product: Product) {
    if (!familyId) return

    setSending(true)
    setFeedback(null)

    try {
      const response = await fetch(`/api/families/${familyId}/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          itemName: product.name,
          recipientName,
          recipientEmail,
          amount,
          currencyCode: product.currencyCode,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send gift')
      }

      setHistory((current) => [
        {
          id: data.id,
          itemName: data.itemName,
          price: data.price,
          currencyCode: data.currencyCode,
          status: data.status,
          recipientName: data.recipientName,
          failureReason: data.failureReason,
          createdAt: data.createdAt,
        },
        ...current,
      ])
      setFeedback({ type: 'success', text: `Sent! ${product.name} is on its way to ${recipientEmail}.` })
      setOpenProductId(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to send gift',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Gift Marketplace</h1>
              <p className={styles.subtitle}>Send real gift cards to support your loved ones</p>
            </div>
          </div>

          {!configured && (
            <div className={styles.notConfigured}>
              <AlertCircle size={20} />
              <p>Gift ordering isn&apos;t set up yet. A Tremendous API key needs to be configured before gift cards can be sent.</p>
            </div>
          )}

          {configured && (
            <>
              <div className={styles.categoryTabs}>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`${styles.categoryTab} ${activeCategory === category ? styles.activeCategory : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    <Gift size={16} />
                    {category === 'All' ? 'All' : category.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div className={styles.searchBar}>
                <Search size={20} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search gift cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <section className={styles.productsSection}>
                <div className={styles.productsGrid}>
                  {filteredProducts.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                      {product.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                      )}
                      <h3>{product.name}</h3>
                      <p className={styles.productRange}>
                        {product.currencyCode} {product.minValue}–{product.maxValue}
                      </p>

                      {openProductId === product.id ? (
                        <form
                          className={styles.sendForm}
                          onSubmit={(e) => {
                            e.preventDefault()
                            void sendGift(product)
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Recipient name"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            required
                          />
                          <input
                            type="email"
                            placeholder="Recipient email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            required
                          />
                          <input
                            type="number"
                            min={product.minValue}
                            max={product.maxValue}
                            step="0.01"
                            placeholder={`Amount (${product.minValue}-${product.maxValue})`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                          />
                          <textarea
                            placeholder="Personal message (optional)"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={2}
                          />
                          <div className={styles.formActions}>
                            <button
                              type="button"
                              className={styles.cancelBtn}
                              onClick={() => setOpenProductId(null)}
                              disabled={sending}
                            >
                              Cancel
                            </button>
                            <button type="submit" className={styles.confirmBtn} disabled={sending}>
                              {sending ? 'Sending…' : 'Send'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button className={styles.sendBtn} onClick={() => openForm(product)}>
                          <Send size={16} />
                          Send Gift
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className={styles.emptyState}>
                    <p>No gift cards found matching your search.</p>
                  </div>
                )}
              </section>

              {feedback && (
                <p className={feedback.type === 'success' ? styles.successText : styles.errorText}>
                  {feedback.text}
                </p>
              )}

              <section className={styles.historySection}>
                <h2>Recent gifts sent</h2>
                {history.length === 0 ? (
                  <p className={styles.emptyText}>No gifts sent yet.</p>
                ) : (
                  <div className={styles.historyList}>
                    {history.map((gift) => (
                      <div key={gift.id} className={styles.historyItem}>
                        <div>
                          <strong>{gift.itemName}</strong>
                          <span className={styles.historyMeta}>
                            {gift.currencyCode} {gift.price.toFixed(2)} to {gift.recipientName || 'recipient'}
                          </span>
                          {gift.failureReason && (
                            <span className={styles.historyError}>{gift.failureReason}</span>
                          )}
                        </div>
                        <span className={`${styles.statusBadge} ${styles[`status_${gift.status}`] || ''}`}>
                          {gift.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
