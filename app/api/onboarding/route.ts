import { NextRequest, NextResponse } from "next/server"
import {
  FamilyRole,
  InvitationStatus,
  OnboardingStatus,
  Prisma,
} from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  logFamilyAuditEvent,
  requireAuth,
} from "@/lib/auth-utils"
import { normalizeFamilyRole } from "@/lib/family-permissions"

type InviteInput = {
  email: string
  name?: string
  role?: string
}

type OnboardingPayload = {
  accountType?: "PRIMARY_CAREGIVER"
  currentStep?: number
  workspaceName?: string
  workspaceDescription?: string
  caregiverRelationship?: string
  careRecipient?: {
    name?: string
    preferredName?: string
    phone?: string
    address?: string
    birthDate?: string | null
    medicalNotes?: string
    conditions?: string[]
  }
  invites?: InviteInput[]
  topNeeds?: string[]
  notificationPreferences?: Prisma.JsonObject
}

function sanitizePayload(body: OnboardingPayload) {
  return {
    accountType: body.accountType ?? "PRIMARY_CAREGIVER",
    currentStep: body.currentStep ?? 1,
    workspaceName: body.workspaceName ?? "",
    workspaceDescription: body.workspaceDescription ?? "",
    caregiverRelationship: body.caregiverRelationship ?? "",
    careRecipient: {
      name: body.careRecipient?.name ?? "",
      preferredName: body.careRecipient?.preferredName ?? "",
      phone: body.careRecipient?.phone ?? "",
      address: body.careRecipient?.address ?? "",
      birthDate: body.careRecipient?.birthDate ?? null,
      medicalNotes: body.careRecipient?.medicalNotes ?? "",
      conditions: body.careRecipient?.conditions ?? [],
    },
    invites: (body.invites ?? [])
      .filter((invite) => invite.email?.trim())
      .map((invite) => ({
        email: invite.email.trim().toLowerCase(),
        name: invite.name?.trim() ?? "",
        role: normalizeFamilyRole(invite.role),
      })),
    topNeeds: (body.topNeeds ?? []).filter(Boolean),
    notificationPreferences: body.notificationPreferences ?? {},
  }
}

async function getExistingFamily(userId: string) {
  const membership = await prisma.familyMember.findFirst({
    where: { userId },
    include: {
      family: {
        include: {
          careRecipient: true,
        },
      },
    },
  })

  return membership?.family ?? null
}

