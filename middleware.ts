import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const token = req.auth
  const isLoggedIn = !!token
  const isAdmin = token?.role === "ADMIN"
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isProtectedRoute = 
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/family")

  // Redirect to login if not authenticated
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Redirect non-admin users away from admin routes
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/family/:path*"],
}

