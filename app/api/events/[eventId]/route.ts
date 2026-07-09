import { NextResponse } from 'next/server'
import { getCurrentUser, requireFamilyCapability } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventId } = await params
    const body = await request.json()

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 403 }
      )
    }

    try {
      await requireFamilyCapability(event.familyId, 'care.write')
    } catch {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 403 }
      )
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...body,
        eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { eventId } = await params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 403 }
      )
    }

    try {
      await requireFamilyCapability(event.familyId, 'care.write')
    } catch {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 403 }
      )
    }

    await prisma.event.delete({
      where: { id: eventId },
    })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

