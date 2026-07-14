export type CoverImage = {
  id: string
  label: string
  imageUrl: string
}

// Curated (not user-uploaded) dashboard header photos a family can pick
// from, or that get assigned by default. Sourced from Unsplash (free
// license), hand-picked and reviewed for warmth and framing.
export const COVER_IMAGES: CoverImage[] = [
  {
    id: "circle",
    label: "Together",
    imageUrl:
      "https://images.unsplash.com/photo-1706200637521-b446bd05df0d?w=2000&q=80&auto=format",
  },
  {
    id: "celebration",
    label: "Celebration",
    imageUrl:
      "https://images.unsplash.com/photo-1742522211724-3425d697bbf0?w=2000&q=80&auto=format",
  },
  {
    id: "garden",
    label: "Garden",
    imageUrl:
      "https://images.unsplash.com/photo-1644093128192-3abfd57c4a99?w=2000&q=80&auto=format",
  },
  {
    id: "planting",
    label: "Growing together",
    imageUrl:
      "https://images.unsplash.com/photo-1657664043009-c4975cb4eed3?w=2000&q=80&auto=format",
  },
  {
    id: "kitchen",
    label: "Home",
    imageUrl:
      "https://images.unsplash.com/photo-1761839258803-21515f43190c?w=2000&q=80&auto=format",
  },
  {
    id: "baking",
    label: "Baking",
    imageUrl:
      "https://images.unsplash.com/photo-1758874960466-fb0a3e0007bc?w=2000&q=80&auto=format",
  },
]

export function getCoverImage(id?: string | null): CoverImage | null {
  return COVER_IMAGES.find((image) => image.id === id) ?? null
}

// Deterministic (not re-randomized on every render) so a family sees the
// same default photo across visits until they change it.
export function getDefaultCoverImage(familyId: string): CoverImage {
  const hash = familyId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return COVER_IMAGES[hash % COVER_IMAGES.length]
}
