import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "../../app/api/user/route";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../lib/db";
import { resetRateLimit } from "../../lib/rate-limit";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => {
  return {
    auth: vi.fn(),
  };
});

// Mock database
vi.mock("../../lib/db", () => {
  return {
    db: {
      user: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
    },
  };
});

describe("User API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimit("rate_limit:user_post:clerk-123");
    resetRateLimit("rate_limit:user_get:clerk-123");
  });

  describe("POST", () => {
    it("should reject unauthorized request", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      
      const req = new Request("http://localhost/api/user", {
        method: "POST",
        body: JSON.stringify({ targetExam: "GATE", targetDate: "2026-12-01" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("should reject invalid inputs", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);
      
      const req = new Request("http://localhost/api/user", {
        method: "POST",
        body: JSON.stringify({ targetExam: "", targetDate: "invalid-date" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should successfully update user profile and return user without ID", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);
      vi.mocked(db.user.upsert).mockResolvedValue({
        id: "internal-id-should-be-hidden",
        targetExam: "GATE Exam",
        targetDate: new Date("2026-12-01"),
      } as any);

      const req = new Request("http://localhost/api/user", {
        method: "POST",
        body: JSON.stringify({ targetExam: "GATE Exam", targetDate: "2026-12-01" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.targetExam).toBe("GATE Exam");
      expect(data.id).toBeUndefined(); // Verify internal ID is encapsulated/hidden
    });
  });

  describe("GET", () => {
    it("should return isNewUser: true if profile is not found", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);
      vi.mocked(db.user.findUnique).mockResolvedValue(null);

      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isNewUser).toBe(true);
      expect(data.user).toBeNull();
    });

    it("should return user details if found", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);
      vi.mocked(db.user.findUnique).mockResolvedValue({
        targetExam: "JEE",
        targetDate: new Date(),
        createdAt: new Date(),
      } as any);

      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isNewUser).toBe(false);
      expect(data.user.targetExam).toBe("JEE");
    });
  });
});
