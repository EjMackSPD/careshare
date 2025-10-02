import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"
import { MedicationFrequency } from "@prisma/client"

// GET - Fetch all medications for a family
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
        { error: "Not authorized to view medications for this family" },
        { status: 403 }
      )
    }

    // Fetch medications
    const medications = await prisma.medication.findMany({
      where: { familyId },
      orderBy: { active: 'desc' } // Active meds first
    })

    return NextResponse.json(medications)
  } catch (error) {
    console.error("Error fetching medications:", error)
    return NextResponse.json(
      { error: "Failed to fetch medications" },
      { status: 500 }
    )
  }
}

// POST - Create a new medication
export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await requireAuth()
    const { familyId } = await params
    const body = await request.json()

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
        { error: "Not authorized to add medications to this family" },
        { status: 403 }
      )
    }

    // Create medication
    const medication = await prisma.medication.create({
      data: {
        familyId,
        userId: user.id,
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency as MedicationFrequency,
        timeOfDay: body.timeOfDay || null,
        instructions: body.instructions || null,
        prescribedBy: body.prescribedBy || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        refillDate: body.refillDate ? new Date(body.refillDate) : null,
        pharmacy: body.pharmacy || null,
        notes: body.notes || null,
        active: body.active !== undefined ? body.active : true
      }
    })

    return NextResponse.json(medication, { status: 201 })
  } catch (error) {
    console.error("Error creating medication:", error)
    return NextResponse.json(
      { error: "Failed to create medication" },
      { status: 500 }
    )
  }
}

