import { headers as nextHeaders } from "next/headers";
import { OnboardingStatus, UserRole } from "@prisma/client";
import type { PayloadRole } from "@/payload/access";
import { getPayloadClient } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { mapPayloadRolesToPrismaRole, syncPayloadUserToPrisma } from "@/payload/hooks/syncUserToPrisma";

export type CareShareUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  roles: PayloadRole[];
  onboardingStatus: OnboardingStatus;
  onboardingStep: number;
  onboardingData?: unknown;
  mustResetPassword?: boolean | null;
};

export type CareShareSession = {
  user: CareShareUser;
};

type PayloadUser = {
  id: string | number;
  email?: string | null;
  name?: string | null;
  roles?: PayloadRole[] | PayloadRole | null;
  onboardingStatus?: OnboardingStatus | null;
  onboardingStep?: number | null;
  onboardingData?: unknown;
  mustResetPassword?: boolean | null;
};

function normalizeRoles(roles: PayloadUser["roles"]): PayloadRole[] {
  if (Array.isArray(roles)) {
    return roles.length ? roles : ["family-member"];
  }

  return roles ? [roles] : ["family-member"];
}

export function isOperationalAdmin(user: Pick<CareShareUser, "roles" | "role"> | null | undefined) {
  return Boolean(
    user?.roles.includes("super-admin") ||
      user?.roles.includes("support-admin") ||
      user?.role === UserRole.ADMIN
  );
}

export function canAccessPayloadAdmin(user: Pick<CareShareUser, "roles"> | null | undefined) {
  return Boolean(
    user?.roles.includes("super-admin") ||
      user?.roles.includes("content-editor") ||
      user?.roles.includes("support-admin")
  );
}

async function normalizePayloadUser(user: PayloadUser): Promise<CareShareUser | null> {
  if (!user.email) {
    return null;
  }

  const roles = normalizeRoles(user.roles);
  await syncPayloadUserToPrisma({
    id: user.id,
    email: user.email,
    name: user.name,
    roles,
    onboardingStatus: user.onboardingStatus ?? OnboardingStatus.NOT_STARTED,
    onboardingStep: user.onboardingStep ?? 1,
    onboardingData: user.onboardingData,
  });

  const prismaUser = await prisma.user.findUnique({
    where: { id: String(user.id) },
    select: {
      role: true,
      onboardingStatus: true,
      onboardingStep: true,
      onboardingData: true,
    },
  });

  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: prismaUser?.role ?? mapPayloadRolesToPrismaRole(roles),
    roles,
    onboardingStatus:
      prismaUser?.onboardingStatus ?? user.onboardingStatus ?? OnboardingStatus.NOT_STARTED,
    onboardingStep: prismaUser?.onboardingStep ?? user.onboardingStep ?? 1,
    onboardingData: prismaUser?.onboardingData ?? user.onboardingData,
    mustResetPassword: user.mustResetPassword,
  };
}

export async function getPayloadAuthenticatedUser(headers?: Headers): Promise<CareShareUser | null> {
  const payload = await getPayloadClient();
  const authHeaders = headers ?? ((await nextHeaders()) as unknown as Headers);
  const result = await payload.auth({ headers: authHeaders });

  if (!result.user) {
    return null;
  }

  return normalizePayloadUser(result.user as PayloadUser);
}

export async function auth(): Promise<CareShareSession | null> {
  const user = await getPayloadAuthenticatedUser();
  return user ? { user } : null;
}
