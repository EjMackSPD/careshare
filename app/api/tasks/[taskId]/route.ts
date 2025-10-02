import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"
import { TaskPriority, TaskStatus } from "@prisma/client"

// PATCH - Update a task
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await requireAuth()
    const { taskId } = await params
    const body = await request.json()

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
        { error: "Not authorized to update this task" },
        { status: 403 }
      )
    }

    // Parse assignedMembers from body
    const assignedMembers = body.assignedMembers 
      ? (Array.isArray(body.assignedMembers) ? body.assignedMembers : body.assignedMembers.split(',').filter((id: string) => id.trim()))
      : []

    // Delete existing assignments
    await prisma.taskAssignment.deleteMany({
      where: { taskId }
    })

    // Update task
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: body.title,
        description: body.description || null,
        priority: body.priority as TaskPriority,
        status: body.status as TaskStatus,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        completedAt: body.status === 'COMPLETED' ? new Date() : null,
        assignments: {
          create: assignedMembers.map((userId: string) => ({
            userId: userId.trim()
          }))
        }
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

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

