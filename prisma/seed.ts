import {
  PrismaClient,
  EventType,
  CostStatus,
  FamilyRole,
  DocumentCategory,
  CareLevel,
  ScenarioType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@careshare.app" },
    update: {},
    create: {
      email: "demo@careshare.app",
      name: "Demo User",
      password: hashedPassword,
      role: "FAMILY_MEMBER",
    },
  });

  console.log("✓ Demo user created:", demoUser.email);

  // Create demo family
  const demoFamily = await prisma.family.upsert({
    where: { id: "demo-family-id" },
    update: {},
    create: {
      id: "demo-family-id",
      name: "Smith Family Care Group",
      elderName: "Grandma Mary Smith",
      elderPhone: "(555) 123-4567",
      elderAddress: "123 Oak Street, Springfield, IL 62701",
      elderBirthday: new Date("1945-06-15"),
      emergencyContact: "Dr. Johnson - (555) 987-6543",
      medicalNotes:
        "Allergic to penicillin. Takes blood pressure medication daily at 8 AM.",
      description:
        "Coordinating care for Mom who lives independently but needs regular check-ins and help with appointments.",
      createdBy: demoUser.id,
      members: {
        create: {
          userId: demoUser.id,
          role: FamilyRole.CARE_MANAGER,
        },
      },
    },
  });

  console.log("✓ Demo family created:", demoFamily.name);

  // Add demo events
  const events = [
    {
      title: "Doctor Appointment - Cardiology",
      description: "Annual heart checkup with Dr. Johnson",
      type: EventType.APPOINTMENT,
      eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      location: "Springfield Medical Center",
    },
    {
      title: "Grandma Mary's Birthday",
      description: "Birthday celebration at her home",
      type: EventType.BIRTHDAY,
      eventDate: new Date("2025-06-15"),
      location: "123 Oak Street",
    },
    {
      title: "Weekly Grocery Delivery",
      description: "Regular grocery delivery from Fresh Market",
      type: EventType.FOOD_DELIVERY,
      eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      location: "Home delivery",
    },
    {
      title: "Family Sunday Visit",
      description: "Weekly family dinner and check-in",
      type: EventType.VISIT,
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      location: "123 Oak Street",
    },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: {
        ...event,
        familyId: demoFamily.id,
      },
    });
  }

  console.log("✓ Demo events created:", events.length);

  // Add demo costs
  const costs = [
    {
      description: "Monthly Medication Refills",
      amount: 245.5,
      status: CostStatus.PENDING,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      splitType: "EQUAL",
    },
    {
      description: "Home Care Assistant (20 hours)",
      amount: 600.0,
      status: CostStatus.PAID,
      paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      splitType: "EQUAL",
    },
    {
      description: "Emergency Medical Alert System",
      amount: 89.99,
      status: CostStatus.PENDING,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      splitType: "EQUAL",
    },
    {
      description: "Wheelchair Ramp Installation",
      amount: 1250.0,
      status: CostStatus.PAID,
      paidDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      splitType: "EQUAL",
    },
  ];

  for (const cost of costs) {
    await prisma.cost.create({
      data: {
        ...cost,
        familyId: demoFamily.id,
      },
    });
  }

  console.log("✓ Demo costs created:", costs.length);

  // Add demo documents
  const documents = [
    // Medical Documents
    {
      name: "Medical History Summary",
      category: DocumentCategory.MEDICAL,
      notes:
        "Comprehensive medical history including past surgeries and conditions",
      uploadedBy: demoUser.id,
    },
    {
      name: "Current Medications List",
      category: DocumentCategory.MEDICAL,
      notes: "Updated list of all current medications with dosages",
      uploadedBy: demoUser.id,
    },
    {
      name: "Allergy Information",
      category: DocumentCategory.MEDICAL,
      notes: "Known allergies: Penicillin, shellfish",
      uploadedBy: demoUser.id,
    },
    {
      name: "Recent Lab Results",
      category: DocumentCategory.MEDICAL,
      notes: "Blood work from October 2024 checkup",
      uploadedBy: demoUser.id,
    },
    // Legal Documents
    {
      name: "Healthcare Power of Attorney",
      category: DocumentCategory.LEGAL,
      notes: "Designates John Smith as healthcare proxy",
      uploadedBy: demoUser.id,
    },
    {
      name: "Living Will",
      category: DocumentCategory.LEGAL,
      notes: "Advance directive specifying end-of-life care preferences",
      uploadedBy: demoUser.id,
    },
    {
      name: "DNR Order",
      category: DocumentCategory.LEGAL,
      notes: "Do Not Resuscitate order on file with physician",
      uploadedBy: demoUser.id,
    },
    // Insurance Documents
    {
      name: "Medicare Card (Copy)",
      category: DocumentCategory.INSURANCE,
      notes: "Medicare Part A & B card copy",
      uploadedBy: demoUser.id,
    },
    {
      name: "Supplemental Insurance Policy",
      category: DocumentCategory.INSURANCE,
      notes: "Medigap Plan G policy documents",
      uploadedBy: demoUser.id,
    },
    {
      name: "Prescription Drug Plan Card",
      category: DocumentCategory.INSURANCE,
      notes: "Part D prescription coverage information",
      uploadedBy: demoUser.id,
    },
    // Financial Documents
    {
      name: "Social Security Information",
      category: DocumentCategory.FINANCIAL,
      notes: "Social Security benefit statement",
      uploadedBy: demoUser.id,
    },
    {
      name: "Bank Account Details",
      category: DocumentCategory.FINANCIAL,
      notes: "Primary checking and savings account information",
      uploadedBy: demoUser.id,
    },
  ];

  for (const document of documents) {
    await prisma.document.create({
      data: {
        ...document,
        familyId: demoFamily.id,
      },
    });
  }

  console.log("✓ Demo documents created:", documents.length);

  // Add demo care plan
  const carePlan = await prisma.carePlan.upsert({
    where: { familyId: demoFamily.id },
    update: {},
    create: {
      familyId: demoFamily.id,
      careLevel: CareLevel.MODERATE,
      careLevelDescription:
        "Needs help with some daily activities, medication management, and transportation.",
      estimatedCostMin: 2200,
      estimatedCostMax: 2600,
      careNotes:
        "Martha requires regular assistance with daily activities, medication management, and transportation to medical appointments. We're looking into part-time in-home care services to supplement family support.",
    },
  });

  console.log("✓ Demo care plan created");

  // Add demo care scenarios
  const scenarios = [
    {
      type: ScenarioType.MEDICAL_EMERGENCY,
      title: "Medical Emergency",
      icon: "🚨",
      content: JSON.stringify({
        primaryContact: "Dr. Sarah Johnson - (555) 987-6543",
        hospitalPreference: "Springfield Medical Center",
        familyContactOrder:
          "1. John (Son) - (555) 123-4567\n2. Sarah (Daughter) - (555) 234-5678",
      }),
    },
    {
      type: ScenarioType.HOSPITALIZATION,
      title: "Hospitalization",
      icon: "🏥",
      content: JSON.stringify({
        careCoordinator: "John Johnson (Primary)",
        homeCare: "Pet care needed - Contact neighbor Mary",
        insuranceInfo: "Medicare + Supplemental (Card on file)",
      }),
    },
    {
      type: ScenarioType.INCREASED_CARE,
      title: "Increased Care Needs",
      icon: "📈",
      content: JSON.stringify({
        triggerPoints:
          "• Multiple falls in 30 days\n• Confusion or memory issues\n• Unable to manage medications",
        nextSteps:
          "1. Family meeting to discuss options\n2. Consult with home health agency\n3. Consider assisted living facilities",
      }),
    },
    {
      type: ScenarioType.ASSISTED_LIVING,
      title: "Transition to Assisted Living",
      icon: "🏠",
      content: JSON.stringify({
        preferredFacilities:
          "1. Sunshine Senior Living\n2. Maple Grove Community\n3. Heritage Assisted Living",
        budgetAllocation: "$4,500/month from estate + family contributions",
      }),
    },
    {
      type: ScenarioType.END_OF_LIFE,
      title: "End of Life Preferences",
      icon: "🕊️",
      content: JSON.stringify({
        dnrStatus: "Yes - Document on file",
        hospicePreference: "Home hospice with family present",
        funeralArrangements:
          "Pre-planned with Springfield Funeral Home\nContact: (555) 789-0123",
        familyWishes:
          "Memorial service at St. Mary's Church\nCremation with ashes spread at the family cabin",
      }),
    },
  ];

  for (const scenario of scenarios) {
    await prisma.careScenario.create({
      data: {
        ...scenario,
        familyId: demoFamily.id,
      },
    });
  }

  console.log("✓ Demo care scenarios created:", scenarios.length);

  // Add demo family contributions
  const contributions = [
    {
      memberName: "John Johnson",
      amount: 650.0,
      percentage: 33,
      color: "#6366f1",
      initial: "JJ",
    },
    {
      memberName: "Sarah Miller",
      amount: 600.0,
      percentage: 30,
      color: "#8b5cf6",
      initial: "SM",
    },
    {
      memberName: "Robert James",
      amount: 550.0,
      percentage: 28,
      color: "#10b981",
      initial: "RJ",
    },
    {
      memberName: "Mary Williams",
      amount: 200.0,
      percentage: 9,
      color: "#f59e0b",
      initial: "MW",
    },
  ];

  for (const contribution of contributions) {
    await prisma.familyContribution.create({
      data: {
        ...contribution,
        familyId: demoFamily.id,
      },
    });
  }

  console.log("✓ Demo family contributions created:", contributions.length);

  console.log("✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
