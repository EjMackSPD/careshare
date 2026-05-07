import type { CollectionConfig } from "payload";
import { contentStaffOnly, isContentStaff, publishedOrContentStaff } from "../access.ts";
import { contentPageBlocks, HeroBlock } from "../blocks.ts";
import { revalidatePagePath } from "../hooks/revalidate.ts";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
  },
  access: {
    admin: ({ req: { user } }) => isContentStaff(user),
    create: contentStaffOnly,
    read: publishedOrContentStaff,
    update: contentStaffOnly,
    delete: contentStaffOnly,
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero Block",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              admin: {
                description: "Internal page title used in the admin list.",
              },
            },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              index: true,
              admin: {
                position: "sidebar",
                description: 'Use "home" for the homepage.',
              },
            },
            {
              name: "hero",
              type: "blocks",
              blocks: [HeroBlock],
              minRows: 1,
              maxRows: 1,
              labels: {
                singular: "Hero",
                plural: "Hero",
              },
              admin: {
                initCollapsed: false,
                description: "The primary page hero is a reusable Payload block. Add exactly one hero block.",
              },
            },
          ],
        },
        {
          label: "Content",
          fields: [
            {
              name: "layout",
              type: "blocks",
              required: true,
              blocks: contentPageBlocks,
              admin: {
                description: "Reusable content sections that render below the hero.",
              },
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seo",
              type: "group",
              fields: [
                { name: "title", type: "text" },
                { name: "description", type: "textarea" },
                { name: "image", type: "upload", relationTo: "media" },
                { name: "noIndex", type: "checkbox", defaultValue: false },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidatePagePath(doc);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        await revalidatePagePath(doc);
        return doc;
      },
    ],
  },
};
