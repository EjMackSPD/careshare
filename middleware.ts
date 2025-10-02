import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define protected routes
  const isAdminRoute = pathname.startsWith("/admin")
  const isProtectedRoute = 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/family")

  // Get session token from cookies
  const sessionToken = request.cookies.get("authjs.session-token")?.value || 
                      request.cookies.get("__Secure-authjs.session-token")?.value

  // Redirect to login if not authenticated
  if (!sessionToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // For admin routes, we'll let the server-side check handle it
  // since we can't decode JWT in Edge Runtime without heavy dependencies
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/family/:path*"],
}

