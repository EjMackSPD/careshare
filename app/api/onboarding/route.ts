import { NextRequest, NextResponse } from "next/server"
import {
  FamilyRole,
  InvitationStatus,
  OnboardingStatus,
  Prisma,
} from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { logFamilyAuditEvent, requireAuth } from "@/lib/auth-utils"
import { hydrateStoredDraft } from "@/lib/onboarding"
import { normalizeFamilyRole } from "@/lib/family-permissions"
import {
  DEFAULT_ONBOARDING_DRAFT,
  DECISION_AUTHORITY_OPTIONS,
  FAMILY_INTENT_OPTIONS,
  ONBOARDING_AUDIENCES,
  ORGANIZATION_SIZES,
  ORGANIZATION_TYPES,
  PARTNERSHIP_GOALS,
  WORKSPACE_MODES,
  type OnboardingAudienceType,
  type OnboardingDraft,
} from "@/types/onboarding"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function asString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function toConditionsArray(value: unknown) {
  return asString(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function toDraft(payload: unknown): OnboardingDraft {
  const body = isRecord(payload) ? payload : {}
  const careContext = isRecord(body.careContext) ? body.careContext : {}
  const organization = isRecord(body.organization) ? body.organization : {}
  const careRecipient = isRecord(body.careRecipient) ? body.careRecipient : {}
  const notificationPreferences = isRecord(body.notificationPreferences)
    ? body.notificationPreferences
    : {}

  const audienceType = ONBOARDING_AUDIENCES.includes(
    body.audienceType as OnboardingAudienceType
  )
    ? (body.audienceType as OnboardingAudienceType)
    : DEFAULT_ONBOARDING_DRAFT.audienceType

  const workspaceMode = WORKSPACE_MODES.includes(body.workspaceMode as any)
    ? (body.workspaceMode as OnboardingDraft["workspaceMode"])
    : audienceType === "CARE_CENTER"
      ? "PARTNER"
      : audienceType === "INDIVIDUAL"
        ? "SOLO"
        : "FAMILY"

  return {
    currentStep:
      typeof body.currentStep === "number" && body.currentStep > 0
        ? Math.min(6, Math.max(1, Math.round(body.currentStep)))
        : DEFAULT_ONBOARDING_DRAFT.currentStep,
    audienceType,
    workspaceMode,
    workspaceName: asString(body.workspaceName),
    workspaceDescription: asString(body.workspaceDescription),
    careContext: {
      caregiverRelationship: asString(careContext.caregiverRelationship),
      decisionAuthority: DECISION_AUTHORITY_OPTIONS.includes(
        careContext.decisionAuthority as any
      )
        ? (careContext.decisionAuthority as OnboardingDraft["careContext"]["decisionAuthority"])
        : DEFAULT_ONBOARDING_DRAFT.careContext.decisionAuthority,
      familyIntent: FAMILY_INTENT_OPTIONS.includes(careContext.familyIntent as any)
        ? (careContext.familyIntent as OnboardingDraft["careContext"]["familyIntent"])
        : DEFAULT_ONBOARDING_DRAFT.careContext.familyIntent,
      joinContactEmail: asString(careContext.joinContactEmail).trim().toLowerCase(),
      selfManaged: asBoolean(careContext.selfManaged, audienceType === "INDIVIDUAL"),
    },
    organization: {
      name: asString(organization.name),
      type: ORGANIZATION_TYPES.includes(organization.type as any)
        ? (organization.type as OnboardingDraft["organization"]["type"])
        : DEFAULT_ONBOARDING_DRAFT.organization.type,
      size: ORGANIZATION_SIZES.includes(organization.size as any)
        ? (organization.size as OnboardingDraft["organization"]["size"])
        : DEFAULT_ONBOARDING_DRAFT.organization.size,
      contactName: asString(organization.contactName),
      contactEmail: asString(organization.contactEmail).trim().toLowerCase(),
      contactPhone: asString(organization.contactPhone),
      partnershipGoal: PARTNERSHIP_GOALS.includes(
        organization.partnershipGoal as any
      )
        ? (organization.partnershipGoal as OnboardingDraft["organization"]["partnershipGoal"])
        : DEFAULT_ONBOARDING_DRAFT.organization.partnershipGoal,
      notes: asString(organization.notes),
    },
    careRecipient: {
      name: asString(careRecipient.name),
      preferredName: asString(careRecipient.preferredName),
      phone: asString(careRecipient.phone),
      address: asString(careRecipient.address),
      birthDate: asString(careRecipient.birthDate),
      medicalNotes: asString(careRecipient.medicalNotes),
      conditions: Array.isArray(careRecipient.conditions)
        ? careRecipient.conditions.join(", ")
        : asString(careRecipient.conditions),
    },
    invites: Array.isArray(body.invites)
      ? body.invites
          .filter(isRecord)
          .map((invite) => ({
            email: asString(invite.email).trim().toLowerCase(),
            name: asString(invite.name).trim(),
            role: normalizeFamilyRole(asString(invite.role)),
          }))
          .filter((invite) => invite.email)
      : [],
    topNeeds: asStringArray(body.topNeeds).filter(Boolean),
    notificationPreferences: {
      email: asBoolean(
        notificationPreferences.email,
        DEFAULT_ONBOARDING_DRAFT.notificationPreferences.email
      ),
      push: asBoolean(
        notificationPreferences.push,
        DEFAULT_ONBOARDING_DRAFT.notificationPreferences.push
      ),
    },
  }
}

function buildWorkspaceName(draft: OnboardingDraft, userName: string | null | undefined) {
  if (draft.workspaceName.trim()) {
    return draft.workspaceName.trim()
  }

  if (draft.audienceType === "INDIVIDUAL") {
    const displayName = draft.careRecipient.name.trim() || userName || "My"
    return `${displayName}'s Care Plan`
  }

  return ""
}

function validateCompletion(draft: OnboardingDraft, userName: string | null | undefined) {
  if (draft.audienceType === "CARE_CENTER") {
    if (!draft.organization.name.trim()) {
      return "Organization name is required"
    }

    if (!draft.organization.contactName.trim()) {
      return "A primary contact name is required"
    }

    if (!draft.organization.contactEmail.trim()) {
      return "A contact email is required"
    }

    return null
  }

  if (
    draft.audienceType === "FAMILY" &&
    draft.careContext.familyIntent === "JOIN"
  ) {
    if (!draft.careContext.joinContactEmail.trim()) {
      return "Please add the email of the family organizer who invited you"
    }

    return null
  }

  if (!buildWorkspaceName(draft, userName)) {
    return draft.audienceType === "INDIVIDUAL"
      ? "A personal workspace name is required"
      : "Family workspace name is required"
  }

  if (!draft.careRecipient.name.trim()) {
    return draft.audienceType === "INDIVIDUAL"
      ? "Please tell us who this personal care plan is for"
      : "Care recipient name is required"
  }

  return null
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

async function markOnboardingComplete(userId: string, draft: OnboardingDraft) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      onboardingStatus: OnboardingStatus.COMPLETED,
      onboardingStep: 6,
      onboardingData: draft as Prisma.InputJsonValue,
    },
  })
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
    const draft = hydrateStoredDraft(dbUser?.onboardingData ?? null)

    if (family?.careRecipient) {
      draft.careRecipient = {
        name: draft.careRecipient.name || family.careRecipient.name || "",
        preferredName:
          draft.careRecipient.preferredName ||
          family.careRecipient.preferredName ||
          "",
        phone: draft.careRecipient.phone || family.careRecipient.phone || "",
        address:
          draft.careRecipient.address || family.careRecipient.address || "",
        birthDate:
          draft.careRecipient.birthDate ||
          family.careRecipient.birthDate?.toISOString().slice(0, 10) ||
          "",
        medicalNotes:
          draft.careRecipient.medicalNotes ||
          family.careRecipient.medicalNotes ||
          "",
        conditions:
          draft.careRecipient.conditions ||
          (Array.isArray(family.careRecipient.conditions)
            ? family.careRecipient.conditions.join(", ")
            : ""),
      }
    }

    return NextResponse.json({
      onboardingStatus: dbUser?.onboardingStatus ?? user.onboardingStatus,
      onboardingStep: dbUser?.onboardingStep ?? user.onboardingStep,
      hasCompletedOnboarding:
        (dbUser?.onboardingStatus ?? user.onboardingStatus) ===
        OnboardingStatus.COMPLETED,
      familyId: family?.id ?? null,
      data: draft,
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
    const draft = toDraft(await request.json())

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingStatus: OnboardingStatus.IN_PROGRESS,
        onboardingStep: draft.currentStep,
        onboardingData: draft as Prisma.InputJsonValue,
      },
      select: {
        onboardingStatus: true,
        onboardingStep: true,
        onboardingData: true,
      },
    })

    return NextResponse.json({
      ...updatedUser,
      onboardingData: hydrateStoredDraft(updatedUser.onboardingData),
    })
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
    const draft = toDraft(await request.json())
    const validationError = validateCompletion(draft, user.name)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    if (draft.audienceType === "CARE_CENTER") {
      await markOnboardingComplete(user.id, draft)

      return NextResponse.json({
        success: true,
        onboardingStatus: OnboardingStatus.COMPLETED,
        redirectTo: "/onboarding/partner-complete",
      })
    }

    if (
      draft.audienceType === "FAMILY" &&
      draft.careContext.familyIntent === "JOIN"
    ) {
      await markOnboardingComplete(user.id, draft)

      return NextResponse.json({
        success: true,
        onboardingStatus: OnboardingStatus.COMPLETED,
        redirectTo: "/onboarding/join-family",
      })
    }

    const workspaceName = buildWorkspaceName(draft, user.name)
    const existingFamily = await getExistingFamily(user.id)

    const family = existingFamily
      ? await prisma.family.update({
          where: { id: existingFamily.id },
          data: {
            name: workspaceName,
            description: draft.workspaceDescription || null,
            elderName: draft.careRecipient.name || null,
            elderPhone: draft.careRecipient.phone || null,
            elderAddress: draft.careRecipient.address || null,
            elderBirthday: draft.careRecipient.birthDate
              ? new Date(draft.careRecipient.birthDate)
              : null,
            emergencyContact: existingFamily.emergencyContact,
            medicalNotes: draft.careRecipient.medicalNotes || null,
            notificationPreferences:
              draft.notificationPreferences as Prisma.InputJsonValue,
            topNeeds: draft.topNeeds,
          },
        })
      : await prisma.family.create({
          data: {
            name: workspaceName,
            description: draft.workspaceDescription || null,
            elderName: draft.careRecipient.name || null,
            elderPhone: draft.careRecipient.phone || null,
            elderAddress: draft.careRecipient.address || null,
            elderBirthday: draft.careRecipient.birthDate
              ? new Date(draft.careRecipient.birthDate)
              : null,
            medicalNotes: draft.careRecipient.medicalNotes || null,
            notificationPreferences:
              draft.notificationPreferences as Prisma.InputJsonValue,
            topNeeds: draft.topNeeds,
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

    const relationship =
      draft.audienceType === "INDIVIDUAL"
        ? "Self"
        : draft.careContext.caregiverRelationship || null

    const careRecipient = await prisma.careRecipient.upsert({
      where: {
        familyId: family.id,
      },
      update: {
        name: draft.careRecipient.name.trim(),
        preferredName: draft.careRecipient.preferredName || null,
        relationshipToCaregiver: relationship,
        phone: draft.careRecipient.phone || null,
        address: draft.careRecipient.address || null,
        birthDate: draft.careRecipient.birthDate
          ? new Date(draft.careRecipient.birthDate)
          : null,
        medicalNotes: draft.careRecipient.medicalNotes || null,
        conditions: toConditionsArray(draft.careRecipient.conditions),
      },
      create: {
        familyId: family.id,
        name: draft.careRecipient.name.trim(),
        preferredName: draft.careRecipient.preferredName || null,
        relationshipToCaregiver: relationship,
        phone: draft.careRecipient.phone || null,
        address: draft.careRecipient.address || null,
        birthDate: draft.careRecipient.birthDate
          ? new Date(draft.careRecipient.birthDate)
          : null,
        medicalNotes: draft.careRecipient.medicalNotes || null,
        conditions: toConditionsArray(draft.careRecipient.conditions),
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

    for (const invite of draft.invites) {
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

    await markOnboardingComplete(user.id, {
      ...draft,
      workspaceName,
    })

    await logFamilyAuditEvent({
      familyId: family.id,
      userId: user.id,
      action: "onboarding.completed",
      entityType: "family",
      entityId: family.id,
      metadata: {
        audienceType: draft.audienceType,
        topNeeds: draft.topNeeds,
        careRecipientId: careRecipient.id,
        workspaceMode: draft.workspaceMode,
      },
    })

    return NextResponse.json({
      success: true,
      familyId: family.id,
      onboardingStatus: OnboardingStatus.COMPLETED,
      redirectTo: "/dashboard",
      nextActions:
        draft.audienceType === "INDIVIDUAL"
          ? [
              "Add your care priorities",
              "Create your first care task",
              "Invite a trusted supporter",
            ]
          : [
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
