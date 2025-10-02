import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { costId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { costId } = params
    const body = await request.json()

    // Verify user has access to this cost
    const cost = await prisma.cost.findUnique({
      where: { id: costId },
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

    if (!cost || cost.family.members.length === 0) {
      return NextResponse.json(
        { error: 'Cost not found or access denied' },
        { status: 403 }
      )
    }

    const updatedCost = await prisma.cost.update({
      where: { id: costId },
      data: {
        ...body,
        paidDate: body.status === 'PAID' ? new Date() : null,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedCost)
  } catch (error) {
    console.error('Update cost error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { costId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { costId } = params

    // Verify user has access to this cost
    const cost = await prisma.cost.findUnique({
      where: { id: costId },
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

    if (!cost || cost.family.members.length === 0) {
      return NextResponse.json(
        { error: 'Cost not found or access denied' },
        { status: 403 }
      )
    }

    await prisma.cost.delete({
      where: { id: costId },
    })

    return NextResponse.json({ message: 'Cost deleted successfully' })
  } catch (error) {
    console.error('Delete cost error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

