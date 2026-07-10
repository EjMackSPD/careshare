import { prisma } from "@/lib/prisma"
import { generateLoginChallenge } from "@/lib/login-tokens"
import { createLoginSession } from "@/lib/session"
import { sendLoginEmail, sendWelcomeEmail } from "@/lib/email"

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}

// Sends a magic-link + code email for the address if (and only if) a user exists.
// Silent no-op for unknown emails so the endpoint can't be used to enumerate accounts.
export async function requestLoginEmail(
  rawEmail: string,
  callbackUrl?: string | null
) {
  const email = rawEmail.trim().toLowerCase()
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  })
  if (!user) return

  const { token, code } = await generateLoginChallenge(email)

  const params = new URLSearchParams({ token })
  if (callbackUrl) params.set("callbackUrl", callbackUrl)
  const link = `${siteUrl()}/api/auth/magic?${params.toString()}`

  await sendLoginEmail({
    to: email,
    link,
    code,
    isNewUser: !user.emailVerified,
  })
}

// Marks the email verified (first time → also sends the welcome email) and mints
// a login session. Returns the session token to set as the cookie.
export async function finalizeVerifiedLogin(
  rawEmail: string
): Promise<{ userId: string; token: string; expiresAt: Date } | null> {
  const email = rawEmail.trim().toLowerCase()
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, emailVerified: true },
  })
  if (!user) return null

  if (!user.emailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    })
    await sendWelcomeEmail({ to: email, name: user.name })
  }

  const { token, expiresAt } = await createLoginSession(user.id)
  return { userId: user.id, token, expiresAt }
}
