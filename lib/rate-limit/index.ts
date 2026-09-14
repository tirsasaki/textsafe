export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

export interface RateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

type Entry = { count: number; resetAt: number };

class MemoryRateLimiter implements RateLimiter {
  private readonly entries = new Map<string, Entry>();

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const current = this.entries.get(key);
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;
    entry.count += 1;
    this.entries.set(key, entry);

    if (this.entries.size > 10000) {
      for (const [storedKey, stored] of this.entries) {
        if (stored.resetAt <= now) this.entries.delete(storedKey);
      }
    }

    return {
      allowed: entry.count <= limit,
      limit,
      remaining: Math.max(0, limit - entry.count),
      resetAt: entry.resetAt,
    };
  }
}

// Replace this implementation with a shared Upstash Redis limiter in production.
// In-memory counters are best-effort only across serverless instances.
export const rateLimiter: RateLimiter = new MemoryRateLimiter();

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
