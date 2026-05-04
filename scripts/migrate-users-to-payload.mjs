import { randomBytes } from "crypto";
import { OnboardingStatus, UserRole } from "@prisma/client";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import * as prismaModule from "../lib/prisma.ts";

const { prisma } = prismaModule.default ?? prismaModule;

function createTemporaryPassword() {
  return randomBytes(24).toString("base64url");
}

export async function script(payloadConfig = config) {
  const payload = await getPayload({ config: payloadConfig });
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  for (const user of users) {
    const roles = user.role === UserRole.ADMIN ? ["support-admin"] : ["family-member"];
    const existing = await payload.find({
      collection: "users",
      limit: 1,
      overrideAccess: true,
      where: {
        email: {
          equals: user.email,
        },
      },
    });

    const data = {
      id: user.id,
      email: user.email,
      name: user.name,
      password: createTemporaryPassword(),
      roles,
      mustResetPassword: true,
      onboardingStatus: user.onboardingStatus ?? OnboardingStatus.NOT_STARTED,
      onboardingStep: user.onboardingStep ?? 1,
      onboardingData: user.onboardingData,
    };

    if (existing.docs[0]) {
      await payload.update({
        collection: "users",
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      });
    } else {
      await payload.create({
        collection: "users",
        data,
        overrideAccess: true,
      });
    }
  }

  console.log(`Migrated ${users.length} Prisma users into Payload auth.`);
  await payload.destroy();
  await prisma.$disconnect();
}
