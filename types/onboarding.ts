export const ONBOARDING_AUDIENCES = [
  "CAREGIVER_POA",
  "FAMILY",
  "CARE_CENTER",
  "INDIVIDUAL",
] as const

export const WORKSPACE_MODES = ["FAMILY", "SOLO", "PARTNER"] as const

export const DECISION_AUTHORITY_OPTIONS = [
  "PRIMARY_HELPER",
  "POWER_OF_ATTORNEY",
  "LEGAL_GUARDIAN",
  "FAMILY_SUPPORT",
] as const

export const FAMILY_INTENT_OPTIONS = ["CREATE", "JOIN"] as const

export const ORGANIZATION_TYPES = [
  "ASSISTED_LIVING",
  "NURSING_HOME",
  "HOME_CARE_AGENCY",
  "HOSPICE",
  "OTHER",
] as const

export const ORGANIZATION_SIZES = [
  "1_10",
  "11_50",
  "51_200",
  "201_PLUS",
] as const

export const PARTNERSHIP_GOALS = [
  "FAMILY_PORTAL",
  "STAFF_COORDINATION",
  "DEMO_REQUEST",
  "PARTNERSHIP_EXPLORATION",
] as const

export type OnboardingAudienceType =
  (typeof ONBOARDING_AUDIENCES)[number]

export type WorkspaceMode = (typeof WORKSPACE_MODES)[number]
export type DecisionAuthority = (typeof DECISION_AUTHORITY_OPTIONS)[number]
export type FamilyIntent = (typeof FAMILY_INTENT_OPTIONS)[number]
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number]
export type OrganizationSize = (typeof ORGANIZATION_SIZES)[number]
export type PartnershipGoal = (typeof PARTNERSHIP_GOALS)[number]

export type OnboardingInvite = {
  email: string
  name: string
  role: string
}

export type CareContext = {
  caregiverRelationship: string
  decisionAuthority: DecisionAuthority
  familyIntent: FamilyIntent
  joinContactEmail: string
  selfManaged: boolean
}

export type OrganizationDetails = {
  name: string
  type: OrganizationType
  size: OrganizationSize
  contactName: string
  contactEmail: string
  contactPhone: string
  partnershipGoal: PartnershipGoal
  notes: string
}

export type CareRecipientDraft = {
  name: string
  preferredName: string
  phone: string
  address: string
  birthDate: string
  medicalNotes: string
  conditions: string
}

export type OnboardingDraft = {
  currentStep: number
  audienceType: OnboardingAudienceType
  workspaceMode: WorkspaceMode
  workspaceName: string
  workspaceDescription: string
  careContext: CareContext
  organization: OrganizationDetails
  careRecipient: CareRecipientDraft
  invites: OnboardingInvite[]
  topNeeds: string[]
  notificationPreferences: {
    email: boolean
    push: boolean
  }
}

export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  currentStep: 1,
  audienceType: "CAREGIVER_POA",
  workspaceMode: "FAMILY",
  workspaceName: "",
  workspaceDescription: "",
  careContext: {
    caregiverRelationship: "",
    decisionAuthority: "PRIMARY_HELPER",
    familyIntent: "CREATE",
    joinContactEmail: "",
    selfManaged: false,
  },
  organization: {
    name: "",
    type: "ASSISTED_LIVING",
    size: "1_10",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    partnershipGoal: "DEMO_REQUEST",
    notes: "",
  },
  careRecipient: {
    name: "",
    preferredName: "",
    phone: "",
    address: "",
    birthDate: "",
    medicalNotes: "",
    conditions: "",
  },
  invites: [],
  topNeeds: [],
  notificationPreferences: {
    email: true,
    push: true,
  },
}

export function isOnboardingAudienceType(
  value: string | undefined | null
): value is OnboardingAudienceType {
  return Boolean(value && ONBOARDING_AUDIENCES.includes(value as OnboardingAudienceType))
}
