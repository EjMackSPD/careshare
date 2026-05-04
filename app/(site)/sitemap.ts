import type { MetadataRoute } from "next";
import { getPayloadClient } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://careshare.vercel.app";

  try {
    const payload = await getPayloadClient();
    const [pages, posts] = await Promise.all([
      payload.find({
        collection: "pages",
        limit: 100,
        overrideAccess: false,
        where: {
          _status: {
            equals: "published",
          },
        },
      }),
      payload.find({
        collection: "posts",
        limit: 100,
        overrideAccess: false,
        where: {
          _status: {
            equals: "published",
          },
        },
      }),
    ]);

    const pageEntries: MetadataRoute.Sitemap = pages.docs.map((page: any) => ({
      url: page.slug === "home" ? baseUrl : `${baseUrl}/${page.slug}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
      changeFrequency: page.slug === "blog" ? "daily" : "weekly",
      priority: page.slug === "home" ? 1 : 0.8,
    }));

    const postEntries: MetadataRoute.Sitemap = posts.docs.map((post: any) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [
      ...pageEntries,
      ...postEntries,
      {
        url: `${baseUrl}/login`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.5,
      },
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }
}
