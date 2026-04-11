import { FamilyRole } from "@prisma/client"

export type FamilyCapability =
  | "workspace.manage"
  | "members.manage"
  | "care.read"
  | "care.write"
  | "bills.read"
  | "bills.write"
  | "bills.pay"
  | "contributions.read"
  | "contributions.write"
  | "chat.read"
  | "chat.write"
  | "sensitive.read"
  | "sensitive.write"
  | "documents.read"
  | "documents.write"

const roleCapabilities: Record<FamilyRole, FamilyCapability[]> = {
  OWNER: [
    "workspace.manage",
    "members.manage",
    "care.read",
    "care.write",
    "bills.read",
    "bills.write",
    "bills.pay",
    "contributions.read",
    "contributions.write",
    "chat.read",
    "chat.write",
    "sensitive.read",
    "sensitive.write",
    "documents.read",
    "documents.write",
  ],
  PRIMARY_CAREGIVER: [
    "workspace.manage",
    "members.manage",
    "care.read",
    "care.write",
    "bills.read",
    "bills.write",
    "bills.pay",
    "contributions.read",
    "contributions.write",
    "chat.read",
    "chat.write",
    "sensitive.read",
    "sensitive.write",
    "documents.read",
    "documents.write",
  ],
  FAMILY_ADMIN: [
    "members.manage",
    "care.read",
    "care.write",
    "bills.read",
    "bills.write",
    "contributions.read",
    "contributions.write",
    "chat.read",
    "chat.write",
    "sensitive.read",
    "documents.read",
    "documents.write",
  ],
  CONTRIBUTOR: [
    "care.read",
    "bills.read",
    "contributions.read",
    "contributions.write",
    "chat.read",
    "chat.write",
    "documents.read",
  ],
  VIEWER: [
    "care.read",
    "bills.read",
    "contributions.read",
    "chat.read",
    "documents.read",
  ],
  CARE_RECIPIENT: [
    "care.read",
    "chat.read",
  ],
}

export function hasFamilyCapability(
  role: FamilyRole,
  capability: FamilyCapability
) {
  return roleCapabilities[role].includes(capability)
}

export function getRoleCapabilities(role: FamilyRole) {
  return roleCapabilities[role]
}

export function normalizeFamilyRole(role?: string | null): FamilyRole {
  switch (role) {
    case "OWNER":
    case "PRIMARY_CAREGIVER":
    case "FAMILY_ADMIN":
    case "CONTRIBUTOR":
    case "VIEWER":
    case "CARE_RECIPIENT":
      return role
    case "CARE_MANAGER":
      return "PRIMARY_CAREGIVER"
    case "FAMILY_MEMBER":
      return "VIEWER"
    default:
      return "VIEWER"
  }
}

export const caregiverRoles: FamilyRole[] = ["OWNER", "PRIMARY_CAREGIVER"]
export const managerRoles: FamilyRole[] = [
  "OWNER",
  "PRIMARY_CAREGIVER",
  "FAMILY_ADMIN",
]
