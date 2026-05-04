import type { CollectionConfig } from "payload";
import { contentStaffOnly, isContentStaff, publishedOrContentStaff } from "../access.ts";
import { pageBlocks } from "../blocks.ts";
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
      name: "title",
      type: "text",
      required: true,
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
      name: "layout",
      type: "blocks",
      required: true,
      blocks: pageBlocks,
    },
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
