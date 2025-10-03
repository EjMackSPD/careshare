import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { familyId } = await params

    // Check if user is member of this family
    const isMember = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: (user as any).id,
      },
    })

    if (!isMember) {
      return NextResponse.json(
        { error: "Not authorized to view resources for this family" },
        { status: 403 }
      )
    }

    // Fetch resources
    const resources = await prisma.resource.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { familyId } = await params
    const body = await request.json()

    // Check if user is member of this family
    const isMember = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: (user as any).id,
      },
    })

    if (!isMember) {
      return NextResponse.json(
        { error: "Not authorized to add resources to this family" },
        { status: 403 }
      )
    }

    // Create resource
    const resource = await prisma.resource.create({
      data: {
        familyId,
        title: body.title,
        description: body.description || null,
        category: body.category,
        url: body.url || null,
        fileUrl: body.fileUrl || null
      }
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error("Error creating resource:", error)
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    )
  }
}

