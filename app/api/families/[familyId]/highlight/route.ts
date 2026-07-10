import { NextResponse } from "next/server"
import { requireFamilyMembership } from "@/lib/auth-utils"
import { getOrRefreshHighlight } from "@/lib/care-ai-highlight"

// GET - Cached (or freshly generated) Care Concierge dashboard highlight
export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params

    try {
      await requireFamilyMembership(familyId)
    } catch {
      return NextResponse.json(
        { error: "You are not a member of this family" },
        { status: 403 }
      )
    }

    const highlight = await getOrRefreshHighlight(familyId)
    return NextResponse.json(highlight)
  } catch (error) {
    console.error("Error fetching concierge highlight:", error)
    return NextResponse.json(
      { error: "Failed to load highlights" },
      { status: 500 }
    )
  }
}
