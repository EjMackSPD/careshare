import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireFamilyCapability } from "@/lib/auth-utils"
import { MedicationFrequency } from "@prisma/client"

// PATCH - Update a medication
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ medicationId: string }> }
) {
  try {
    await requireAuth()
    const { medicationId } = await params
    const body = await request.json()

    // Get medication to verify family membership
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId }
    })

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      )
    }

    try {
      await requireFamilyCapability(medication.familyId, "sensitive.write")
    } catch {
      return NextResponse.json(
        { error: "Not authorized to update this medication" },
        { status: 403 }
      )
    }

    // Update medication
    const updated = await prisma.medication.update({
      where: { id: medicationId },
      data: {
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating medication:", error)
    return NextResponse.json(
      { error: "Failed to update medication" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a medication
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ medicationId: string }> }
) {
  try {
    await requireAuth()
    const { medicationId } = await params

    // Get medication to verify family membership
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId }
    })

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      )
    }

    try {
      await requireFamilyCapability(medication.familyId, "sensitive.write")
    } catch {
      return NextResponse.json(
        { error: "Not authorized to delete this medication" },
        { status: 403 }
      )
    }

    // Delete medication
    await prisma.medication.delete({
      where: { id: medicationId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting medication:", error)
    return NextResponse.json(
      { error: "Failed to delete medication" },
      { status: 500 }
    )
  }
}

