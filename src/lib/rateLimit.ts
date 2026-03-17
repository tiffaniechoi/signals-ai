/**
 * Simple in-memory rate limiter for Next.js API routes.
 *
 * Uses a Map keyed by IP address. Works for single-instance deployments
 * (Vercel hobby, Railway, Render, etc.). For multi-instance deployments
 * replace the Map with a Redis-backed store.
 *
 * Usage:
 *   const allowed = rateLimit(ip, { limit: 10, windowMs: 60_000 });
 *   if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Module-level map persists across requests within the same server instance.
const store = new Map<string, RateLimitRecord>();

interface RateLimitOptions {
  /** Maximum requests allowed within the window. */
  limit: number;
  /** Rolling window in milliseconds. */
  windowMs: number;
}

/**
 * Returns true if the request is within the allowed rate, false if it should
 * be rejected.  Expired windows are reset automatically.
 */
export function rateLimit(ip: string, { limit, windowMs }: RateLimitOptions): boolean {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;

  record.count++;
  return true;
}
