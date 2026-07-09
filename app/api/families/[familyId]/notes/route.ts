import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireFamilyCapability } from "@/lib/auth-utils"

// GET - Fetch all notes for a family
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
        { error: "Not authorized to view notes for this family" },
        { status: 403 }
      )
    }

    // Fetch notes with user information
    const notes = await prisma.note.findMany({
      where: { familyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}

// POST - Create a new note
export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await requireAuth()
    const { familyId } = await params
    const body = await request.json()
    const { title, content, category } = body

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: "Note content cannot be empty" },
        { status: 400 }
      )
    }

    try {
      await requireFamilyCapability(familyId, "care.write")
    } catch {
      return NextResponse.json(
        { error: "Not authorized to add notes to this family" },
        { status: 403 }
      )
    }

    // Create the note
    const newNote = await prisma.note.create({
      data: {
        familyId,
        userId: user.id,
        title: title || null,
        content: content.trim(),
        category: category || 'general'
      },
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

    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    )
  }
}

