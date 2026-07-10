import { NextResponse } from "next/server"
import { consumeByCode } from "@/lib/login-tokens"
import { finalizeVerifiedLogin } from "@/lib/login-flow"
import { setSessionCookie } from "@/lib/session"
import { sanitizeCallbackUrl } from "@/lib/safe-redirect"

// POST /api/auth/verify-code — validate the 6-digit code, verify the email,
// mint a session cookie, and return where to go next.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === "string" ? body.email : ""
    const code = typeof body.code === "string" ? body.code.trim() : ""
    const callbackUrl =
      typeof body.callbackUrl === "string" ? body.callbackUrl : null

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      )
    }

    const verifiedEmail = await consumeByCode(email, code)
    if (!verifiedEmail) {
      return NextResponse.json(
        { error: "That code is invalid or has expired." },
        { status: 400 }
      )
    }

    const session = await finalizeVerifiedLogin(verifiedEmail)
    if (!session) {
      return NextResponse.json({ error: "Account not found" }, { status: 400 })
    }

    const redirectTo = sanitizeCallbackUrl(callbackUrl) ?? "/auth/post-login"
    const response = NextResponse.json({ ok: true, redirectTo })
    setSessionCookie(response, session.token, session.expiresAt)
    return response
  } catch (error) {
    console.error("verify-code failed:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
