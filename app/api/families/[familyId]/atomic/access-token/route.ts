import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, requireFamilyMembership } from "@/lib/auth-utils"
import { createAccessToken, isAtomicConfigured } from "@/lib/atomic"

// Mints a Transact publicToken for the signed-in user's own bill/deposit
// session. Self-service: any family member can manage their own accounts.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { familyId } = await params
    try {
      await requireFamilyMembership(familyId)
    } catch {
      return NextResponse.json({ error: "Not a family member" }, { status: 403 })
    }

    if (!isAtomicConfigured()) {
      return NextResponse.json(
        { error: "Bill and deposit management isn't set up yet" },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => null)
    const operation = body?.operation

    if (operation !== "manage" && operation !== "deposit") {
      return NextResponse.json(
        { error: "operation must be 'manage' or 'deposit'" },
        { status: 400 }
      )
    }

    const publicToken = await createAccessToken(user.id)

    return NextResponse.json({ publicToken, operation })
  } catch (error) {
    console.error("Error creating Atomic access token:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start session" },
      { status: 500 }
    )
  }
}
