import { NextResponse } from 'next/server'
import { getCurrentUser, requireFamilyCapability } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { familyId } = await params

    try {
      await requireFamilyCapability(familyId, 'care.read')
    } catch {
      return NextResponse.json(
        { error: 'Not a member of this family' },
        { status: 403 }
      )
    }

    const events = await prisma.event.findMany({
      where: {
        familyId,
      },
      orderBy: {
        eventDate: 'asc',
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { familyId } = await params
    const body = await request.json()
    const { title, description, type, eventDate, location } = body

    if (!title || !type || !eventDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      await requireFamilyCapability(familyId, 'care.write')
    } catch {
      return NextResponse.json(
        { error: 'Not a member of this family' },
        { status: 403 }
      )
    }

    const event = await prisma.event.create({
      data: {
        familyId,
        title,
        description,
        type,
        eventDate: new Date(eventDate),
        location,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

