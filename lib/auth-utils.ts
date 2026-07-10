import { prisma } from "./prisma";
import { FamilyMember, FamilyRole, Prisma, UserRole } from "@prisma/client";
import {
  FamilyCapability,
  hasFamilyCapability,
} from "./family-permissions";
import { auth, isOperationalAdmin } from "./auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!isOperationalAdmin(user)) {
    throw new Error("Admin access required");
  }
  return user;
}

export async function requireFamilyMembership(
  familyId: string,
  allowedRoles?: FamilyRole[]
) {
  const user = await requireAuth();

  if (user.role === UserRole.ADMIN || isOperationalAdmin(user)) {
    return {
      user,
      membership: null,
    };
  }

  const membership = await prisma.familyMember.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId: user.id,
      },
    },
  });

  const effectiveMembership = membership ?? (await getProviderMembership(familyId, user.id));

  if (!effectiveMembership) {
    throw new Error("Family access required");
  }

  if (allowedRoles && !allowedRoles.includes(effectiveMembership.role)) {
    throw new Error("Insufficient family permissions");
  }

  return {
    user,
    membership: effectiveMembership,
  };
}

// A Care Provider/Admin (nursing home, agency, professional) is granted
// FAMILY_ADMIN-equivalent access to families explicitly assigned to them via
// AdminFamily — scoped to that exact family, not a blanket cross-family bypass
// like isOperationalAdmin.
async function getProviderMembership(
  familyId: string,
  userId: string
): Promise<FamilyMember | null> {
  const assignment = await prisma.adminFamily.findUnique({
    where: { adminId_familyId: { adminId: userId, familyId } },
  });

  if (!assignment) return null;

  return {
    id: `admin-family:${assignment.id}`,
    familyId,
    userId,
    role: "FAMILY_ADMIN",
    joinedAt: assignment.addedAt,
  };
}

export async function requireFamilyCapability(
  familyId: string,
  capability: FamilyCapability
) {
  const { user, membership } = await requireFamilyMembership(familyId);

  if (user.role === UserRole.ADMIN || isOperationalAdmin(user)) {
    return { user, membership };
  }

  if (!membership || !hasFamilyCapability(membership.role, capability)) {
    throw new Error("Insufficient family permissions");
  }

  return { user, membership };
}

export async function logFamilyAuditEvent(input: {
  familyId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
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
  });
}
