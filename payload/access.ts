import type { Access, FieldAccess } from "payload";

export type PayloadRole =
  | "super-admin"
  | "content-editor"
  | "support-admin"
  | "family-member";

type RoleCarrier = {
  roles?: PayloadRole[] | PayloadRole | null;
} | null | undefined;

const normalizeRoles = (user: RoleCarrier): PayloadRole[] => {
  const roles = user?.roles;

  if (Array.isArray(roles)) {
    return roles;
  }

  return roles ? [roles] : [];
};

export const hasRole = (user: RoleCarrier, roles: PayloadRole[]) =>
  normalizeRoles(user).some((role) => roles.includes(role));

export const isSuperAdmin = (user: RoleCarrier) => hasRole(user, ["super-admin"]);

export const isContentStaff = (user: RoleCarrier) =>
  hasRole(user, ["super-admin", "content-editor"]);

export const isSupportStaff = (user: RoleCarrier) =>
  hasRole(user, ["super-admin", "support-admin"]);

export const isPayloadStaff = (user: RoleCarrier) =>
  hasRole(user, ["super-admin", "content-editor", "support-admin"]);

export const contentStaffOnly: Access = ({ req: { user } }) => isContentStaff(user);

export const supportStaffOnly: Access = ({ req: { user } }) => isSupportStaff(user);

export const payloadStaffOnly: Access = ({ req: { user } }) => isPayloadStaff(user);

export const superAdminOnly: Access = ({ req: { user } }) => isSuperAdmin(user);

export const publishedOrContentStaff: Access = ({ req: { user } }) => {
  if (isContentStaff(user)) {
    return true;
  }

  return {
    _status: {
      equals: "published",
    },
  };
};

export const readOwnOrSupportStaff: Access = ({ req: { user } }) => {
  if (!user) {
    return false;
  }

  if (isSupportStaff(user)) {
    return true;
  }

  return {
    id: {
      equals: user.id,
    },
  };
};

export const protectRoleField: FieldAccess = ({ req: { user } }) => isSuperAdmin(user);
