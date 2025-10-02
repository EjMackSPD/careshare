import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

// GET - Fetch all members for a family
export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await requireAuth()
    const { familyId } = await params

    // Verify user is a member of this family
    const familyMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id
        }
      }
    })

    if (!familyMember) {
      return NextResponse.json(
        { error: "Not authorized to view members for this family" },
        { status: 403 }
      )
    }

    // Fetch all family members
    const members = await prisma.familyMember.findMany({
      where: { familyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching family members:", error)
    return NextResponse.json(
      { error: "Failed to fetch family members" },
      { status: 500 }
    )
  }
}

