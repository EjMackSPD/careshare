import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { FamilyRole, OnboardingStatus } from '@prisma/client'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const familyInclude = {
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
      careRecipient: true,
    }

    const [familyMembers, adminFamilies] = await Promise.all([
      prisma.familyMember.findMany({
        where: { userId: (user as any).id },
        include: { family: { include: familyInclude } },
      }),
      prisma.adminFamily.findMany({
        where: { adminId: (user as any).id },
        include: { family: { include: familyInclude } },
      }),
    ])

    const familiesById = new Map<string, (typeof familyMembers)[number]['family']>()
    for (const fm of familyMembers) familiesById.set(fm.family.id, fm.family)
    for (const af of adminFamilies) {
      if (!familiesById.has(af.family.id)) familiesById.set(af.family.id, af.family)
    }

    return NextResponse.json(Array.from(familiesById.values()))
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
            role: FamilyRole.OWNER,
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

    await prisma.user.update({
      where: { id: (user as any).id },
      data: {
        onboardingStatus: OnboardingStatus.COMPLETED,
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

