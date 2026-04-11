import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getCurrentUser,
  logFamilyAuditEvent,
  requireFamilyCapability,
  requireFamilyMembership,
} from '@/lib/auth-utils'
import { normalizeFamilyRole } from '@/lib/family-permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { familyId } = await params
    try {
      await requireFamilyMembership(familyId)
    } catch (error) {
      return NextResponse.json({ error: 'Not a family member' }, { status: 403 })
    }

    // Get pending invitations
    const invitations = await prisma.familyInvitation.findMany({
      where: {
        familyId,
        status: 'PENDING',
      },
      include: {
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { familyId } = await params
    const body = await request.json()
    const { email, role, invitedName, message } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    try {
      await requireFamilyCapability(familyId, 'members.manage')
    } catch (error) {
      return NextResponse.json(
        { error: 'You do not have permission to invite family members' },
        { status: 403 }
      )
    }

    // Check if user/email is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      const existingMember = await prisma.familyMember.findFirst({
        where: {
          familyId,
          userId: existingUser.id,
        },
      })

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a family member' }, { status: 400 })
      }
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.familyInvitation.findFirst({
      where: {
        familyId,
        email,
        status: 'PENDING',
      },
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 })
    }

    // Create invitation
    const invitation = await prisma.familyInvitation.create({
      data: {
        familyId,
        email,
        invitedName: invitedName || null,
        message: message || null,
        role: normalizeFamilyRole(role),
        invitedBy: (user as any).id,
      },
      include: {
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // TODO: Send email notification to invitee

    await logFamilyAuditEvent({
      familyId,
      userId: (user as any).id,
      action: 'invitation.created',
      entityType: 'family_invitation',
      entityId: invitation.id,
      metadata: {
        email,
        role: invitation.role,
      },
    })

    return NextResponse.json(invitation)
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
  }
}

