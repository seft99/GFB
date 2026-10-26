export type RateLimiter = { consume(key: string): Promise<boolean> };

/**
 * Sliding-window limiter held in process memory. It only protects a single long-lived
 * server; on serverless platforms each instance has its own memory, so production must
 * swap this for a shared store (e.g. Upstash Redis) behind the same interface.
 */
export function createMemoryRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    async consume(key) {
      const now = Date.now();
      const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      hits.set(key, [...recent, now]);
      return true;
    }
  };
}
