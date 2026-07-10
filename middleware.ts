import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("payload-token")?.value ||
    request.cookies.get("__Secure-payload-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // Preserve where the user was headed so login can send them back.
    loginUrl.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/family/:path*", "/profile/:path*"],
};
