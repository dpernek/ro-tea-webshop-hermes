import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp, checkRateLimit } from "@/lib/rate-limiter";

/**
 * Rate-limit admin write operations (POST/PUT/PATCH/DELETE).
 * Returns a 429 NextResponse if limit exceeded, or null to continue.
 */
export function checkRateLimitAdmin(
  req: NextRequest,
  resource: string,
): NextResponse | null {
  const ip = getClientIp(req);
  const key = `admin:${resource}:${ip}`;
  const result = checkRateLimit(key, 30, 60); // 30 writes per minute per resource
  if (result.limited) {
    return NextResponse.json(
      { error: "Previše zahtjeva. Pokušajte ponovno za minutu." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) } },
    );
  }
  return null;
}
