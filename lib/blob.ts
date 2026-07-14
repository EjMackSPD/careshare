// Private Vercel Blob URLs aren't fetchable directly by the browser; proxy
// them through /api/blob, which holds the token needed to read them.
export function toDisplayBlobUrl(url: string | null | undefined): string | null {
  if (!url) return null

  try {
    const parsed = new URL(url)
    if (parsed.hostname.endsWith(".private.blob.vercel-storage.com")) {
      return `/api/blob?url=${encodeURIComponent(url)}`
    }
  } catch {
    return url
  }

  return url
}
