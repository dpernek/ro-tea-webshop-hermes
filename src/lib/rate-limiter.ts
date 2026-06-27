import "server-only";

/**
 * Sliding-window in-memory rate limiter.
 * Keyed by IP or user identity, uses minutes as time unit.
 * Suitable for serverless with single-instance deployments.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

// Clean up expired entries every 60 seconds
let lastCleanup = Date.now();
function cleanup() {
  if (Date.now() - lastCleanup < 60000) return;
  lastCleanup = Date.now();
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

function getKey(key: string): WindowEntry {
  cleanup();
  let entry = store.get(key);
  const now = Date.now();
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + 60000 };
    store.set(key, entry);
  }
  return entry;
}

/**
 * Check if a key is rate limited. Returns { limited: boolean, remaining: number }.
 * @param key - unique identifier (ip, email, ip+email, etc.)
 * @param maxRequests - max allowed in current window
 * @param windowSeconds - window duration in seconds (default 60)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number = 60,
): { limited: boolean; remaining: number; resetAt: number } {
  const entry = getKey(key);
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (entry.resetAt <= now) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    return { limited: false, remaining: maxRequests - 1, resetAt: entry.resetAt };
  }

  entry.count++;
  const remaining = maxRequests - entry.count;
  return { limited: remaining < 0, remaining: Math.max(0, remaining), resetAt: entry.resetAt };
}

/**
 * Check brute-force login attempt against IP and email.
 * Returns whether the attempt is blocked, and metadata for response.
 */
export function checkLoginBruteForce(
  ip: string,
  email: string,
): { blocked: boolean; remaining: number; blockSeconds: number } {
  // Per-IP: max 10 attempts per minute
  const ipLimit = checkRateLimit(`login:ip:${ip}`, 10, 60);
  // Per-email: max 5 attempts per minute
  const emailLimit = checkRateLimit(`login:email:${email.toLowerCase()}`, 5, 60);

  const blocked = ipLimit.limited || emailLimit.limited;
  const remaining = Math.min(ipLimit.remaining, emailLimit.remaining);
  return { blocked, remaining, blockSeconds: blocked ? 60 : 0 };
}

/**
 * Apply rate limiting to an API route handler.
 * Returns 429 if limit exceeded.
 */
export async function withRateLimit(
  ip: string,
  resource: string,
  maxRequests: number,
  windowSeconds: number = 60,
): Promise<Response | null> {
  const key = `api:${resource}:${ip}`;
  const result = checkRateLimit(key, maxRequests, windowSeconds);
  if (result.limited) {
    return new Response(
      JSON.stringify({
        error: "Previše zahtjeva. Pokušajte ponovno za minutu.",
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }
  return null;
}

/**
 * Get client IP from NextRequest headers.
 * Handles Vercel's x-forwarded-for and x-real-ip.
 */
export function getClientIp(req: { headers: Headers }): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}
