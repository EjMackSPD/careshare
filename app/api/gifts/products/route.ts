import { NextRequest, NextResponse } from "next/server"
import { requireFamilyMembership } from "@/lib/auth-utils"
import { isTremendousConfigured, listGiftProducts } from "@/lib/tremendous"

// GET /api/gifts/products?familyId=... - List real Tremendous gift-card products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const familyId = searchParams.get("familyId")

    if (!familyId) {
      return NextResponse.json({ error: "Family ID required" }, { status: 400 })
    }

    try {
      await requireFamilyMembership(familyId)
    } catch {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const configured = isTremendousConfigured()
    const products = configured ? await listGiftProducts() : []

    return NextResponse.json({ configured, products })
  } catch (error) {
    console.error("Error fetching gift products:", error)
    return NextResponse.json(
      { error: "Failed to fetch gift products" },
      { status: 500 }
    )
  }
}
