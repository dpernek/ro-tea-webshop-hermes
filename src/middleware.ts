import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow auth API and login page through
  if (pathname.startsWith("/api/auth") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  // No valid session → redirect to login
  if (!req.auth) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Session exists but user is not ADMIN → 403
  const role = (req.auth.user as any)?.role;
  if (role !== "ADMIN") {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
