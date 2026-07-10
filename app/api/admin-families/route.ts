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

    const adminFamilies = await prisma.adminFamily.findMany({
      where: {
        adminId: (user as any).id,
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
            careRecipient: true,
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
    })

    const families = adminFamilies.map((adminFamily) => adminFamily.family)

    return NextResponse.json(families)
  } catch (error) {
    console.error('Get admin families error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
