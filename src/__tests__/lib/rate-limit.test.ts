import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, resetRateLimit } from "../../lib/rate-limit";

describe("Rate Limiting Utility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetRateLimit("test-key");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests under the limit", () => {
    const key = "test-key";
    
    // Allow 3 requests in a 1-minute window
    let res = rateLimit(key, 3, 60000);
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(2);

    res = rateLimit(key, 3, 60000);
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(1);

    res = rateLimit(key, 3, 60000);
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(0);
  });

  it("should block requests above the limit", () => {
    const key = "test-key";

    rateLimit(key, 2, 60000);
    rateLimit(key, 2, 60000);

    const blockedRes = rateLimit(key, 2, 60000);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetMs).toBeGreaterThan(0);
  });

  it("should reset sliding window after timeout", () => {
    const key = "test-key";

    rateLimit(key, 2, 60000);
    rateLimit(key, 2, 60000);

    // Exceed limit
    let res = rateLimit(key, 2, 60000);
    expect(res.success).toBe(false);

    // Fast-forward 61 seconds
    vi.advanceTimersByTime(61000);

    // Should succeed again
    res = rateLimit(key, 2, 60000);
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(1);
  });
});
