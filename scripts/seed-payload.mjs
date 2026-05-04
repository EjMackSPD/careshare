import { OnboardingStatus } from "@prisma/client";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import * as seedDataModule from "../payload/seed-data.ts";
import * as syncUserModule from "../payload/hooks/syncUserToPrisma.ts";

const { seedPages, seedPosts } = seedDataModule.default ?? seedDataModule;
const { syncPayloadUserToPrisma } = syncUserModule.default ?? syncUserModule;

async function upsertPayloadUser(payload, input) {
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
    email: input.email,
    name: input.name,
    password: input.password,
    roles: input.roles,
    onboardingStatus: input.onboardingStatus,
    onboardingStep: input.onboardingStep,
    mustResetPassword: input.mustResetPassword,
  };

  const user = existing.docs[0]
    ? await payload.update({
        collection: "users",
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      })
    : await payload.create({
        collection: "users",
        data,
        overrideAccess: true,
      });

  await syncPayloadUserToPrisma({
    id: user.id,
    email: input.email,
    name: input.name,
    roles: input.roles,
    onboardingStatus: input.onboardingStatus,
    onboardingStep: input.onboardingStep,
  });

  return user;
}

async function upsertBySlug(payload, collection, doc) {
  const existing = await payload.find({
    collection,
    limit: 1,
    overrideAccess: true,
    where: {
      slug: {
        equals: doc.slug,
      },
    },
  });

  const data = {
    ...doc,
    _status: "published",
  };

  if (existing.docs[0]) {
    await payload.update({
      collection,
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    });
    return;
  }

  await payload.create({
    collection,
    data,
    overrideAccess: true,
  });
}

export async function script(payloadConfig = config) {
  const payload = await getPayload({ config: payloadConfig });

  const adminEmail = process.env.PAYLOAD_BOOTSTRAP_ADMIN_EMAIL;
  const adminPassword = process.env.PAYLOAD_BOOTSTRAP_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    await upsertPayloadUser(payload, {
      email: adminEmail,
      name: "CareShare Admin",
      password: adminPassword,
      roles: ["super-admin"],
      onboardingStatus: OnboardingStatus.COMPLETED,
      onboardingStep: 6,
      mustResetPassword: false,
    });
  }

  for (const page of seedPages) {
    await upsertBySlug(payload, "pages", page);
  }

  for (const post of seedPosts) {
    await upsertBySlug(payload, "posts", post);
  }

  await payload.destroy();
}
