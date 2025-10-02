import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

// GET - Fetch all life stories for a family
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
        { error: "Not authorized to view stories for this family" },
        { status: 403 }
      )
    }

    // Fetch life stories with user information
    const stories = await prisma.lifeStory.findMany({
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

    return NextResponse.json(stories)
  } catch (error) {
    console.error("Error fetching life stories:", error)
    return NextResponse.json(
      { error: "Failed to fetch life stories" },
      { status: 500 }
    )
  }
}

// POST - Create a new life story
export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await requireAuth()
    const { familyId } = await params
    const body = await request.json()
    const { title, content, category, contentType, year, tags, visibility } = body

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      )
    }

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
        { error: "Not authorized to add stories to this family" },
        { status: 403 }
      )
    }

    // Create the life story
    const newStory = await prisma.lifeStory.create({
      data: {
        familyId,
        userId: user.id,
        title,
        content,
        category,
        contentType: contentType || 'TEXT',
        year: year ? parseInt(year) : null,
        tags: tags || null,
        visibility: visibility || 'family'
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

    return NextResponse.json(newStory, { status: 201 })
  } catch (error) {
    console.error("Error creating life story:", error)
    return NextResponse.json(
      { error: "Failed to create life story" },
      { status: 500 }
    )
  }
}

