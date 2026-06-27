/**
 * Simple in-memory token-bucket rate limiter.
 * Vercel-compatible: resets are per-instance; under heavy load
 * multiple cold starts provide reasonable protection.
 *
 * Each bucket has:
 *  - maxTokens: burst capacity
 *  - refillInterval: time window in seconds (bucket fully refills after this)
 *
 * Usage:
 *   const limiter = rateLimiter({ maxTokens: 5, windowSec: 15 });
 *   const { allowed, remaining, reset } = limiter.check(ip);
 *   if (!allowed) return rateLimitedResponse();
 */

interface BucketConfig {
  maxTokens: number;
  windowSec: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // unix timestamp when bucket refills
}

interface BucketState {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, BucketState>();

// Clean up stale entries every 5 minutes (won't grow unbounded)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  // Remove entries inactive for > 10 minutes
  const cutoff = now - 10 * 60 * 1000;
  for (const [key, state] of store) {
    if (state.lastRefill < cutoff) {
      store.delete(key);
    }
  }
}

export function createRateLimiter(config: BucketConfig) {
  const refillRate = config.maxTokens / config.windowSec; // tokens per second

  return {
    check(key: string): RateLimitResult {
      cleanup();

      const nowSec = Date.now() / 1000;
      let bucket = store.get(key);

      if (!bucket) {
        bucket = { tokens: config.maxTokens, lastRefill: nowSec };
        store.set(key, bucket);
      }

      // Refill tokens based on elapsed time
      const elapsed = nowSec - bucket.lastRefill;
      const refill = elapsed * refillRate;
      bucket.tokens = Math.min(config.maxTokens, bucket.tokens + refill);
      bucket.lastRefill = nowSec;

      // Consume one token
      if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        const remaining = Math.floor(bucket.tokens);
        const reset = Math.ceil(nowSec + (config.maxTokens - bucket.tokens) / refillRate);
        store.set(key, bucket);
        return { allowed: true, remaining, reset };
      }

      // Rate limited
      const reset = Math.ceil(nowSec + config.windowSec - elapsed);
      store.set(key, bucket);
      return { allowed: false, remaining: 0, reset };
    },
  };
}

// ---------------------------------------------------------------------------
// Pre-configured limiters for each endpoint
// ---------------------------------------------------------------------------

/** Admin login: 5 requests per 15 seconds */
export const loginLimiter = createRateLimiter({ maxTokens: 5, windowSec: 15 });

/** Checkout: 10 requests per 60 seconds */
export const checkoutLimiter = createRateLimiter({ maxTokens: 10, windowSec: 60 });

/** Contact form: 3 requests per 60 seconds */
export const contactLimiter = createRateLimiter({ maxTokens: 3, windowSec: 60 });

/** File upload: 20 requests per 60 seconds */
export const uploadLimiter = createRateLimiter({ maxTokens: 20, windowSec: 60 });

/** Admin write routes: 60 requests per 60 seconds */
export const adminWriteLimiter = createRateLimiter({ maxTokens: 60, windowSec: 60 });

/** Coupon validation: 30 requests per 60 seconds */
export const couponValidateLimiter = createRateLimiter({ maxTokens: 30, windowSec: 60 });

/**
 * Extract a semi-stable client key from the request.
 * Uses X-Forwarded-For (Vercel), falling back to request metadata.
 */
export function getClientKey(request: Request): string {
  // Vercel sets x-forwarded-for with the real client IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP in the chain (client)
    return forwarded.split(",")[0].trim();
  }

  // Fall back to x-real-ip (some proxies)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Last resort: use a combination of headers for semi-stable identification
  const ua = request.headers.get("user-agent") || "unknown";
  const acceptLang = request.headers.get("accept-language") || "unknown";
  return `fallback:${ua.slice(0, 50)}:${acceptLang.slice(0, 30)}`;
}
