import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { EventType, CostStatus } from '@prisma/client'

export async function POST() {
  try {
    // Check if demo user exists, create if not
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@careshare.app' },
    })

    if (!demoUser) {
      console.log('Creating demo user...')
      const hashedPassword = await bcrypt.hash('demo123', 10)
      
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@careshare.app',
          name: 'Demo User',
          password: hashedPassword,
          role: 'FAMILY_MEMBER',
        },
      })

      // Create demo family
      const demoFamily = await prisma.family.create({
        data: {
          name: 'Smith Family Care Group',
          elderName: 'Grandma Mary Smith',
          elderPhone: '(555) 123-4567',
          elderAddress: '123 Oak Street, Springfield, IL 62701',
          elderBirthday: new Date('1945-06-15'),
          emergencyContact: 'Dr. Johnson - (555) 987-6543',
          medicalNotes: 'Allergic to penicillin. Takes blood pressure medication daily at 8 AM.',
          description: 'Coordinating care for Mom who lives independently but needs regular check-ins and help with appointments.',
          createdBy: demoUser.id,
          members: {
            create: {
              userId: demoUser.id,
              role: 'organizer',
            },
          },
        },
      })

      // Create sample events
      const events = [
        {
          title: 'Doctor Appointment - Cardiology',
          description: 'Annual heart checkup with Dr. Johnson',
          type: EventType.APPOINTMENT,
          eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          location: 'Springfield Medical Center',
          familyId: demoFamily.id,
        },
        {
          title: 'Grandma Mary\'s Birthday',
          description: 'Birthday celebration at her home',
          type: EventType.BIRTHDAY,
          eventDate: new Date('2025-06-15'),
          location: '123 Oak Street',
          familyId: demoFamily.id,
        },
        {
          title: 'Weekly Grocery Delivery',
          description: 'Regular grocery delivery from Fresh Market',
          type: EventType.FOOD_DELIVERY,
          eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          location: 'Home delivery',
          familyId: demoFamily.id,
        },
      ]

      await prisma.event.createMany({ data: events })

      // Create sample costs
      const costs = [
        {
          description: 'Monthly Medication Refills',
          amount: 245.50,
          status: CostStatus.PENDING,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          splitType: 'EQUAL',
          familyId: demoFamily.id,
        },
        {
          description: 'Home Care Assistant (20 hours)',
          amount: 600.00,
          status: CostStatus.PAID,
          paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          splitType: 'EQUAL',
          familyId: demoFamily.id,
        },
        {
          description: 'Emergency Medical Alert System',
          amount: 89.99,
          status: CostStatus.PENDING,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          splitType: 'EQUAL',
          familyId: demoFamily.id,
        },
      ]

      await prisma.cost.createMany({ data: costs })

      console.log('✓ Demo data created successfully')
    }

    return NextResponse.json({
      success: true,
      email: 'demo@careshare.app',
      password: 'demo123',
    })
  } catch (error) {
    console.error('Demo setup error:', error)
    return NextResponse.json(
      { error: 'Failed to set up demo' },
      { status: 500 }
    )
  }
}

