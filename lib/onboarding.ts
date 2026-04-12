import { type Prisma } from "@prisma/client"
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

export function hydrateStoredDraft(stored: Prisma.JsonValue | null): OnboardingDraft {
  const body = isRecord(stored) ? stored : {}
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

  const draft: OnboardingDraft = {
    currentStep:
      typeof body.currentStep === "number" && body.currentStep > 0
        ? Math.min(6, Math.max(1, Math.round(body.currentStep)))
        : DEFAULT_ONBOARDING_DRAFT.currentStep,
    audienceType,
    workspaceMode: WORKSPACE_MODES.includes(body.workspaceMode as any)
      ? (body.workspaceMode as OnboardingDraft["workspaceMode"])
      : audienceType === "CARE_CENTER"
        ? "PARTNER"
        : audienceType === "INDIVIDUAL"
          ? "SOLO"
          : "FAMILY",
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
      joinContactEmail: asString(careContext.joinContactEmail),
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
      contactEmail: asString(organization.contactEmail),
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
      ? body.invites.reduce<OnboardingDraft["invites"]>((acc, invite) => {
          if (!isRecord(invite)) {
            return acc
          }

          const nextInvite = {
            email: asString(invite.email),
            name: asString(invite.name),
            role: asString(invite.role) || "VIEWER",
          }

          if (nextInvite.email) {
            acc.push(nextInvite)
          }

          return acc
        }, [])
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

  if (
    !isRecord(stored) ||
    !("audienceType" in stored) ||
    !stored.audienceType
  ) {
    draft.audienceType = "CAREGIVER_POA"
    draft.workspaceMode = "FAMILY"
  }

  return draft
}
