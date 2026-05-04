import type { CollectionConfig } from "payload";
import { contentStaffOnly, isContentStaff, publishedOrContentStaff } from "../access.ts";
import { revalidatePostPath } from "../hooks/revalidate.ts";

const categoryOptions = [
  { label: "Caregiving Tips", value: "CAREGIVING_TIPS" },
  { label: "Family Stories", value: "FAMILY_STORIES" },
  { label: "Health & Wellness", value: "HEALTH_WELLNESS" },
  { label: "Financial Planning", value: "FINANCIAL_PLANNING" },
  { label: "Technology", value: "TECHNOLOGY" },
  { label: "Legal Matters", value: "LEGAL_MATTERS" },
  { label: "Company News", value: "COMPANY_NEWS" },
];

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "_status", "publishedAt"],
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
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar" },
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
    },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "CAREGIVING_TIPS",
      options: categoryOptions,
    },
    {
      name: "author",
      type: "text",
      required: true,
      defaultValue: "CareShare Team",
    },
    { name: "authorTitle", type: "text" },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "coverImageUrl",
      type: "text",
      admin: {
        description: "Legacy fallback only. Prefer Cover Image from Payload Media.",
      },
    },
    {
      name: "content",
      type: "textarea",
      required: true,
      admin: {
        rows: 18,
      },
    },
    {
      name: "readTime",
      type: "number",
      defaultValue: 5,
      min: 1,
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "relatedPosts",
      type: "relationship",
      relationTo: "posts",
      hasMany: true,
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
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" && data._status === "published" && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc }) => {
        await revalidatePostPath(doc);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        await revalidatePostPath(doc);
        return doc;
      },
    ],
  },
};
