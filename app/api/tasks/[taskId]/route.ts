import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

// DELETE - Delete a task
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await requireAuth()
    const { taskId } = await params

    // Get the task to verify family membership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { family: true }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    // Verify user is a member of this family
    const familyMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId: task.familyId,
          userId: user.id
        }
      }
    })

    if (!familyMember) {
      return NextResponse.json(
        { error: "Not authorized to delete this task" },
        { status: 403 }
      )
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}

