import type { CollectionConfig } from "payload";
import { randomUUID } from "crypto";
import { OnboardingStatus } from "@prisma/client";
import {
  isPayloadStaff,
  isSupportStaff,
  isSuperAdmin,
  protectRoleField,
  readOwnOrSupportStaff,
} from "../access.ts";
import { syncUserToPrismaAfterChange } from "../hooks/syncUserToPrisma.ts";
import { renderPasswordResetEmailHTML, passwordResetEmailSubject } from "../../lib/payload-email.ts";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutes
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        return renderPasswordResetEmailHTML({
          resetUrl: `${siteUrl}/reset-password?token=${token}`,
        });
      },
      generateEmailSubject: () => passwordResetEmailSubject(),
    },
  },
  admin: {
    useAsTitle: "email",
    group: "People & Access",
    defaultColumns: ["email", "name", "roles", "mustResetPassword"],
  },
  access: {
    admin: ({ req: { user } }) => isPayloadStaff(user),
    create: ({ req: { user } }) => isSuperAdmin(user),
    read: readOwnOrSupportStaff,
    update: ({ req: { user }, id }) => {
      if (!user) {
        return false;
      }

      if (isSupportStaff(user)) {
        return true;
      }

      return String(user.id) === String(id);
    },
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  fields: [
    {
      name: "id",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "name",
      type: "text",
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["family-member"],
      access: {
        create: protectRoleField,
        update: protectRoleField,
      },
      options: [
        { label: "Super Admin", value: "super-admin" },
        { label: "Content Editor", value: "content-editor" },
        { label: "Support Admin", value: "support-admin" },
        { label: "Family Member", value: "family-member" },
      ],
    },
    {
      name: "mustResetPassword",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "onboardingStatus",
      type: "select",
      defaultValue: OnboardingStatus.NOT_STARTED,
      options: [
        { label: "Not Started", value: OnboardingStatus.NOT_STARTED },
        { label: "In Progress", value: OnboardingStatus.IN_PROGRESS },
        { label: "Completed", value: OnboardingStatus.COMPLETED },
      ],
    },
    {
      name: "onboardingStep",
      type: "number",
      defaultValue: 1,
      min: 1,
    },
    {
      name: "onboardingData",
      type: "json",
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.id) {
          data.id = randomUUID();
        }

        if (data?.roles && Array.isArray(data.roles) && data.roles.length === 0) {
          data.roles = ["family-member"];
        }

        return data;
      },
    ],
    afterChange: [syncUserToPrismaAfterChange],
  },
};
