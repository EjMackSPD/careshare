import { randomBytes, createHash, timingSafeEqual } from "crypto"
import { prisma } from "@/lib/prisma"

const TOKEN_TTL_MS = 15 * 60 * 1000
const MAX_CODE_ATTEMPTS = 5
const MAX_REQUESTS_PER_HOUR = 5

export class RateLimitError extends Error {}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex")
const normalizeEmail = (email: string) => email.trim().toLowerCase()

function generateCode(): string {
  // 6-digit, zero-padded.
  return (randomBytes(4).readUInt32BE(0) % 1_000_000).toString().padStart(6, "0")
}

// Creates a single-use login/verification challenge for the email and returns the
// plaintext link token + code to send by email. Rate-limited per email.
export async function generateLoginChallenge(
  rawEmail: string
): Promise<{ token: string; code: string }> {
  const email = normalizeEmail(rawEmail)

  const recentCount = await prisma.loginToken.count({
    where: { email, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
  })
  if (recentCount >= MAX_REQUESTS_PER_HOUR) {
    throw new RateLimitError("Too many login requests")
  }

  // Invalidate any still-active challenges for this email so only the newest works.
  await prisma.loginToken.updateMany({
    where: { email, consumedAt: null },
    data: { consumedAt: new Date() },
  })

  const token = randomBytes(32).toString("base64url")
  const code = generateCode()

  await prisma.loginToken.create({
    data: {
      email,
      tokenHash: sha256(token),
      codeHash: sha256(code),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  })

  return { token, code }
}

// Validates a magic-link token; consumes it and returns the email on success.
export async function consumeByToken(rawToken: string): Promise<string | null> {
  if (!rawToken) return null
  const row = await prisma.loginToken.findUnique({
    where: { tokenHash: sha256(rawToken) },
  })
  if (!row || row.consumedAt || row.expiresAt.getTime() < Date.now()) return null

  await prisma.loginToken.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  })
  return row.email
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex")
  const bufB = Buffer.from(b, "hex")
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

// Validates a 6-digit code for the email; consumes on success, counts attempts
// and locks the challenge after too many wrong tries.
export async function consumeByCode(
  rawEmail: string,
  code: string
): Promise<string | null> {
  const email = normalizeEmail(rawEmail)
  const row = await prisma.loginToken.findFirst({
    where: { email, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  })
  if (!row) return null

  if (row.attempts >= MAX_CODE_ATTEMPTS) {
    await prisma.loginToken.update({
      where: { id: row.id },
      data: { consumedAt: new Date() },
    })
    return null
  }

  if (!code || !safeEqualHex(sha256(code), row.codeHash)) {
    await prisma.loginToken.update({
      where: { id: row.id },
      data: {
        attempts: { increment: 1 },
        // Lock immediately once this failure hits the cap.
        consumedAt: row.attempts + 1 >= MAX_CODE_ATTEMPTS ? new Date() : null,
      },
    })
    return null
  }

  await prisma.loginToken.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  })
  return row.email
}
