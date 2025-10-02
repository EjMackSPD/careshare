import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const familyMembers = await prisma.familyMember.findMany({
      where: {
        userId: (user as any).id,
      },
      include: {
        family: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const families = familyMembers.map(fm => fm.family)

    return NextResponse.json(families)
  } catch (error) {
    console.error('Get families error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, elderName, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Family name is required' },
        { status: 400 }
      )
    }

    // Create family and add creator as organizer
    const family = await prisma.family.create({
      data: {
        name,
        elderName,
        description,
        createdBy: (user as any).id,
        members: {
          create: {
            userId: (user as any).id,
            role: 'organizer',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(family, { status: 201 })
  } catch (error) {
    console.error('Create family error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

