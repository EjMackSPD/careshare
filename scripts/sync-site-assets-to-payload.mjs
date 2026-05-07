import { existsSync } from "fs";
import { mkdir, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { pathToFileURL, fileURLToPath } from "url";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const siteMediaAssets = [
  {
    key: "careshare-logo",
    kind: "local",
    path: "public/careshare-logo.png",
    alt: "CareShare logo",
  },
  {
    key: "android-chrome-192",
    kind: "local",
    path: "public/android-chrome-192x192.png",
    alt: "CareShare app icon 192 by 192",
  },
  {
    key: "android-chrome-512",
    kind: "local",
    path: "public/android-chrome-512x512.png",
    alt: "CareShare app icon 512 by 512",
  },
  {
    key: "apple-touch-icon",
    kind: "local",
    path: "public/apple-touch-icon.png",
    alt: "CareShare Apple touch icon",
  },
  {
    key: "favicon-16",
    kind: "local",
    path: "public/favicon-16x16.png",
    alt: "CareShare favicon 16 by 16",
  },
  {
    key: "favicon-32",
    kind: "local",
    path: "public/favicon-32x32.png",
    alt: "CareShare favicon 32 by 32",
  },
  {
    key: "favicon",
    kind: "local",
    path: "public/favicon.ico",
    alt: "CareShare favicon",
  },
  {
    key: "file-icon",
    kind: "local",
    path: "public/file.svg",
    alt: "File icon asset",
  },
  {
    key: "globe-icon",
    kind: "local",
    path: "public/globe.svg",
    alt: "Globe icon asset",
  },
  {
    key: "next-icon",
    kind: "local",
    path: "public/next.svg",
    alt: "Next.js logo asset",
  },
  {
    key: "vercel-icon",
    kind: "local",
    path: "public/vercel.svg",
    alt: "Vercel logo asset",
  },
  {
    key: "window-icon",
    kind: "local",
    path: "public/window.svg",
    alt: "Window icon asset",
  },
  {
    key: "home-dashboard-screenshot",
    kind: "local",
    path: "public/cms/dashboard-screenshot.png",
    alt: "CareShare dashboard showing care tasks, finances, calendar, and quick actions",
  },
  {
    key: "features-care-team",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1920&q=80",
    filename: "features-care-team.jpg",
    alt: "A care team meeting together",
  },
  {
    key: "contact-care-support",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=1920&q=80",
    filename: "contact-care-support.jpg",
    alt: "Care support conversation",
  },
  {
    key: "partnership-team",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80",
    filename: "partnership-team.jpg",
    alt: "CareShare partnership team working together",
  },
  {
    key: "privacy-documents",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80",
    filename: "privacy-documents.jpg",
    alt: "Privacy and legal documents",
  },
  {
    key: "about-family-care",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1920&q=80",
    filename: "about-family-care.jpg",
    alt: "Family caregiving at home",
  },
  {
    key: "blog-writing",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1920&q=80",
    filename: "blog-writing.jpg",
    alt: "CareShare blog writing desk",
  },
  {
    key: "carousel-care-professional",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=1920&q=80",
    filename: "carousel-care-professional.jpg",
    alt: "Care professional helping a family",
  },
  {
    key: "carousel-family-table",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1920&q=80",
    filename: "carousel-family-table.jpg",
    alt: "Family planning care at a table",
  },
  {
    key: "carousel-hands-care",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=1920&q=80",
    filename: "carousel-hands-care.jpg",
    alt: "Hands showing family care and support",
  },
  {
    key: "carousel-medical-team",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1920&q=80",
    filename: "carousel-medical-team.jpg",
    alt: "Medical care team in a hallway",
  },
  {
    key: "blog-family-gathering",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1600&q=80",
    filename: "blog-family-gathering.jpg",
    alt: "Family gathering for a care planning story",
  },
  {
    key: "home-feature-costs",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
    filename: "home-feature-costs.jpg",
    alt: "Family reviewing shared care expenses",
  },
  {
    key: "home-feature-calendar",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=80",
    filename: "home-feature-calendar.jpg",
    alt: "Care calendar and planning notes on a desk",
  },
  {
    key: "home-feature-family",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80",
    filename: "home-feature-family.jpg",
    alt: "Family members spending time together",
  },
  {
    key: "home-feature-providers",
    kind: "remote",
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
    filename: "home-feature-providers.jpg",
    alt: "Care provider reviewing a plan with a patient",
  },
];

function filenameForAsset(asset) {
  return asset.kind === "local" ? path.basename(asset.path) : asset.filename;
}

async function findExistingMedia(payload, asset) {
  const filename = filenameForAsset(asset);

  const existing = await payload.find({
    collection: "media",
    limit: 1,
    overrideAccess: true,
    where: {
      or: [
        { alt: { equals: asset.alt } },
        { filename: { equals: filename } },
      ],
    },
  });

  return existing.docs[0];
}

async function downloadRemoteAsset(asset, tempDir) {
  const response = await fetch(asset.url, {
    headers: {
      "User-Agent": "CareShare CMS asset sync",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${asset.url}: ${response.status} ${response.statusText}`);
  }

  const filePath = path.join(tempDir, asset.filename);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(filePath, buffer);
  return filePath;
}

async function resolveAssetPath(asset, tempDir) {
  if (asset.kind === "local") {
    const filePath = path.resolve(projectRoot, asset.path);

    if (!existsSync(filePath)) {
      throw new Error(`Missing local asset: ${asset.path}`);
    }

    return filePath;
  }

  return downloadRemoteAsset(asset, tempDir);
}

export async function syncSiteAssetsToPayload(payload, options = {}) {
  const tempDir = path.join(os.tmpdir(), `careshare-media-${Date.now()}`);
  const results = {
    uploaded: [],
    updated: [],
    skipped: [],
  };

  await mkdir(tempDir, { recursive: true });

  try {
    for (const asset of siteMediaAssets) {
      const existing = await findExistingMedia(payload, asset);

      if (existing && !options.force) {
        await payload.update({
          collection: "media",
          id: existing.id,
          data: { alt: asset.alt },
          overrideAccess: true,
        });
        results.skipped.push({ key: asset.key, id: existing.id });
        continue;
      }

      const filePath = await resolveAssetPath(asset, tempDir);
      const data = { alt: asset.alt };

      if (existing) {
        const doc = await payload.update({
          collection: "media",
          id: existing.id,
          data,
          filePath,
          overwriteExistingFiles: true,
          overrideAccess: true,
        });
        results.updated.push({ key: asset.key, id: doc.id });
        continue;
      }

      const doc = await payload.create({
        collection: "media",
        data,
        filePath,
        overrideAccess: true,
      });
      results.uploaded.push({ key: asset.key, id: doc.id });
    }
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }

  return results;
}

async function runStandalone() {
  loadEnvConfig(projectRoot);

  const { getPayload } = await import("payload");
  const { createJiti } = await import("jiti");
  const jiti = createJiti(import.meta.url);
  const configModule = await jiti.import("../payload.config.ts", {
    default: true,
  });
  const payload = await getPayload({ config: configModule });

  try {
    const results = await syncSiteAssetsToPayload(payload, {
      force: process.argv.includes("--force"),
    });

    console.log(
      `Synced site assets to Payload Media: ${results.uploaded.length} uploaded, ${results.updated.length} updated, ${results.skipped.length} already present.`,
    );

    for (const result of [...results.uploaded, ...results.updated]) {
      console.log(`- ${result.key}`);
    }
  } finally {
    await payload.destroy();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runStandalone()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
