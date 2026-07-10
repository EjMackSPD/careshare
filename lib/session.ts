import { randomUUID, createHmac } from "crypto"
import type { NextResponse } from "next/server"
import { getPayloadClient } from "@/lib/cms"

// Matches the Users collection `tokenExpiration` (7 days) and payload.config secret.
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7
export const SESSION_COOKIE = "payload-token"

// Same resolution order as payload.config.ts, so a token we sign is accepted by
// Payload's own auth() as well as the manual validator in lib/auth.ts.
function getPayloadSecret(): string {
  return (
    process.env.PAYLOAD_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-only-payload-secret-change-me"
  )
}

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url")
}

function signPayloadToken(claims: Record<string, unknown>): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = base64url(JSON.stringify(claims))
  const signature = createHmac("sha256", getPayloadSecret())
    .update(`${header}.${payload}`)
    .digest("base64url")
  return `${header}.${payload}.${signature}`
}

// Creates a real Payload session for the user (no password) and returns a signed
// payload-token JWT that both Payload and lib/auth.ts will accept.
export async function createLoginSession(
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  const payload = await getPayloadClient()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_SECONDS * 1000)
  const sid = randomUUID()

  const user = (await payload.findByID({
    collection: "users",
    id: userId,
    overrideAccess: true,
    depth: 0,
  })) as { email?: string; sessions?: Array<Record<string, unknown>> }

  const existingSessions = Array.isArray(user.sessions) ? user.sessions : []

  await payload.update({
    collection: "users",
    id: userId,
    overrideAccess: true,
    data: {
      sessions: [
        ...existingSessions,
        {
          id: sid,
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      ],
    } as never,
  })

  const token = signPayloadToken({
    id: userId,
    collection: "users",
    email: user.email,
    sid,
    iat: Math.floor(now.getTime() / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
  })

  return { token, expiresAt }
}

// Sets the auth cookie on a NextResponse, matching Payload's cookie attributes.
export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date
) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
}
