import type { CollectionConfig } from "payload";
import { contentStaffOnly, isContentStaff } from "../access.ts";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "hero",
        width: 1600,
        height: 900,
        position: "centre",
      },
    ],
  },
  admin: {
    group: "Content",
    useAsTitle: "alt",
  },
  access: {
    admin: ({ req: { user } }) => isContentStaff(user),
    create: contentStaffOnly,
    read: () => true,
    update: contentStaffOnly,
    delete: contentStaffOnly,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
};
