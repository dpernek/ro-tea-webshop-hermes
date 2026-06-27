import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import {
  applySecurityHeaders,
  applyNoindex,
} from "@/lib/proxy";
import {
  loginLimiter,
  checkoutLimiter,
  contactLimiter,
  uploadLimiter,
  adminWriteLimiter,
  couponValidateLimiter,
  getClientKey,
} from "@/lib/rate-limit";

function rateLimitedResponse(
  headers: Headers,
  retryAfterSec: number
): NextResponse {
  headers.set("Retry-After", String(retryAfterSec));
  headers.set("Content-Type", "application/json");
  return new NextResponse(
    JSON.stringify({ error: "Previše zahtjeva. Pokušajte ponovno kasnije." }),
    { status: 429, headers }
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Security headers on EVERY response ──────────────────────────
  const headers = new Headers();
  applySecurityHeaders(headers);

  // ── 2. Rate limiting for sensitive endpoints ───────────────────────
  const clientKey = getClientKey(request);

  // Admin login (POST to NextAuth credentials endpoint)
  // Dual-layer rate-limit: per IP and per IP+email (brute-force protection)
  if (
    request.method === "POST" &&
    pathname === "/api/auth/callback/credentials"
  ) {
    // Per-IP limit
    const { allowed: ipAllowed, reset: ipReset } = loginLimiter.check(clientKey);
    if (!ipAllowed) {
      const retryAfter = Math.max(1, Math.ceil(ipReset - Date.now() / 1000));
      return rateLimitedResponse(headers, retryAfter);
    }

    // Per-IP+email limit (extract email from body)
    try {
      const cloned = request.clone();
      const body = await cloned.json().catch(() => ({}));
      const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
      if (email) {
        const emailKey = `${clientKey}:email:${email}`;
        const { allowed: emailAllowed, reset: emailReset } = loginLimiter.check(emailKey);
        if (!emailAllowed) {
          const retryAfter = Math.max(1, Math.ceil(emailReset - Date.now() / 1000));
          return rateLimitedResponse(headers, retryAfter);
        }
      }
    } catch {
      // Body parse failed — fall through (IP limit still applies)
    }
  }

  // Checkout
  if (
    request.method === "POST" &&
    pathname === "/api/stripe/create-checkout-session"
  ) {
    const { allowed, reset } = checkoutLimiter.check(clientKey);
    if (!allowed) {
      const retryAfter = Math.max(1, Math.ceil(reset - Date.now() / 1000));
      return rateLimitedResponse(headers, retryAfter);
    }
  }

  // Contact form
  if (request.method === "POST" && pathname === "/api/contact") {
    const { allowed, reset } = contactLimiter.check(clientKey);
    if (!allowed) {
      const retryAfter = Math.max(1, Math.ceil(reset - Date.now() / 1000));
      return rateLimitedResponse(headers, retryAfter);
    }
  }

  // File upload
  if (
    request.method === "POST" &&
    pathname === "/api/admin/upload"
  ) {
    const { allowed, reset } = uploadLimiter.check(clientKey);
    if (!allowed) {
      const retryAfter = Math.max(1, Math.ceil(reset - Date.now() / 1000));
      return rateLimitedResponse(headers, retryAfter);
    }
  }

  // Admin write routes (POST/PUT/PATCH/DELETE)
  if (
    pathname.startsWith("/api/admin/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)
  ) {
    const { allowed, reset } = adminWriteLimiter.check(clientKey);
    if (!allowed) {
      const retryAfter = Math.max(1, Math.ceil(reset - Date.now() / 1000));
      return rateLimitedResponse(headers, retryAfter);
    }
  }

  // Coupon validation
  if (
    request.method === "POST" &&
    pathname === "/api/coupons/validate"
  ) {
    const { allowed, reset } = couponValidateLimiter.check(clientKey);
    if (!allowed) {
      const retryAfter = Math.max(1, Math.ceil(reset - Date.now() / 1000));
      return rateLimitedResponse(headers, retryAfter);
    }
  }

  // ── 3. Admin routes: auth + noindex ────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Noindex all admin pages
    applyNoindex(headers);

    // Allow auth API and login page through without auth check
    if (pathname.startsWith("/api/auth") || pathname === "/admin/login") {
      const res = NextResponse.next();
      copyHeaders(headers, res);
      return res;
    }

    // Check session
    const session = await auth();

    // No valid session → redirect to login
    if (!session?.user) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      const res = NextResponse.redirect(url);
      copyHeaders(headers, res);
      return res;
    }

    // Session exists but user is not ADMIN → 403
    const role = (session.user as any)?.role;
    if (role !== "ADMIN") {
      const res = new NextResponse("Forbidden", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
      copyHeaders(headers, res);
      return res;
    }
  }

  // ── 4. Pass through with security headers ──────────────────────────
  const response = NextResponse.next();
  copyHeaders(headers, response);
  return response;
}

/** Copy custom headers onto a NextResponse */
function copyHeaders(source: Headers, target: NextResponse): void {
  source.forEach((value, key) => {
    target.headers.set(key, value);
  });
}

/** Match all routes except Next.js internal static assets */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
