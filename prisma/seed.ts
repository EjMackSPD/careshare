import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@careshare.app' },
    update: {},
    create: {
      email: 'demo@careshare.app',
      name: 'Demo User',
      password: hashedPassword,
      role: 'FAMILY_MEMBER',
    },
  })

  console.log('✓ Demo user created:', demoUser.email)

  // Create demo family
  const demoFamily = await prisma.family.upsert({
    where: { id: 'demo-family-id' },
    update: {},
    create: {
      id: 'demo-family-id',
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

  console.log('✓ Demo family created:', demoFamily.name)

  // Add demo events
  const events = [
    {
      title: 'Doctor Appointment - Cardiology',
      description: 'Annual heart checkup with Dr. Johnson',
      type: 'APPOINTMENT',
      eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      location: 'Springfield Medical Center',
    },
    {
      title: 'Grandma Mary\'s Birthday',
      description: 'Birthday celebration at her home',
      type: 'BIRTHDAY',
      eventDate: new Date('2025-06-15'),
      location: '123 Oak Street',
    },
    {
      title: 'Weekly Grocery Delivery',
      description: 'Regular grocery delivery from Fresh Market',
      type: 'FOOD_DELIVERY',
      eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      location: 'Home delivery',
    },
    {
      title: 'Family Sunday Visit',
      description: 'Weekly family dinner and check-in',
      type: 'VISIT',
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      location: '123 Oak Street',
    },
  ]

  for (const event of events) {
    await prisma.event.create({
      data: {
        ...event,
        familyId: demoFamily.id,
      },
    })
  }

  console.log('✓ Demo events created:', events.length)

  // Add demo costs
  const costs = [
    {
      description: 'Monthly Medication Refills',
      amount: 245.50,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      splitType: 'EQUAL',
    },
    {
      description: 'Home Care Assistant (20 hours)',
      amount: 600.00,
      status: 'PAID',
      paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      splitType: 'EQUAL',
    },
    {
      description: 'Emergency Medical Alert System',
      amount: 89.99,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      splitType: 'EQUAL',
    },
    {
      description: 'Wheelchair Ramp Installation',
      amount: 1250.00,
      status: 'PAID',
      paidDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      splitType: 'EQUAL',
    },
  ]

  for (const cost of costs) {
    await prisma.cost.create({
      data: {
        ...cost,
        familyId: demoFamily.id,
      },
    })
  }

  console.log('✓ Demo costs created:', costs.length)

  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