export async function GET() {
  try {
    const user = await requireAuth()
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        onboardingStatus: true,
        onboardingStep: true,
        onboardingData: true,
      },
    })
    const family = await getExistingFamily(user.id)

    return NextResponse.json({
      onboardingStatus: dbUser?.onboardingStatus ?? user.onboardingStatus,
      onboardingStep: dbUser?.onboardingStep ?? user.onboardingStep,
      hasCompletedOnboarding:
        (dbUser?.onboardingStatus ?? user.onboardingStatus) ===
        OnboardingStatus.COMPLETED,
      familyId: family?.id ?? null,
      data: dbUser?.onboardingData ?? null,
      family,
    })
  } catch (error) {
    console.error("Error checking onboarding status:", error)
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = sanitizePayload(await request.json())

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingStatus: OnboardingStatus.IN_PROGRESS,
        onboardingStep: body.currentStep,
        onboardingData: body as Prisma.InputJsonValue,
      },
      select: {
        onboardingStatus: true,
        onboardingStep: true,
        onboardingData: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error saving onboarding draft:", error)
    return NextResponse.json(
      { error: "Failed to save onboarding draft" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = sanitizePayload(await request.json())

    if (!body.workspaceName.trim()) {
      return NextResponse.json(
        { error: "Family workspace name is required" },
        { status: 400 }
      )
    }

    if (!body.careRecipient.name.trim()) {
      return NextResponse.json(
        { error: "Care recipient name is required" },
        { status: 400 }
      )
    }

    const existingFamily = await getExistingFamily(user.id)

    const family = existingFamily
      ? await prisma.family.update({
          where: { id: existingFamily.id },
          data: {
            name: body.workspaceName.trim(),
            description: body.workspaceDescription || null,
            elderName: body.careRecipient.name || null,
            elderPhone: body.careRecipient.phone || null,
            elderAddress: body.careRecipient.address || null,
            elderBirthday: body.careRecipient.birthDate
              ? new Date(body.careRecipient.birthDate)
              : null,
            emergencyContact: existingFamily.emergencyContact,
            medicalNotes: body.careRecipient.medicalNotes || null,
            notificationPreferences:
              body.notificationPreferences as Prisma.InputJsonValue,
            topNeeds: body.topNeeds,
          },
        })
      : await prisma.family.create({
          data: {
            name: body.workspaceName.trim(),
            description: body.workspaceDescription || null,
            elderName: body.careRecipient.name || null,
            elderPhone: body.careRecipient.phone || null,
            elderAddress: body.careRecipient.address || null,
            elderBirthday: body.careRecipient.birthDate
              ? new Date(body.careRecipient.birthDate)
              : null,
            medicalNotes: body.careRecipient.medicalNotes || null,
            notificationPreferences:
              body.notificationPreferences as Prisma.InputJsonValue,
            topNeeds: body.topNeeds,
            createdBy: user.id,
          },
        })

    await prisma.familyMember.upsert({
      where: {
        familyId_userId: {
          familyId: family.id,
          userId: user.id,
        },
      },
      update: {
        role: FamilyRole.OWNER,
      },
      create: {
        familyId: family.id,
        userId: user.id,
        role: FamilyRole.OWNER,
      },
    })

    const careRecipient = await prisma.careRecipient.upsert({
      where: {
        familyId: family.id,
      },
      update: {
        name: body.careRecipient.name.trim(),
        preferredName: body.careRecipient.preferredName || null,
        relationshipToCaregiver: body.caregiverRelationship || null,
        phone: body.careRecipient.phone || null,
        address: body.careRecipient.address || null,
        birthDate: body.careRecipient.birthDate
          ? new Date(body.careRecipient.birthDate)
          : null,
        medicalNotes: body.careRecipient.medicalNotes || null,
        conditions: body.careRecipient.conditions,
      },
      create: {
        familyId: family.id,
        name: body.careRecipient.name.trim(),
        preferredName: body.careRecipient.preferredName || null,
        relationshipToCaregiver: body.caregiverRelationship || null,
        phone: body.careRecipient.phone || null,
        address: body.careRecipient.address || null,
        birthDate: body.careRecipient.birthDate
          ? new Date(body.careRecipient.birthDate)
          : null,
        medicalNotes: body.careRecipient.medicalNotes || null,
        conditions: body.careRecipient.conditions,
      },
    })

    const existingInvitations = await prisma.familyInvitation.findMany({
      where: {
        familyId: family.id,
        status: InvitationStatus.PENDING,
      },
      select: {
        email: true,
      },
    })

    const existingEmails = new Set(existingInvitations.map((invite) => invite.email))

    for (const invite of body.invites) {
      const existingUser = await prisma.user.findUnique({
        where: { email: invite.email },
      })

      if (existingUser) {
        await prisma.familyMember.upsert({
          where: {
            familyId_userId: {
              familyId: family.id,
              userId: existingUser.id,
            },
          },
          update: {
            role: invite.role as FamilyRole,
          },
          create: {
            familyId: family.id,
            userId: existingUser.id,
            role: invite.role as FamilyRole,
          },
        })

        await logFamilyAuditEvent({
          familyId: family.id,
          userId: user.id,
          action: "member.role_assigned",
          entityType: "family_member",
          entityId: existingUser.id,
          metadata: {
            email: invite.email,
            role: invite.role,
          },
        })

        continue
      }

      if (existingEmails.has(invite.email)) {
        continue
      }

      const invitation = await prisma.familyInvitation.create({
        data: {
          familyId: family.id,
          email: invite.email,
          invitedName: invite.name || null,
          role: invite.role as FamilyRole,
          invitedBy: user.id,
          status: InvitationStatus.PENDING,
        },
      })

      await logFamilyAuditEvent({
        familyId: family.id,
        userId: user.id,
        action: "invitation.created",
        entityType: "family_invitation",
        entityId: invitation.id,
        metadata: {
          email: invite.email,
          role: invite.role,
        },
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingStatus: OnboardingStatus.COMPLETED,
        onboardingStep: 6,
        onboardingData: body as Prisma.InputJsonValue,
      },
    })

    await logFamilyAuditEvent({
      familyId: family.id,
      userId: user.id,
      action: "onboarding.completed",
      entityType: "family",
      entityId: family.id,
      metadata: {
        topNeeds: body.topNeeds,
        careRecipientId: careRecipient.id,
      },
    })

    return NextResponse.json({
      success: true,
      familyId: family.id,
      onboardingStatus: OnboardingStatus.COMPLETED,
      nextActions: [
        "Add your first bill",
        "Create your first care task",
        "Invite family members",
      ],
    })
  } catch (error) {
    console.error("Error completing onboarding:", error)
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    )
  }
}
