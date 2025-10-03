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

    // Create comprehensive sample resources
    await prisma.resource.createMany({
      data: [
        // Healthcare Resources
        {
          familyId: demoFamily.id,
          title: 'Medicare Benefits Guide',
          description: 'Comprehensive guide to understanding Medicare coverage, enrollment periods, and benefits for seniors.',
          category: 'Healthcare',
          url: 'https://www.medicare.gov'
        },
        {
          familyId: demoFamily.id,
          title: 'Local Home Health Care Agency',
          description: 'Professional in-home care services including nursing, therapy, and personal care assistance.',
          category: 'Healthcare',
          url: 'https://www.aarp.org/caregiving'
        },
        {
          familyId: demoFamily.id,
          title: 'Medication Management Services',
          description: 'Help with organizing medications, setting up pill boxes, and coordinating with pharmacies.',
          category: 'Healthcare',
          url: 'https://www.medicare.gov/drug-coverage-part-d'
        },
        {
          familyId: demoFamily.id,
          title: 'Telehealth Services for Seniors',
          description: 'Virtual doctor visits and medical consultations from the comfort of home.',
          category: 'Healthcare',
          url: 'https://www.medicare.gov/coverage/telehealth'
        },
        {
          familyId: demoFamily.id,
          title: 'Memory Care Support Group',
          description: 'Weekly support group for families dealing with dementia and Alzheimer\'s disease.',
          category: 'Healthcare',
          url: 'https://www.alz.org'
        },

        // Nutrition Resources
        {
          familyId: demoFamily.id,
          title: 'Meals on Wheels America',
          description: 'Nutritious meal delivery service for homebound seniors across the United States.',
          category: 'Nutrition',
          url: 'https://www.mealsonwheelsamerica.org'
        },
        {
          familyId: demoFamily.id,
          title: 'Senior Grocery Delivery Services',
          description: 'Local grocery stores offering delivery and shopping assistance for elderly residents.',
          category: 'Nutrition',
          url: 'https://www.instacart.com'
        },
        {
          familyId: demoFamily.id,
          title: 'Nutrition Counseling for Seniors',
          description: 'Registered dietitians specializing in senior nutrition and dietary planning.',
          category: 'Nutrition',
          url: 'https://www.eatright.org'
        },
        {
          familyId: demoFamily.id,
          title: 'Diabetic Meal Planning Guide',
          description: 'Resources for managing diabetes through proper nutrition and meal planning.',
          category: 'Nutrition',
          url: 'https://www.diabetes.org'
        },

        // Social Resources
        {
          familyId: demoFamily.id,
          title: 'Community Senior Center Programs',
          description: 'Social activities, exercise classes, and community events for active seniors.',
          category: 'Social',
          url: 'https://www.ncoa.org'
        },
        {
          familyId: demoFamily.id,
          title: 'Senior Companionship Services',
          description: 'Professional companions providing social interaction and light assistance.',
          category: 'Social',
          url: 'https://www.visitingangels.com'
        },
        {
          familyId: demoFamily.id,
          title: 'Online Senior Social Networks',
          description: 'Digital communities connecting seniors with similar interests and hobbies.',
          category: 'Social',
          url: 'https://www.stitch.net'
        },
        {
          familyId: demoFamily.id,
          title: 'Volunteer Visitor Programs',
          description: 'Local volunteers providing regular visits and social support to isolated seniors.',
          category: 'Social',
          url: 'https://www.mealsonwheelsamerica.org/get-involved/volunteer'
        },

        // Transportation Resources
        {
          familyId: demoFamily.id,
          title: 'Senior Transportation Services',
          description: 'Door-to-door transportation for medical appointments, shopping, and social activities.',
          category: 'Transportation',
          url: 'https://www.eldercare.acl.gov'
        },
        {
          familyId: demoFamily.id,
          title: 'Paratransit Services',
          description: 'Accessible transportation options for seniors with mobility challenges.',
          category: 'Transportation',
          url: 'https://www.transit.dot.gov'
        },
        {
          familyId: demoFamily.id,
          title: 'Volunteer Driver Programs',
          description: 'Community volunteers providing free or low-cost rides to medical appointments.',
          category: 'Transportation',
          url: 'https://www.iancompanions.org'
        },

        // Housing Resources
        {
          familyId: demoFamily.id,
          title: 'Assisted Living Facility Finder',
          description: 'Search and compare assisted living communities in your area.',
          category: 'Housing',
          url: 'https://www.caring.com'
        },
        {
          familyId: demoFamily.id,
          title: 'Home Modification Grants',
          description: 'Financial assistance programs for making homes safer and more accessible.',
          category: 'Housing',
          url: 'https://www.hud.gov'
        },
        {
          familyId: demoFamily.id,
          title: 'Senior Housing Options Guide',
          description: 'Comprehensive guide to independent living, assisted living, and memory care options.',
          category: 'Housing',
          url: 'https://www.seniorliving.org'
        },
        {
          familyId: demoFamily.id,
          title: 'Emergency Home Repair Services',
          description: 'Programs providing emergency home repairs for low-income seniors.',
          category: 'Housing',
          url: 'https://www.rebuildingtogether.org'
        },

        // Legal Resources
        {
          familyId: demoFamily.id,
          title: 'Legal Aid for Seniors',
          description: 'Free or low-cost legal assistance for seniors on issues like estate planning and benefits.',
          category: 'Legal',
          url: 'https://www.justiceinaging.org'
        },
        {
          familyId: demoFamily.id,
          title: 'Power of Attorney Information',
          description: 'Resources for understanding and setting up healthcare and financial powers of attorney.',
          category: 'Legal',
          url: 'https://www.nolo.com'
        },
        {
          familyId: demoFamily.id,
          title: 'Elder Law Attorneys Directory',
          description: 'Find qualified elder law attorneys in your area specializing in senior legal issues.',
          category: 'Legal',
          url: 'https://www.naela.org'
        },
        {
          familyId: demoFamily.id,
          title: 'Living Will and Advance Directives',
          description: 'Templates and guidance for creating living wills and healthcare directives.',
          category: 'Legal',
          url: 'https://www.caringinfo.org'
        },

        // Financial Resources
        {
          familyId: demoFamily.id,
          title: 'Social Security Benefits Calculator',
          description: 'Estimate retirement, disability, and survivor benefits.',
          category: 'Financial',
          url: 'https://www.ssa.gov'
        },
        {
          familyId: demoFamily.id,
          title: 'Medicaid Eligibility Guide',
          description: 'Information on Medicaid eligibility, application process, and long-term care coverage.',
          category: 'Financial',
          url: 'https://www.medicaid.gov'
        },
        {
          familyId: demoFamily.id,
          title: 'Prescription Drug Assistance Programs',
          description: 'Programs helping seniors afford necessary medications when insurance isn\'t enough.',
          category: 'Financial',
          url: 'https://www.needymeds.org'
        },
        {
          familyId: demoFamily.id,
          title: 'Senior Financial Counseling',
          description: 'Free financial counseling services for seniors managing budgets and debt.',
          category: 'Financial',
          url: 'https://www.ncoa.org/economic-security/benefits'
        },
        {
          familyId: demoFamily.id,
          title: 'Veterans Benefits for Seniors',
          description: 'Information on VA benefits, pension programs, and healthcare for veteran seniors.',
          category: 'Financial',
          url: 'https://www.va.gov'
        }
      ]
    })

    console.log('✓ Sample resources created (30 resources)')
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
