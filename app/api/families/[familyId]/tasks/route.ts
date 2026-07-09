import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireFamilyCapability } from "@/lib/auth-utils"
import { TaskPriority, TaskStatus } from "@prisma/client"

// GET - Fetch all tasks for a family
export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    await requireAuth()
    const { familyId } = await params

    try {
      await requireFamilyCapability(familyId, "care.read")
    } catch {
      return NextResponse.json(
        { error: "Not authorized to view tasks for this family" },
        { status: 403 }
      )
    }

    // Fetch tasks with all assigned users
    const tasks = await prisma.task.findMany({
      where: { familyId },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

// POST - Create a new task
export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    await requireAuth()
    const { familyId } = await params
    const body = await request.json()

    if (!body.title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      )
    }

    try {
      await requireFamilyCapability(familyId, "care.write")
    } catch {
      return NextResponse.json(
        { error: "Not authorized to add tasks to this family" },
        { status: 403 }
      )
    }

    // Parse assignedMembers from body (comma-separated IDs or array)
    const assignedMembers = body.assignedMembers 
      ? (Array.isArray(body.assignedMembers) ? body.assignedMembers : body.assignedMembers.split(',').filter((id: string) => id.trim()))
      : []

    // Create task
    const task = await prisma.task.create({
      data: {
        familyId,
        title: body.title,
        description: body.description || null,
        priority: (body.priority as TaskPriority) || TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        attachmentUrl: body.attachmentUrl || null,
        fileName: body.fileName || null,
        fileType: body.fileType || null,
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

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
