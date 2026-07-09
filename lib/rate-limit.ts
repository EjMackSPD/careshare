import { prisma } from "./prisma"

export type RateLimitRule = {
  windowMs: number
  max: number
}

export type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

export async function checkRateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - rule.windowMs)

  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: windowStart } },
  })

  if (count >= rule.max) {
    return { allowed: false, retryAfterSeconds: Math.ceil(rule.windowMs / 1000) }
  }

  await prisma.rateLimitHit.create({ data: { key } })

  // Opportunistic cleanup so the table doesn't grow unbounded.
  await prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: windowStart } } })

  return { allowed: true, retryAfterSeconds: 0 }
}
