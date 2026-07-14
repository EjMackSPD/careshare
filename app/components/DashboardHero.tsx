"use client"

import { useRef, useState } from "react"
import { Camera, Check, X } from "lucide-react"
import { COVER_IMAGES, getCoverImage, getDefaultCoverImage } from "@/lib/dashboard-cover-images"
import styles from "./DashboardHero.module.css"

function toDisplayName(name: string | null | undefined): string {
  if (!name) return "there"
  if (name !== name.toUpperCase() || name === name.toLowerCase()) return name

  // Data stored in ALL CAPS reads as shouting; title-case it for display only.
  return name
    .split(" ")
    .map((word) => (word ? word[0] + word.slice(1).toLowerCase() : word))
    .join(" ")
}

export default function DashboardHero({
  familyId,
  canEditCover,
  eyebrow,
  userName,
  subtitle,
  workspaceName,
  careRecipientName,
  familiesCount,
  initialCoverImageUrl,
  initialCoverPattern,
}: {
  familyId: string | null
  canEditCover: boolean
  eyebrow: string
  userName: string | null
  subtitle: string
  workspaceName: string
  careRecipientName: string
  familiesCount: number
  initialCoverImageUrl: string | null
  initialCoverPattern: string | null
}) {
  const [coverImageUrl, setCoverImageUrl] = useState(initialCoverImageUrl)
  const [coverPattern, setCoverPattern] = useState(initialCoverPattern)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // A photo is always shown: an upload, a chosen curated image, or (if
  // neither was ever picked) a default assigned deterministically per family.
  const displayImageUrl =
    coverImageUrl ||
    getCoverImage(coverPattern)?.imageUrl ||
    (familyId ? getDefaultCoverImage(familyId).imageUrl : COVER_IMAGES[0].imageUrl)

  const coverStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(180deg, rgba(16,42,51,0.5), rgba(16,42,51,0.8)), url(${displayImageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !familyId) return

    setSaving(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`/api/families/${familyId}/cover`, {
        method: "PATCH",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to upload photo")
      }

      const data = await res.json()
      setCoverImageUrl(data.coverImageUrl)
      setCoverPattern(data.coverPattern)
      setPickerOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      setSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function selectImage(imageId: string | null) {
    if (!familyId) return

    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/families/${familyId}/cover`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPattern: imageId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to update dashboard cover")
      }

      const data = await res.json()
      setCoverImageUrl(data.coverImageUrl)
      setCoverPattern(data.coverPattern)
      setPickerOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update dashboard cover")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent} style={coverStyle}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>{eyebrow}</div>

          <h1>Welcome back, {toDisplayName(userName)}.</h1>
          <p className={styles.headerSubtitle}>{subtitle}</p>

          <div className={styles.heroMeta}>
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaLabel}>Workspace</span>
              <strong>{workspaceName}</strong>
            </div>
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaLabel}>Care recipient</span>
              <strong>{careRecipientName}</strong>
            </div>
            <div className={styles.heroMetaItem}>
              <span className={styles.heroMetaLabel}>Families</span>
              <strong>{familiesCount}</strong>
            </div>
          </div>
        </div>

        {canEditCover && familyId && (
          <button
            type="button"
            className={styles.editCoverBtn}
            onClick={() => setPickerOpen(true)}
          >
            <Camera size={15} />
            Change cover
          </button>
        )}
      </div>

      {pickerOpen && (
        <div className={styles.pickerBackdrop} onClick={() => setPickerOpen(false)}>
          <div className={styles.pickerCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.pickerHeader}>
              <h2>Personalize your dashboard</h2>
              <button
                type="button"
                className={styles.pickerClose}
                onClick={() => setPickerOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {error && <p className={styles.pickerError}>{error}</p>}

            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
            >
              <Camera size={16} />
              Upload a family photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.fileInput}
              onChange={handleFileChange}
            />

            <p className={styles.pickerDivider}>or choose a photo</p>

            <div className={styles.patternGrid}>
              {COVER_IMAGES.map((image) => (
                <button
                  type="button"
                  key={image.id}
                  className={styles.patternSwatch}
                  style={{ backgroundImage: `url(${image.imageUrl})` }}
                  onClick={() => selectImage(image.id)}
                  disabled={saving}
                  aria-label={image.label}
                >
                  {!coverImageUrl && coverPattern === image.id && (
                    <span className={styles.swatchCheck}>
                      <Check size={16} />
                    </span>
                  )}
                  <span>{image.label}</span>
                </button>
              ))}
            </div>

            {(coverImageUrl || coverPattern) && (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => selectImage(null)}
                disabled={saving}
              >
                Use default photo
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
