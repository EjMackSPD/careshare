import { NextResponse } from "next/server"
import { requestLoginEmail } from "@/lib/login-flow"
import { RateLimitError } from "@/lib/login-tokens"

// POST /api/auth/request-login — email a magic link + 6-digit code.
// Always returns a generic success (no account enumeration).
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === "string" ? body.email : ""
    const callbackUrl =
      typeof body.callbackUrl === "string" ? body.callbackUrl : null

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
    }

    await requestLoginEmail(email, callbackUrl)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a bit and try again." },
        { status: 429 }
      )
    }
    console.error("request-login failed:", error)
    // Still generic to avoid leaking which emails exist.
    return NextResponse.json({ ok: true })
  }
}
