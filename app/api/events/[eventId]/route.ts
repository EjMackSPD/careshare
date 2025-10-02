import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
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

    // Verify user has access to this event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        family: {
          include: {
            members: {
              where: {
                userId: (user as any).id,
              },
            },
          },
        },
      },
    })

    if (!event || event.family.members.length === 0) {
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

    // Verify user has access to this event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        family: {
          include: {
            members: {
              where: {
                userId: (user as any).id,
              },
            },
          },
        },
      },
    })

    if (!event || event.family.members.length === 0) {
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

