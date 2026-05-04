import type { CollectionAfterChangeHook } from "payload";
import { OnboardingStatus, UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma.ts";
import type { PayloadRole } from "../access.ts";

type PayloadUserData = {
  id?: string | number;
  email?: string | null;
  name?: string | null;
  roles?: PayloadRole[] | PayloadRole | null;
  onboardingStatus?: OnboardingStatus | null;
  onboardingStep?: number | null;
  onboardingData?: unknown;
};

const normalizeRoles = (roles: PayloadUserData["roles"]): PayloadRole[] => {
  if (Array.isArray(roles)) {
    return roles;
  }

  return roles ? [roles] : [];
};

export function mapPayloadRolesToPrismaRole(roles: PayloadUserData["roles"]) {
  const normalized = normalizeRoles(roles);

  return normalized.includes("super-admin") || normalized.includes("support-admin")
    ? UserRole.ADMIN
    : UserRole.FAMILY_MEMBER;
}

export async function syncPayloadUserToPrisma(data: PayloadUserData) {
  if (!data.id || !data.email) {
    return;
  }

  await prisma.user.upsert({
    where: { id: String(data.id) },
    create: {
      id: String(data.id),
      email: data.email,
      name: data.name ?? null,
      role: mapPayloadRolesToPrismaRole(data.roles),
      onboardingStatus: data.onboardingStatus ?? OnboardingStatus.NOT_STARTED,
      onboardingStep: data.onboardingStep ?? 1,
      onboardingData: data.onboardingData ?? undefined,
    },
    update: {
      email: data.email,
      name: data.name ?? null,
      role: mapPayloadRolesToPrismaRole(data.roles),
      onboardingStatus: data.onboardingStatus ?? OnboardingStatus.NOT_STARTED,
      onboardingStep: data.onboardingStep ?? 1,
      onboardingData: data.onboardingData ?? undefined,
    },
  });
}

export const syncUserToPrismaAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  await syncPayloadUserToPrisma(doc as PayloadUserData);
  return doc;
};
