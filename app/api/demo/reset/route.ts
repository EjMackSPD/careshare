import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FamilyRole } from '@prisma/client'

export async function POST() {
  try {
    // Find demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@careshare.app' },
      include: {
        familyMembers: true
      }
    })

    if (!demoUser) {
      return NextResponse.json(
        { error: 'Demo user not found. Please use "Try Demo Mode" on login page first.' },
        { status: 404 }
      )
    }

    // Check if already has family
    if (demoUser.familyMembers.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Demo user already has a family',
        familyId: demoUser.familyMembers[0].familyId
      })
    }

    // Call the demo setup to create family
    const demoSetupRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/demo`, {
      method: 'POST'
    })

    if (demoSetupRes.ok) {
      return NextResponse.json({
        success: true,
        message: 'Demo family created successfully'
      })
    }

    return NextResponse.json(
      { error: 'Failed to create demo family' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Demo reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset demo' },
      { status: 500 }
    )
  }
}

