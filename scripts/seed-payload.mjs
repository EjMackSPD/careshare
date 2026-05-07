import { OnboardingStatus } from "@prisma/client";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import * as seedDataModule from "../payload/seed-data.ts";
import * as syncUserModule from "../payload/hooks/syncUserToPrisma.ts";
import { siteMediaAssets, syncSiteAssetsToPayload } from "./sync-site-assets-to-payload.mjs";

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

function filenameForAsset(asset) {
  return asset.kind === "local" ? asset.path.split("/").pop() : asset.filename;
}

async function getMediaLookup(payload) {
  const result = await payload.find({
    collection: "media",
    limit: 1000,
    overrideAccess: true,
  });

  const byAlt = new Map();
  const byFilename = new Map();
  const byKey = new Map();
  const byURL = new Map();

  for (const doc of result.docs) {
    if (doc.alt) {
      byAlt.set(doc.alt, doc.id);
    }

    if (doc.filename) {
      byFilename.set(doc.filename, doc.id);
    }
  }

  for (const asset of siteMediaAssets) {
    const filename = filenameForAsset(asset);
    const id = byAlt.get(asset.alt) ?? byFilename.get(filename);

    if (id) {
      byKey.set(asset.key, id);

      if (asset.url) {
        byURL.set(asset.url, id);
      }
    }
  }

  return { byAlt, byFilename, byKey, byURL };
}

function resolveMediaId(mediaLookup, value, alt) {
  if (!value && !alt) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "object" && value?.id) {
    return value.id;
  }

  if (typeof value === "string") {
    return (
      mediaLookup.byKey.get(value) ??
      mediaLookup.byURL.get(value) ??
      mediaLookup.byFilename.get(value) ??
      mediaLookup.byAlt.get(value) ??
      null
    );
  }

  return alt ? mediaLookup.byAlt.get(alt) ?? null : null;
}

const defaultHeroCarouselAssetKeys = [
  "carousel-care-professional",
  "carousel-family-table",
  "carousel-hands-care",
  "carousel-medical-team",
];

function normalizeHeroMedia(media, mediaLookup) {
  if (!media) {
    return media;
  }

  if (media.kind === "image") {
    const image = resolveMediaId(mediaLookup, media.image ?? media.src, media.alt);

    return image
      ? {
          kind: "image",
          image,
          alt: media.alt,
        }
      : media;
  }

  if (media.kind === "carousel") {
    const sourceImages = Array.isArray(media.images) && media.images.length
      ? media.images
      : defaultHeroCarouselAssetKeys.map((key) => ({ image: mediaLookup.byKey.get(key) })).filter((item) => item.image);

    return {
      kind: "carousel",
      images: sourceImages
        .map((item) => {
          const image = resolveMediaId(mediaLookup, item.image ?? item.src ?? item.url, item.alt);

          return image
            ? {
                image,
                alt: item.alt,
              }
            : null;
        })
        .filter(Boolean),
    };
  }

  return media;
}

function normalizeHeroBlock(block, mediaLookup) {
  if (block?.blockType !== "hero") {
    return block;
  }

  return {
    ...block,
    media: normalizeHeroMedia(block.media, mediaLookup),
  };
}

function normalizeFeatureGridBlock(block, mediaLookup) {
  if (block?.blockType !== "featureGrid" || !Array.isArray(block.items)) {
    return block;
  }

  return {
    ...block,
    items: block.items.map((item) => {
      const image = resolveMediaId(mediaLookup, item.image, item.imageAlt);

      return image
        ? {
            ...item,
            image,
          }
        : item;
    }),
  };
}

function normalizeContentBlock(block, mediaLookup) {
  if (block?.blockType !== "content" || !block.aside) {
    return block;
  }

  const image = resolveMediaId(mediaLookup, block.aside.image, block.aside.imageAlt);

  return image
    ? {
        ...block,
        aside: {
          ...block.aside,
          image,
        },
      }
    : block;
}

function normalizeLayoutBlock(block, mediaLookup) {
  return normalizeContentBlock(normalizeFeatureGridBlock(normalizeHeroBlock(block, mediaLookup), mediaLookup), mediaLookup);
}

function normalizePageDoc(page, mediaLookup) {
  const layout = Array.isArray(page.layout) ? page.layout : [];
  const existingHero = Array.isArray(page.hero) && page.hero.length ? page.hero : null;
  const layoutHero = layout.find((block) => block?.blockType === "hero");
  const hero = existingHero ?? (layoutHero ? [layoutHero] : [
    {
      blockType: "hero",
      sectionId: `${page.slug}-hero`,
      variant: "marketing",
      theme: page.slug === "home" ? "light" : "brand",
      title: page.title,
      body: page.seo?.description,
    },
  ]);

  return {
    ...page,
    hero: hero.map((block) => normalizeLayoutBlock(block, mediaLookup)),
    layout: layout.filter((block) => block?.blockType !== "hero").map((block) => normalizeLayoutBlock(block, mediaLookup)),
  };
}

function normalizePostDoc(post, mediaLookup) {
  const coverImage = resolveMediaId(mediaLookup, post.coverImage, null) ?? resolveMediaId(mediaLookup, post.coverImageUrl, null);

  if (!coverImage) {
    return post;
  }

  return {
    ...post,
    coverImage,
    coverImageUrl: null,
    seo: {
      ...post.seo,
      image: post.seo?.image ?? coverImage,
    },
  };
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

  await syncSiteAssetsToPayload(payload);
  const mediaLookup = await getMediaLookup(payload);

  for (const page of seedPages) {
    await upsertBySlug(payload, "pages", normalizePageDoc(page, mediaLookup));
  }

  for (const post of seedPosts) {
    await upsertBySlug(payload, "posts", normalizePostDoc(post, mediaLookup));
  }

  await payload.destroy();
}
