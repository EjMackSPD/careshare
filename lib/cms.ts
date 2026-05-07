import { cache } from "react";
import type { Metadata } from "next";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import type { BlogListItem, CTA, PageSection } from "@/app/components/sections/section-types";

type PayloadDoc = Record<string, any>;

export const getPayloadClient = cache(async () => getPayload({ config: configPromise }));

function textArray(items: Array<{ text?: string } | string> | undefined): string[] | undefined {
  const values = items
    ?.map((item) => (typeof item === "string" ? item : item.text))
    .filter((item): item is string => Boolean(item));

  return values?.length ? values : undefined;
}

function cardColumnCount(value: unknown): 2 | 3 | 4 {
  const count = Number(value);
  return count === 2 || count === 3 || count === 4 ? count : 3;
}

function mapActions(actions: PayloadDoc[] | undefined): CTA[] | undefined {
  const mapped = actions
    ?.map((action) => ({
      href: action.href,
      label: action.label,
      variant: action.variant,
      icon: action.iconKey,
    }))
    .filter((action) => action.href && action.label);

  return mapped?.length ? mapped : undefined;
}

function mediaURL(media: unknown): string | null {
  if (!media) {
    return null;
  }

  if (typeof media === "string") {
    return normalizeMediaURL(media);
  }

  if (typeof media === "object" && "url" in media && typeof media.url === "string") {
    return normalizeMediaURL(media.url);
  }

  return null;
}

function normalizeMediaURL(url: string): string {
  if (url.startsWith("/")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const siteURL = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : null;

    if (parsed.hostname.endsWith(".private.blob.vercel-storage.com")) {
      return `/api/blob?url=${encodeURIComponent(url)}`;
    }

    if (siteURL && parsed.origin === siteURL.origin) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return url;
  }

  return url;
}

function mediaAlt(media: unknown): string | null {
  if (typeof media === "object" && media && "alt" in media && typeof media.alt === "string") {
    return media.alt;
  }

  return null;
}

function mapCMSBlock(block: PayloadDoc): PageSection | null {
  const id = block.sectionId || undefined;

  switch (block.blockType) {
    case "hero": {
      const heroImage = mediaURL(block.media?.image) || block.media?.src;
      const carouselImages = Array.isArray(block.media?.images)
        ? block.media.images
            .map((item: PayloadDoc) => {
              const src = mediaURL(item.image);

              return src
                ? {
                    src,
                    alt: item.alt || mediaAlt(item.image) || block.title,
                  }
                : null;
            })
            .filter(Boolean)
        : [];
      const media =
        block.media?.kind === "carousel" && carouselImages.length
          ? ({ kind: "carousel", images: carouselImages } as const)
          : block.media?.kind === "image" && heroImage
            ? ({
                kind: "image",
                src: heroImage,
                alt: block.media.alt || mediaAlt(block.media.image) || block.title,
              } as const)
            : undefined;

      return {
        id,
        type: "hero",
        variant: block.variant || "marketing",
        theme: block.theme || "light",
        eyebrow: block.eyebrow,
        title: block.title,
        highlight: block.highlight,
        body: block.body,
        actions: mapActions(block.actions),
        media,
      };
    }

    case "featureGrid":
      return {
        id,
        type: "feature-grid",
        title: block.title,
        intro: block.intro,
        layout: block.layout || "cards",
        cardsPerRow: cardColumnCount(block.cardsPerRow),
        background: block.background || "plain",
        items:
          block.items?.map((item: PayloadDoc) => ({
            title: item.title,
            body: item.body,
            image: mediaURL(item.image)
              ? {
                  src: mediaURL(item.image) as string,
                  alt: item.imageAlt || mediaAlt(item.image) || item.title,
                }
              : undefined,
            icon: item.iconKey,
            accentPreset: item.accentPreset,
            bullets: textArray(item.bullets),
          })) ?? [],
      };

    case "stats":
      return {
        id,
        type: "stats",
        title: block.title,
        intro: block.intro,
        variant: block.variant || "metrics",
        background: block.background || "plain",
        items:
          block.items?.map((item: PayloadDoc) => ({
            value: item.value,
            label: item.label,
            description: item.description,
          })) ?? [],
      };

    case "content": {
      const asideImage = mediaURL(block.aside?.image);

      return {
        id,
        type: "content",
        title: block.title,
        intro: block.intro,
        prose: block.prose,
        bullets: textArray(block.bullets),
        actions: mapActions(block.actions),
        aside: block.aside?.title || asideImage
          ? {
              title: block.aside.title,
              body: block.aside.body,
              image: asideImage
                ? {
                    src: asideImage,
                    alt: block.aside.imageAlt || mediaAlt(block.aside.image) || block.aside.title || block.title || "",
                  }
                : undefined,
              actions: mapActions(block.aside.actions),
              note: block.aside.note,
            }
          : undefined,
        layout: block.layout || "centered",
        background: block.background || "plain",
      };
    }

    case "cta":
      return {
        id,
        type: "cta",
        title: block.title,
        body: block.body,
        actions: mapActions(block.actions) ?? [],
        note: block.note,
        theme: block.theme || "brand",
        pattern: block.pattern || "softGrid",
      };

    case "media": {
      const src = mediaURL(block.image);

      return src
        ? {
            id,
            type: "media",
            src,
            alt: block.alt || mediaAlt(block.image) || "",
            caption: block.caption,
            layout: block.layout || "contained",
            background: block.background || "plain",
          }
        : null;
    }

    case "testimonial":
      return {
        id,
        type: "testimonial",
        quote: block.quote,
        author: block.author,
        role: block.role,
      };

    case "faq":
      return {
        id,
        type: "faq",
        title: block.title,
        intro: block.intro,
        items:
          block.items?.map((item: PayloadDoc) => ({
            question: item.question,
            answer: item.answer,
          })) ?? [],
      };

    case "legalArticle":
      return {
        id,
        type: "legal-article",
        title: block.title,
        lastUpdated: block.lastUpdated,
        intro: block.intro,
        sections:
          block.sections?.map((item: PayloadDoc) => ({
            anchor: item.anchor,
            title: item.title,
            icon: item.iconKey,
            body: item.body,
            bullets: textArray(item.bullets),
          })) ?? [],
      };

    case "contactForm":
      return {
        id,
        type: "contact-form",
        title: block.title,
        intro: block.intro,
        inquiryTypes:
          block.inquiryTypes?.map((item: PayloadDoc) => ({
            label: item.label,
            value: item.value,
          })) ?? undefined,
        contactCards:
          block.contactCards?.map((card: PayloadDoc) => ({
            title: card.title,
            body: card.body,
            href: card.href,
            icon: card.iconKey,
            note: card.note,
          })) ?? undefined,
      };

    case "partnershipCards":
      return {
        id,
        type: "partnership-cards",
        title: block.title,
        intro: block.intro,
        items:
          block.items?.map((item: PayloadDoc) => ({
            title: item.title,
            subtitle: item.subtitle,
            body: item.body,
            icon: item.iconKey,
            bullets: textArray(item.bullets),
            actions: mapActions(item.actions),
          })) ?? [],
      };

    case "blogArchive":
      return {
        id,
        type: "blog-archive",
        title: block.title,
        intro: block.intro,
      };

    default:
      return null;
  }
}

