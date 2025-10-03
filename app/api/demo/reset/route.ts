import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { EventType, CostStatus, FamilyRole, TaskPriority, TaskStatus } from '@prisma/client'

export async function POST() {
  try {
    const user = await getCurrentUser()
    
    if (!user || (user as any).email !== 'demo@careshare.app') {
      return NextResponse.json(
        { error: 'Only demo user can reset demo data' },
        { status: 403 }
      )
    }

    console.log('Resetting demo data for user:', (user as any).email)

    // Delete existing demo family data (cascade will delete events, costs, tasks, messages, etc.)
    const existingFamilies = await prisma.familyMember.findMany({
      where: { userId: (user as any).id },
      include: { family: true }
    })

    for (const fm of existingFamilies) {
      console.log('Deleting family:', fm.family.name)
      await prisma.family.delete({
        where: { id: fm.familyId }
      })
    }

    // Find or create additional family members
    let sarahUser = await prisma.user.upsert({
      where: { email: 'sarah.smith@example.com' },
      update: {},
      create: {
        email: 'sarah.smith@example.com',
        name: 'Sarah Smith',
        password: await require('bcryptjs').hash('demo123', 10),
        role: 'FAMILY_MEMBER',
      },
    })

    let michaelUser = await prisma.user.upsert({
      where: { email: 'michael.smith@example.com' },
      update: {},
      create: {
        email: 'michael.smith@example.com',
        name: 'Michael Smith',
        password: await require('bcryptjs').hash('demo123', 10),
        role: 'FAMILY_MEMBER',
      },
    })

    let emilyUser = await prisma.user.upsert({
      where: { email: 'emily.smith@example.com' },
      update: {},
      create: {
        email: 'emily.smith@example.com',
        name: 'Emily Smith',
        password: await require('bcryptjs').hash('demo123', 10),
        role: 'FAMILY_MEMBER',
      },
    })

    // Create demo family with all members
    const demoFamily = await prisma.family.create({
      data: {
        name: 'Smith Family Care Group',
        elderName: 'Mary Smith',
        elderPhone: '(555) 123-4567',
        elderAddress: '123 Oak Street, Springfield, IL 62701',
        elderBirthday: new Date('1945-06-15'),
        emergencyContact: 'Dr. Johnson - (555) 987-6543',
        medicalNotes: 'Allergic to penicillin. Takes blood pressure medication daily at 8 AM.',
        description: 'Coordinating care for Mom who lives independently.',
        createdBy: (user as any).id,
        members: {
          create: [
            { userId: (user as any).id, role: FamilyRole.CARE_MANAGER },
            { userId: sarahUser.id, role: FamilyRole.FAMILY_MEMBER },
            { userId: michaelUser.id, role: FamilyRole.FAMILY_MEMBER },
            { userId: emilyUser.id, role: FamilyRole.FAMILY_MEMBER },
          ],
        },
      },
    })

    console.log('✓ Demo family created')

    // Create sample events
    const today = new Date()
    await prisma.event.createMany({
      data: [
        {
          familyId: demoFamily.id,
          title: 'Doctor Appointment - Cardiology',
          description: 'Annual heart checkup with Dr. Johnson',
          type: EventType.APPOINTMENT,
          eventDate: new Date(today.getFullYear(), today.getMonth(), 5),
          location: 'Springfield Medical Center',
        },
        {
          familyId: demoFamily.id,
          title: 'Weekly Grocery Delivery',
          description: 'Regular grocery delivery from Fresh Market',
          type: EventType.FOOD_DELIVERY,
          eventDate: new Date(today.getFullYear(), today.getMonth(), 10),
          location: 'Home delivery',
        },
        {
          familyId: demoFamily.id,
          title: 'Family Sunday Visit',
          description: 'Weekly family dinner and check-in',
          type: EventType.VISIT,
          eventDate: new Date(today.getFullYear(), today.getMonth(), 15),
          location: '123 Oak Street',
        },
        {
          familyId: demoFamily.id,
          title: 'Medication Review',
          description: 'Monthly medication review with pharmacist',
          type: EventType.APPOINTMENT,
          eventDate: new Date(today.getFullYear(), today.getMonth(), 20),
          location: 'Springfield Pharmacy',
        },
      ],
    })

    console.log('✓ Sample events created')

    // Create sample costs
    await prisma.cost.createMany({
      data: [
        {
          familyId: demoFamily.id,
          description: 'Monthly Medication Refills',
          amount: 245.50,
          status: CostStatus.PENDING,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          splitType: 'EQUAL',
        },
        {
          familyId: demoFamily.id,
          description: 'Home Care Assistant (20 hours)',
          amount: 600.00,
          status: CostStatus.PAID,
          paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          splitType: 'EQUAL',
        },
      ],
    })

    console.log('✓ Sample costs created')

    // Create sample tasks with assignments
    const task1 = await prisma.task.create({
      data: {
        familyId: demoFamily.id,
        title: 'Schedule annual physical exam',
        description: 'Call Dr. Johnson\'s office to schedule yearly checkup',
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignments: {
          create: [{ userId: sarahUser.id }]
        }
      },
    })

    const task2 = await prisma.task.create({
      data: {
        familyId: demoFamily.id,
        title: 'Pick up prescription refills',
        description: 'Collect monthly medications from Springfield Pharmacy',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        assignments: {
          create: [{ userId: michaelUser.id }]
        }
      },
    })

    const task3 = await prisma.task.create({
      data: {
        familyId: demoFamily.id,
        title: 'Organize weekly meal prep',
        description: 'Plan and prepare meals for the week',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        assignments: {
          create: [{ userId: emilyUser.id }]
        }
      },
    })

    console.log('✓ Sample tasks created')

    // Create sample messages
    await prisma.message.createMany({
      data: [
        {
          familyId: demoFamily.id,
          userId: (user as any).id,
          message: 'Hi everyone! I set up this family group for coordinating Mom\'s care. Looking forward to working together!',
        },
        {
          familyId: demoFamily.id,
          userId: sarahUser.id,
          message: 'Thanks for setting this up! This will make coordination so much easier.',
        },
        {
          familyId: demoFamily.id,
          userId: michaelUser.id,
          message: 'Great idea! I can help with transportation to appointments.',
        },
      ],
    })

    console.log('✓ Sample messages created')
    console.log('✅ Demo data reset complete!')

    return NextResponse.json({ 
      success: true,
      message: 'Demo data has been reset successfully!'
    })
  } catch (error) {
    console.error('Error resetting demo data:', error)
    return NextResponse.json(
      { error: 'Failed to reset demo data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
