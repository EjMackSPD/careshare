import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFamilyCapability, logFamilyAuditEvent } from "@/lib/auth-utils"
import { todayKey } from "@/lib/dashboard-data"

type Ctx = { params: Promise<{ familyId: string; medId: string }> }

async function authorize(familyId: string, medId: string) {
  const { user } = await requireFamilyCapability(familyId, "care.write")
  const med = await prisma.medication.findFirst({
    where: { id: medId, familyId },
    select: { id: true },
  })
  if (!med) return { error: "not_found" as const }
  return { user }
}

// POST - mark today's dose taken for this medication.
export async function POST(request: Request, { params }: Ctx) {
  try {
    const { familyId, medId } = await params
    let auth
    try {
      auth = await authorize(familyId, medId)
    } catch {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }
    if ("error" in auth) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    const takenOn = todayKey()
    await prisma.medicationDose.upsert({
      where: { medicationId_takenOn: { medicationId: medId, takenOn } },
      create: { medicationId: medId, familyId, takenOn, takenBy: auth.user.id },
      update: { takenAt: new Date(), takenBy: auth.user.id },
    })

    await logFamilyAuditEvent({
      familyId,
      userId: auth.user.id,
      action: "medication.dose_taken",
      entityType: "medication",
      entityId: medId,
    })

    return NextResponse.json({ takenToday: true })
  } catch (error) {
    console.error("Error marking dose taken:", error)
    return NextResponse.json({ error: "Failed to update dose" }, { status: 500 })
  }
}

// DELETE - undo today's dose for this medication.
export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const { familyId, medId } = await params
    let auth
    try {
      auth = await authorize(familyId, medId)
    } catch {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }
    if ("error" in auth) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    await prisma.medicationDose.deleteMany({
      where: { medicationId: medId, takenOn: todayKey() },
    })
    return NextResponse.json({ takenToday: false })
  } catch (error) {
    console.error("Error undoing dose:", error)
    return NextResponse.json({ error: "Failed to update dose" }, { status: 500 })
  }
}