export function mapCMSLayout(layout: PayloadDoc[] | undefined): PageSection[] {
  return layout?.map(mapCMSBlock).filter((section): section is PageSection => Boolean(section)) ?? [];
}

export function mapCMSPageSections(page: PayloadDoc): PageSection[] {
  const heroSections = mapCMSLayout(page.hero);
  const layoutSections = mapCMSLayout(page.layout);

  if (heroSections.length) {
    return [heroSections[0], ...layoutSections.filter((section) => section.type !== "hero")];
  }

  return layoutSections;
}

export async function getPageBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: "published" } },
      ],
    },
  });

  return result.docs[0] ?? null;
}

export async function getPublishedPosts(limit = 12): Promise<BlogListItem[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit,
    overrideAccess: false,
    sort: "-publishedAt",
    where: {
      _status: {
        equals: "published",
      },
    },
  });

  return result.docs.map(mapPostForList);
}

export async function getPublishedPostBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: "published" } },
      ],
    },
  });

  return result.docs[0] ?? null;
}

export async function getRelatedPosts(post: PayloadDoc, limit = 3): Promise<BlogListItem[]> {
  const explicit = Array.isArray(post.relatedPosts)
    ? post.relatedPosts
        .filter((related: unknown): related is PayloadDoc => typeof related === "object" && related !== null)
        .map(mapPostForList)
        .slice(0, limit)
    : [];

  if (explicit.length) {
    return explicit;
  }

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit,
    overrideAccess: false,
    sort: "-publishedAt",
    where: {
      and: [
        { category: { equals: post.category } },
        { slug: { not_equals: post.slug } },
        { _status: { equals: "published" } },
      ],
    },
  });

  return result.docs.map(mapPostForList);
}

export function mapPostForList(post: PayloadDoc): BlogListItem {
  return {
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    authorTitle: post.authorTitle,
    coverImage: mediaURL(post.coverImage) || post.coverImageUrl,
    readTime: post.readTime,
    publishedAt: post.publishedAt,
  };
}

export function pageMetadata(page: PayloadDoc | null, fallback: Metadata = {}): Metadata {
  if (!page) {
    return fallback;
  }

  const title = page.seo?.title || page.title || fallback.title;
  const description = page.seo?.description || fallback.description;
  const image = mediaURL(page.seo?.image);

  return {
    ...fallback,
    title,
    description,
    openGraph: {
      ...fallback.openGraph,
      title: typeof title === "string" ? title : undefined,
      description: typeof description === "string" ? description : undefined,
      images: image ? [{ url: image }] : fallback.openGraph?.images,
    },
    robots: page.seo?.noIndex ? { index: false, follow: false } : fallback.robots,
  };
}

export function postMetadata(post: PayloadDoc | null): Metadata {
  if (!post) {
    return {};
  }

  const title = post.seo?.title || post.title;
  const description = post.seo?.description || post.excerpt;
  const image = mediaURL(post.seo?.image) || mediaURL(post.coverImage) || post.coverImageUrl;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    robots: post.seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}
