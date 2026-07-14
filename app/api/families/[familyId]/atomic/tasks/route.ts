import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, requireFamilyMembership } from "@/lib/auth-utils"
import { getTaskDetails, isAtomicConfigured } from "@/lib/atomic"

// List the signed-in user's own Atomic task history for this family.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
) {
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

  const tasks = await prisma.atomicTask.findMany({
    where: { familyId, userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(tasks)
}

// Called by the client once Transact's onFinish callback fires with a
// taskId. We look the task up server-side (rather than trusting client
// input) so status/company data always reflects Atomic's own record.
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
    const taskId = body?.taskId
    const operation = body?.operation

    if (!taskId || (operation !== "manage" && operation !== "deposit")) {
      return NextResponse.json(
        { error: "taskId and a valid operation are required" },
        { status: 400 }
      )
    }

    const details = await getTaskDetails(taskId)

    const task = await prisma.atomicTask.upsert({
      where: { atomicTaskId: taskId },
      create: {
        familyId,
        userId: user.id,
        operation,
        atomicTaskId: taskId,
        status: details.status,
        companyName: details.companyName,
        distributionType: details.distributionType,
        distributionAmount: details.distributionAmount,
      },
      update: {
        status: details.status,
        companyName: details.companyName,
        distributionType: details.distributionType,
        distributionAmount: details.distributionAmount,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error recording Atomic task:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record task" },
      { status: 500 }
    )
  }
}
