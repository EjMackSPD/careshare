import { randomBytes } from "crypto";
import { OnboardingStatus } from "@prisma/client";
import type { PayloadRole } from "@/payload/access";
import { getPayloadClient } from "@/lib/cms";
import { syncPayloadUserToPrisma } from "@/payload/hooks/syncUserToPrisma";

type PayloadUserInput = {
  id?: string;
  email: string;
  name?: string | null;
  password?: string;
  roles?: PayloadRole[];
  mustResetPassword?: boolean;
  onboardingStatus?: OnboardingStatus;
  onboardingStep?: number;
  onboardingData?: unknown;
};

export function createTemporaryPassword() {
  return randomBytes(24).toString("base64url");
}

export async function upsertPayloadUser(input: PayloadUserInput) {
  const payload = await getPayloadClient();
  const roles: PayloadRole[] = input.roles?.length ? input.roles : ["family-member"];
  const existing = await payload.find({
    collection: "users",
    limit: 1,
    overrideAccess: true,
    where: {
      email: {
        equals: input.email,
      },
    },
  });

  const data = {
    id: input.id,
    email: input.email,
    name: input.name,
    roles,
    mustResetPassword: input.mustResetPassword ?? false,
    onboardingStatus: input.onboardingStatus ?? OnboardingStatus.NOT_STARTED,
    onboardingStep: input.onboardingStep ?? 1,
    onboardingData: input.onboardingData,
    ...(input.password ? { password: input.password } : {}),
  };

  const user = existing.docs[0]
    ? await payload.update({
        collection: "users",
        id: existing.docs[0].id,
        data: data as any,
        overrideAccess: true,
      })
    : await payload.create({
        collection: "users",
        data: data as any,
        overrideAccess: true,
      });

  await syncPayloadUserToPrisma({
    id: user.id,
    email: input.email,
    name: input.name,
    roles,
    onboardingStatus: input.onboardingStatus,
    onboardingStep: input.onboardingStep,
    onboardingData: input.onboardingData,
  });

  return user;
}
