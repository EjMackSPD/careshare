import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { FamilyRole } from '@prisma/client'

export async function PATCH(
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

    // Check if user is a Care Manager of this family
    const member = await prisma.familyMember.findFirst({
      where: {
        familyId,
        userId: (user as any).id,
        role: FamilyRole.CARE_MANAGER, // Only Care Managers can update settings
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Only Care Managers can update family settings' },
        { status: 403 }
      )
    }

    // Update family
    const family = await prisma.family.update({
      where: { id: familyId },
      data: {
        name: body.name,
        description: body.description,
        elderName: body.elderName,
        elderPhone: body.elderPhone,
        elderAddress: body.elderAddress,
        elderBirthday: body.elderBirthday ? new Date(body.elderBirthday) : null,
        emergencyContact: body.emergencyContact,
        medicalNotes: body.medicalNotes,
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

    return NextResponse.json(family)
  } catch (error) {
    console.error('Update family error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

