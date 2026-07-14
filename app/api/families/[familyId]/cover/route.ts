import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { prisma } from "@/lib/prisma"
import { requireFamilyMembership } from "@/lib/auth-utils"
import { getCoverImage } from "@/lib/dashboard-cover-images"
import { managerRoles } from "@/lib/family-permissions"
import { toDisplayBlobUrl } from "@/lib/blob"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

// Sets the dashboard header photo or predefined pattern for a family.
// Accepts either a multipart upload (a photo) or a JSON body selecting a
// predefined pattern id; the two are mutually exclusive.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params
    try {
      await requireFamilyMembership(familyId, managerRoles)
    } catch {
      return NextResponse.json(
        { error: "You do not have permission to change this family's dashboard" },
        { status: 403 }
      )
    }

    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file")

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "A file is required" }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Image must be smaller than 5MB" },
          { status: 400 }
        )
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, or WEBP images are allowed" },
          { status: 400 }
        )
      }

      const blob = await put(`family-covers/${familyId}-${Date.now()}`, file, {
        access: "private",
        addRandomSuffix: true,
      })

      const family = await prisma.family.update({
        where: { id: familyId },
        data: { coverImageUrl: blob.url, coverPattern: null },
      })

      return NextResponse.json({
        coverImageUrl: toDisplayBlobUrl(family.coverImageUrl),
        coverPattern: family.coverPattern,
      })
    }

    const body = await request.json().catch(() => null)
    const patternId = body?.coverPattern

    if (patternId === null) {
      const family = await prisma.family.update({
        where: { id: familyId },
        data: { coverImageUrl: null, coverPattern: null },
      })
      return NextResponse.json({
        coverImageUrl: toDisplayBlobUrl(family.coverImageUrl),
        coverPattern: family.coverPattern,
      })
    }

    if (!getCoverImage(patternId)) {
      return NextResponse.json({ error: "Unknown pattern" }, { status: 400 })
    }

    const family = await prisma.family.update({
      where: { id: familyId },
      data: { coverPattern: patternId, coverImageUrl: null },
    })

    return NextResponse.json({
      coverImageUrl: toDisplayBlobUrl(family.coverImageUrl),
      coverPattern: family.coverPattern,
    })
  } catch (error) {
    console.error("Error updating family cover:", error)
    return NextResponse.json({ error: "Failed to update dashboard cover" }, { status: 500 })
  }
}
