interface RateLimitWindow {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitWindow>();

/**
 * Simple in-memory sliding window rate limiter.
 * Blocks requests when limit is exceeded in a sliding window.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Filter out timestamps outside the current sliding window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetMs = oldestTimestamp + windowMs - now;
    return {
      success: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  record.timestamps.push(now);
  
  return {
    success: true,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Resets the rate limit for a key (mainly for testing purposes).
 */
export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}
