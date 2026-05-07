import { headers as nextHeaders } from "next/headers";
import { OnboardingStatus, UserRole } from "@prisma/client";
import { timingSafeEqual, createHmac } from "crypto";
import type { PayloadRole } from "@/payload/access";
import { getPayloadClient } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { mapPayloadRolesToPrismaRole, syncPayloadUserToPrisma } from "@/payload/hooks/syncUserToPrisma";

export type CareShareUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  roles: PayloadRole[];
  onboardingStatus: OnboardingStatus;
  onboardingStep: number;
  onboardingData?: unknown;
  mustResetPassword?: boolean | null;
};

export type CareShareSession = {
  user: CareShareUser;
};

type PayloadUser = {
  id: string | number;
  email?: string | null;
  name?: string | null;
  roles?: PayloadRole[] | PayloadRole | null;
  onboardingStatus?: OnboardingStatus | null;
  onboardingStep?: number | null;
  onboardingData?: unknown;
  mustResetPassword?: boolean | null;
};

type PayloadTokenClaims = {
  id?: string | number;
  collection?: string;
  exp?: number;
  sid?: string;
};

function normalizeRoles(roles: PayloadUser["roles"]): PayloadRole[] {
  if (Array.isArray(roles)) {
    return roles.length ? roles : ["family-member"];
  }

  return roles ? [roles] : ["family-member"];
}

export function isOperationalAdmin(user: Pick<CareShareUser, "roles" | "role"> | null | undefined) {
  return Boolean(
    user?.roles.includes("super-admin") ||
      user?.roles.includes("support-admin") ||
      user?.role === UserRole.ADMIN
  );
}

export function canAccessPayloadAdmin(user: Pick<CareShareUser, "roles"> | null | undefined) {
  return Boolean(
    user?.roles.includes("super-admin") ||
      user?.roles.includes("content-editor") ||
      user?.roles.includes("support-admin")
  );
}

async function normalizePayloadUser(user: PayloadUser): Promise<CareShareUser | null> {
  if (!user.email) {
    return null;
  }

  const roles = normalizeRoles(user.roles);
  await syncPayloadUserToPrisma({
    id: user.id,
    email: user.email,
    name: user.name,
    roles,
    onboardingStatus: user.onboardingStatus ?? OnboardingStatus.NOT_STARTED,
    onboardingStep: user.onboardingStep ?? 1,
    onboardingData: user.onboardingData,
  });

  const prismaUser = await prisma.user.findUnique({
    where: { id: String(user.id) },
    select: {
      role: true,
      onboardingStatus: true,
      onboardingStep: true,
      onboardingData: true,
    },
  });

  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: prismaUser?.role ?? mapPayloadRolesToPrismaRole(roles),
    roles,
    onboardingStatus:
      prismaUser?.onboardingStatus ?? user.onboardingStatus ?? OnboardingStatus.NOT_STARTED,
    onboardingStep: prismaUser?.onboardingStep ?? user.onboardingStep ?? 1,
    onboardingData: prismaUser?.onboardingData ?? user.onboardingData,
    mustResetPassword: user.mustResetPassword,
  };
}

function getAuthCookie(headers: Headers): string | null {
  const cookieHeader = headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  for (const name of ["payload-token", "__Secure-payload-token"]) {
    const tokenCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

    if (tokenCookie) {
      return decodeURIComponent(tokenCookie.slice(name.length + 1));
    }
  }

  return null;
}

function base64UrlDecode(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

function decodePayloadTokenClaims(token: string): PayloadTokenClaims | null {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return null;
  }

  try {
    const claims = JSON.parse(base64UrlDecode(payload).toString("utf8")) as PayloadTokenClaims;

    if (claims.exp && claims.exp * 1000 < Date.now()) {
      return null;
    }

    if (claims.collection && claims.collection !== "users") {
      return null;
    }

    return claims.id ? claims : null;
  } catch {
    return null;
  }
}

function verifyPayloadToken(token: string): PayloadTokenClaims | null {
  const secret = process.env.PAYLOAD_SECRET;
  const claims = decodePayloadTokenClaims(token);

  if (!secret || !claims) {
    return null;
  }

  const [header, payload, signature] = token.split(".");
  const expectedSignature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  return claims;
}

async function hasValidPayloadSession(claims: PayloadTokenClaims): Promise<boolean> {
  if (!claims.id || !claims.sid) {
    return false;
  }

  const sessions = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `select id
       from payload.users_sessions
      where id = $1
        and _parent_id = $2
        and expires_at > now()
      limit 1`,
    String(claims.sid),
    String(claims.id)
  );

  return sessions.length > 0;
}

async function getUserFromPayloadToken(headers: Headers): Promise<CareShareUser | null> {
  const token = getAuthCookie(headers);

  if (!token) {
    return null;
  }

  try {
    const claims = verifyPayloadToken(token) ?? decodePayloadTokenClaims(token);

    if (!claims?.id || !(await hasValidPayloadSession(claims))) {
      return null;
    }

    const payload = await getPayloadClient();
    const user = await payload.findByID({
      collection: "users",
      id: String(claims.id),
      overrideAccess: true,
    });

    return normalizePayloadUser(user as PayloadUser);
  } catch {
    return null;
  }
}

export async function getPayloadAuthenticatedUser(headers?: Headers): Promise<CareShareUser | null> {
  const payload = await getPayloadClient();
  const authHeaders = headers ?? ((await nextHeaders()) as unknown as Headers);

  try {
    const result = await payload.auth({ headers: authHeaders });

    if (result.user) {
      return normalizePayloadUser(result.user as PayloadUser);
    }
  } catch {
    // Payload's cookie auth can fail during local/server route requests even when
    // the login token itself is valid, so fall through to explicit JWT validation.
  }

  return getUserFromPayloadToken(authHeaders);
}

export async function auth(): Promise<CareShareSession | null> {
  const user = await getPayloadAuthenticatedUser();
  return user ? { user } : null;
}
