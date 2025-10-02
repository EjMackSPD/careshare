import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { EventType, CostStatus, FamilyRole, TaskPriority, TaskStatus, StoryCategory, MedicationFrequency } from '@prisma/client'

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

      // Create additional family members
      const sarahUser = await prisma.user.create({
        data: {
          email: 'sarah.smith@example.com',
          name: 'Sarah Smith',
          password: await bcrypt.hash('demo123', 10),
          role: 'FAMILY_MEMBER',
        },
      })

      const michaelUser = await prisma.user.create({
        data: {
          email: 'michael.smith@example.com',
          name: 'Michael Smith',
          password: await bcrypt.hash('demo123', 10),
          role: 'FAMILY_MEMBER',
        },
      })

      const emilyUser = await prisma.user.create({
        data: {
          email: 'emily.smith@example.com',
          name: 'Emily Smith',
          password: await bcrypt.hash('demo123', 10),
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
          medicalNotes: 'Allergic to penicillin. Takes blood pressure medication daily at 8 AM. History of hypertension. Prefers morning appointments.',
          description: 'Coordinating care for Mom who lives independently but needs regular check-ins and help with appointments.',
          createdBy: demoUser.id,
          members: {
            create: [
              {
                userId: demoUser.id,
                role: FamilyRole.CARE_MANAGER, // Demo user is Care Manager
              },
              {
                userId: sarahUser.id,
                role: FamilyRole.FAMILY_MEMBER,
              },
              {
                userId: michaelUser.id,
                role: FamilyRole.FAMILY_MEMBER,
              },
              {
                userId: emilyUser.id,
                role: FamilyRole.FAMILY_MEMBER,
              },
            ],
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

      // Create sample tasks
      const tasks = [
        {
          title: 'Pick up prescription refills',
          description: 'Get monthly blood pressure medication from CVS Pharmacy',
          priority: TaskPriority.HIGH,
          status: TaskStatus.TODO,
          assignedTo: sarahUser.id,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          familyId: demoFamily.id,
        },
        {
          title: 'Schedule dentist appointment',
          description: 'Book 6-month cleaning with Dr. Williams',
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.TODO,
          assignedTo: demoUser.id,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          familyId: demoFamily.id,
        },
        {
          title: 'Weekly grocery shopping',
          description: 'Get groceries including fresh fruits and vegetables',
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.IN_PROGRESS,
          assignedTo: michaelUser.id,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          familyId: demoFamily.id,
        },
        {
          title: 'Fix leaking kitchen faucet',
          description: 'Call plumber or attempt DIY repair',
          priority: TaskPriority.LOW,
          status: TaskStatus.TODO,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          familyId: demoFamily.id,
        },
      ]

      await prisma.task.createMany({ data: tasks })

      // Create sample messages
      const messages = [
        {
          familyId: demoFamily.id,
          userId: sarahUser.id,
          message: 'Hi everyone! Just wanted to check in. Mom mentioned she needs help with her prescription pickup this week. I can grab it on Thursday if that works?',
        },
        {
          familyId: demoFamily.id,
          userId: michaelUser.id,
          message: 'Thanks Sarah! Thursday works great. I can handle the grocery shopping tomorrow. Does anyone have the shopping list?',
        },
        {
          familyId: demoFamily.id,
          userId: demoUser.id,
          message: 'Perfect! I\'ll update the shopping list in the app. Also, don\'t forget Mom has her cardiology appointment next week on Tuesday at 10 AM.',
        },
        {
          familyId: demoFamily.id,
          userId: emilyUser.id,
          message: 'I can take her to the doctor appointment! I\'ll pick her up at 9:30 AM to make sure we\'re on time.',
        },
      ]

      await prisma.message.createMany({ data: messages })

      // Create sample life stories
      const lifeStories = [
        {
          familyId: demoFamily.id,
          userId: demoUser.id,
          title: 'The Day Mom Taught Me to Bake',
          content: 'I remember being 8 years old, standing on a stool in our kitchen while Mom taught me her secret apple pie recipe. She was so patient, letting me measure the ingredients even though I made a mess. "Cooking is about love," she would say. That pie recipe has been passed down for three generations now, and every time I bake it, I think of her warm smile and the smell of cinnamon filling our home.',
          category: StoryCategory.FAMILY,
          year: 1985,
          tags: 'baking, family traditions, childhood',
        },
        {
          familyId: demoFamily.id,
          userId: sarahUser.id,
          title: 'Mom\'s Career as a Teacher',
          content: 'For 35 years, Mom dedicated her life to teaching third grade at Lincoln Elementary. She touched thousands of lives and still gets letters from former students. I remember the pride in her eyes when she received the Teacher of the Year award in 1998. She always said, "Every child deserves to feel special and capable." Her passion for education inspired me to become a teacher too.',
          category: StoryCategory.CAREER,
          year: 1970,
          tags: 'teaching, education, inspiration',
        },
        {
          familyId: demoFamily.id,
          userId: michaelUser.id,
          title: 'Grandma\'s Words of Wisdom',
          content: 'When I was going through a tough time in college, Grandma sat me down and shared her philosophy: "Life isn\'t about waiting for the storm to pass, it\'s about learning to dance in the rain." Those words have guided me through every challenge since. She has an incredible way of making complex things simple and filling you with hope.',
          category: StoryCategory.LIFE_WISDOM,
          year: 2015,
          tags: 'wisdom, life lessons, inspiration',
        },
      ]

      await prisma.lifeStory.createMany({ data: lifeStories })

      // Create sample medications
      const medications = [
        {
          familyId: demoFamily.id,
          userId: demoUser.id,
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: MedicationFrequency.ONCE_DAILY,
          timeOfDay: '8:00 AM',
          instructions: 'Take with water in the morning',
          prescribedBy: 'Dr. Johnson',
          startDate: new Date('2023-01-15'),
          refillDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          pharmacy: 'CVS Pharmacy',
          notes: 'For blood pressure management',
          active: true,
        },
        {
          familyId: demoFamily.id,
          userId: demoUser.id,
          name: 'Vitamin D3',
          dosage: '2000 IU',
          frequency: MedicationFrequency.ONCE_DAILY,
          timeOfDay: '8:00 AM',
          instructions: 'Take with breakfast',
          startDate: new Date('2023-03-01'),
          pharmacy: 'CVS Pharmacy',
          active: true,
        },
        {
          familyId: demoFamily.id,
          userId: demoUser.id,
          name: 'Aspirin',
          dosage: '81mg',
          frequency: MedicationFrequency.ONCE_DAILY,
          timeOfDay: '8:00 AM',
          instructions: 'Take with food',
          prescribedBy: 'Dr. Johnson',
          startDate: new Date('2022-06-01'),
          pharmacy: 'CVS Pharmacy',
          notes: 'Low-dose for heart health',
          active: true,
        },
      ]

      await prisma.medication.createMany({ data: medications })

      // Create sample notes
      const notes = [
        {
          familyId: demoFamily.id,
          userId: demoUser.id,
          title: 'Blood Pressure Reading',
          content: 'Mom\'s blood pressure was 128/82 this morning. Within normal range. She mentioned feeling good and energetic today.',
          category: 'health',
        },
        {
          familyId: demoFamily.id,
          userId: sarahUser.id,
          content: 'Noticed Mom was a bit forgetful today about taking her afternoon vitamin. Set up a phone reminder for 2 PM daily.',
          category: 'observation',
        },
        {
          familyId: demoFamily.id,
          userId: michaelUser.id,
          title: 'Mobility Update',
          content: 'Mom walked around the block today without her cane! She seemed really proud. Physical therapy is definitely working.',
          category: 'care',
        },
        {
          familyId: demoFamily.id,
          userId: emilyUser.id,
          content: 'Attended doctor appointment today. Dr. Johnson says everything looks great. Next checkup in 6 months.',
          category: 'health',
        },
      ]

      await prisma.note.createMany({ data: notes })

      console.log('✓ Demo data created successfully')
      console.log('  - Family: Smith Family Care Group')
      console.log('  - Members: 4 (1 Care Manager + 3 Family Members)')
      console.log('  - Events: 3')
      console.log('  - Costs: 3')
      console.log('  - Tasks: 4')
      console.log('  - Messages: 4')
      console.log('  - Life Stories: 3')
      console.log('  - Medications: 3')
      console.log('  - Notes: 4')
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

