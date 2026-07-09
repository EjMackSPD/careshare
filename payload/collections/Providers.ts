import type { CollectionConfig } from "payload";
import { contentStaffOnly, isContentStaff, publishedOrContentStaff } from "../access.ts";

const categoryOptions = [
  { label: "Home Health Aide", value: "HOME_HEALTH_AIDE" },
  { label: "Meal Delivery", value: "MEAL_DELIVERY" },
  { label: "Transportation", value: "TRANSPORTATION" },
  { label: "Adult Day Care", value: "ADULT_DAY_CARE" },
  { label: "Respite Care", value: "RESPITE_CARE" },
  { label: "Legal & Financial", value: "LEGAL_FINANCIAL" },
  { label: "Medical Equipment", value: "MEDICAL_EQUIPMENT" },
];

export const Providers: CollectionConfig = {
  slug: "providers",
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "category", "vetted", "_status"],
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
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      options: categoryOptions,
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    { name: "phone", type: "text" },
    { name: "email", type: "text" },
    { name: "website", type: "text" },
    { name: "serviceArea", type: "text" },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "vetted",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Marks this provider as vetted by CareShare staff.",
      },
    },
  ],
};
