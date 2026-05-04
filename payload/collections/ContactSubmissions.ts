import type { CollectionConfig } from "payload";
import { isSupportStaff, supportStaffOnly, superAdminOnly } from "../access.ts";

export const ContactSubmissions: CollectionConfig = {
  slug: "contact-submissions",
  admin: {
    group: "Operations",
    useAsTitle: "subject",
    defaultColumns: ["name", "email", "type", "status", "createdAt"],
  },
  access: {
    admin: ({ req: { user } }) => isSupportStaff(user),
    create: () => true,
    read: supportStaffOnly,
    update: supportStaffOnly,
    delete: superAdminOnly,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "general",
      options: [
        { label: "General Question", value: "general" },
        { label: "Technical Support", value: "support" },
        { label: "Partnership Opportunity", value: "partnership" },
        { label: "Press & Media", value: "press" },
        { label: "Product Feedback", value: "feedback" },
      ],
    },
    { name: "subject", type: "text", required: true },
    { name: "message", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "In Progress", value: "in-progress" },
        { label: "Closed", value: "closed" },
      ],
      admin: {
        position: "sidebar",
      },
    },
  ],
};
