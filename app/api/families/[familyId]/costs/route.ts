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
      await requireFamilyCapability(familyId, 'bills.read')
    } catch {
      return NextResponse.json(
        { error: 'Not a member of this family' },
        { status: 403 }
      )
    }

    const costs = await prisma.cost.findMany({
      where: {
        familyId,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(costs)
  } catch (error) {
    console.error('Get costs error:', error)
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
    const { description, amount, status, dueDate, assignedTo, paidBy, receiptUrl, fileName } = body

    if (!description || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      await requireFamilyCapability(familyId, 'bills.write')
    } catch {
      return NextResponse.json(
        { error: 'Not a member of this family' },
        { status: 403 }
      )
    }

    const cost = await prisma.cost.create({
      data: {
        familyId,
        description,
        amount: parseFloat(amount),
        status: status || 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
        // Who fronted the money — defaults to the person logging it (for balances).
        paidBy: paidBy || (user as { id: string }).id,
        receiptUrl: receiptUrl || null,
        fileName: fileName || null,
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

    return NextResponse.json(cost, { status: 201 })
  } catch (error) {
    console.error('Create cost error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

