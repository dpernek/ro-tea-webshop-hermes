import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth API and login page
  if (pathname.startsWith("/api/auth") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect /admin routes - check for auth session cookie
  if (pathname.startsWith("/admin")) {
    const hasAuth =
      request.cookies.has("authjs.session-token") ||
      request.cookies.has("__Secure-authjs.session-token");

    if (!hasAuth) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
