import { auth } from "./auth"
import { prisma } from "./prisma"
import { FamilyRole, Prisma, UserRole } from "@prisma/client"
import {
  FamilyCapability,
  hasFamilyCapability,
} from "./family-permissions"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Admin access required")
  }
  return user
}

export async function requireFamilyMembership(
  familyId: string,
  allowedRoles?: FamilyRole[]
) {
  const user = await requireAuth()

  if (user.role === UserRole.ADMIN) {
    return {
      user,
      membership: null,
    }
  }

  const membership = await prisma.familyMember.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId: user.id,
      },
    },
  })

  if (!membership) {
    throw new Error("Family access required")
  }

  if (allowedRoles && !allowedRoles.includes(membership.role)) {
    throw new Error("Insufficient family permissions")
  }

  return {
    user,
    membership,
  }
}

export async function requireFamilyCapability(
  familyId: string,
  capability: FamilyCapability
) {
  const { user, membership } = await requireFamilyMembership(familyId)

  if (user.role === UserRole.ADMIN) {
    return { user, membership }
  }

  if (!membership || !hasFamilyCapability(membership.role, capability)) {
    throw new Error("Insufficient family permissions")
  }

  return { user, membership }
}

export async function logFamilyAuditEvent(input: {
  familyId?: string
  userId?: string
  action: string
  entityType: string
  entityId?: string
  metadata?: Prisma.InputJsonValue
}) {
  return prisma.auditLog.create({
    data: {
      familyId: input.familyId,
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  })
}

