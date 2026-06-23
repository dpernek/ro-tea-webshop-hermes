/**
 * Security headers middleware helper.
 * Vercel-compatible — applies to all responses via Next.js middleware.
 *
 * CSP allows:
 *  - stripe.com      (checkout, webhooks)
 *  - vercel.app      (hosting / preview deploys)
 *  - supabase.co     (storage, auth)
 */

export const SECURITY_HEADERS: Record<string, string> = {
  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co https://*.vercel.app",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
  ].join("; "),

  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions policy — disable risky browser features
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
  ].join(", "),
};

/**
 * Apply security headers to a Response or Headers object.
 * Pass an existing response to clone with headers added, or use
 * with NextResponse.next() by passing a Headers instance.
 */
export function applySecurityHeaders(
  headers: Headers,
): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
}

/**
 * Stamp x-robots-tag: noindex on a response (for admin routes).
 */
export function applyNoindex(headers: Headers): void {
  headers.set("X-Robots-Tag", "noindex, nofollow");
}
