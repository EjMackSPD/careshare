import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { consumeByToken } from "@/lib/login-tokens"
import { finalizeVerifiedLogin } from "@/lib/login-flow"
import { setSessionCookie } from "@/lib/session"
import { sanitizeCallbackUrl } from "@/lib/safe-redirect"

// GET /api/auth/magic?token=…&callbackUrl=… — one-click magic-link login.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || ""
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl")

  const fail = () =>
    NextResponse.redirect(new URL("/login?error=link_expired", request.url))

  try {
    const email = await consumeByToken(token)
    if (!email) return fail()

    const session = await finalizeVerifiedLogin(email)
    if (!session) return fail()

    const safe = sanitizeCallbackUrl(callbackUrl)
    const postLogin = new URL("/auth/post-login", request.url)
    if (safe) postLogin.searchParams.set("callbackUrl", safe)

    const response = NextResponse.redirect(postLogin)
    setSessionCookie(response, session.token, session.expiresAt)
    return response
  } catch (error) {
    console.error("magic-link login failed:", error)
    return fail()
  }
}
