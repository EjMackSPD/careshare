import { FamilyRole } from "@prisma/client"
import { managerRoles } from "@/lib/family-permissions"
import { OnboardingAudienceType } from "@/types/onboarding"

export type DashboardPersona =
  | "COORDINATOR"
  | "FAMILY_MEMBER"
  | "CARE_RECIPIENT"
  | "PROVIDER_ADMIN"

export function resolveDashboardPersona(input: {
  familyMemberRoles: FamilyRole[]
  adminFamilyCount: number
  audienceType: OnboardingAudienceType
}): DashboardPersona | "NONE" {
  const { familyMemberRoles, adminFamilyCount, audienceType } = input

  if (adminFamilyCount > 0 || audienceType === "CARE_CENTER") {
    return "PROVIDER_ADMIN"
  }

  if (familyMemberRoles.length === 0) {
    return "NONE"
  }

  if (familyMemberRoles.every((role) => role === "CARE_RECIPIENT")) {
    return "CARE_RECIPIENT"
  }

  if (familyMemberRoles.some((role) => managerRoles.includes(role))) {
    return "COORDINATOR"
  }

  return "FAMILY_MEMBER"
}
